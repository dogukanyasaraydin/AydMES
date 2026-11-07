using AydMES.Api.Data;
using AydMES.Api.Models;
using AydMES.Api.Security;
using AydMES.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// ---> JWT AYARLARI (anahtar kaynak kodda değil, yapılandırmada) <---
var jwtAyarlari = builder.Configuration.GetSection(JwtAyarlari.Bolum).Get<JwtAyarlari>() ?? new JwtAyarlari();
if (string.IsNullOrWhiteSpace(jwtAyarlari.Key) && builder.Environment.IsDevelopment())
{
    // Depoda hiçbir anahtar tutulmaz: geliştirmede her açılışta rastgele bir anahtar üretilir.
    // (API yeniden başlatılınca eski token'lar geçersiz olur, tekrar giriş yapmak yeterlidir.)
    // Üretimde anahtar mutlaka Jwt__Key ortam değişkeniyle verilmelidir; verilmezse API açılmaz.
    jwtAyarlari.Key = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(64));
}
// Anahtar eksik/kısaysa API açılırken hemen hata verir (ilk istekte değil).
var imzaAnahtari = jwtAyarlari.ImzaAnahtari();
builder.Services.AddSingleton(jwtAyarlari);

// Tüm endpoint'ler varsayılan olarak giriş ister; açık olanlar [AllowAnonymous] ile işaretlenir.
// GET dışındaki istekler ayrıca "Duzenleyici" rolü ister (Operatör salt-okunur).
builder.Services.AddControllers(options => options.Conventions.Add(new YazmaYetkisiKurali()))
    .ConfigureApiBehaviorOptions(options =>
    {
        // Doğrulama hataları frontend'in gösterebileceği { message, errors } biçiminde döner
        options.InvalidModelStateResponseFactory = ctx =>
        {
            var hatalar = ctx.ModelState
                .Where(x => x.Value?.Errors.Count > 0)
                .ToDictionary(x => x.Key, x => x.Value!.Errors.Select(e => string.IsNullOrEmpty(e.ErrorMessage) ? "Geçersiz değer." : e.ErrorMessage).ToArray());
            var ilkHata = hatalar.Values.SelectMany(h => h).FirstOrDefault() ?? "Geçersiz istek.";
            return new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(new { message = ilkHata, errors = hatalar });
        };
    });
builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
    options.AddPolicy(YazmaYetkisiKurali.Politika, p => p.RequireRole(Roller.Duzenleyiciler));
});

// Kaba kuvvet (brute-force) koruması: aynı IP'den dakikada en fazla 5 giriş denemesi
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("giris", http => RateLimitPartition.GetFixedWindowLimiter(
        http.Connection.RemoteIpAddress?.ToString() ?? "bilinmiyor",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 5, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
});

// SQLITE BAĞLANTISI — veritabanı tek bir dosya (aydmes.db); ayrı bir sunucu kurulumu gerekmez
builder.Services.AddDbContext<MesDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=aydmes.db"));

// ---> JWT AUTHENTICATION (KİMLİK DOĞRULAMA) AYARLARI <---
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = imzaAnahtari,
            ValidateIssuer = true,
            ValidIssuer = jwtAyarlari.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtAyarlari.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1)
        };
        // Token öncelikle httpOnly cookie'den okunur; Authorization: Bearer başlığı da desteklenir (API istemcileri için)
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                if (string.IsNullOrEmpty(ctx.Token) && ctx.Request.Cookies.TryGetValue(OturumCerezi.Ad, out var cerez))
                    ctx.Token = cerez;
                return Task.CompletedTask;
            }
        };
    });

// Arka planda çalışan üretim simülasyon servisi
builder.Services.AddHostedService<UretimSimulasyonService>();

// ---> REACT İÇİN CORS İZNİ (adresler appsettings'ten) <---
var izinliAdresler = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                     ?? new[] { "http://localhost:5173" };
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactIzin", policy =>
        policy.WithOrigins(izinliAdresler).AllowAnyHeader().AllowAnyMethod().AllowCredentials()); // cookie için
});

builder.Services.AddEndpointsApiExplorer();
// Swagger UI API ile aynı adreste çalıştığı için POST /api/Auth/login sonrası oturum cookie'si otomatik kullanılır.
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Yakalanmayan tüm hatalar burada loglanır (ILogger) ve istemciye ayrıntı sızdırmadan tek tip mesaj döner.
// Controller'larda hata yutup sahte veri döndürmek yerine bu merkezi yapı kullanılır.
app.UseExceptionHandler(hata => hata.Run(async ctx =>
{
    ctx.Response.StatusCode = StatusCodes.Status500InternalServerError;
    await ctx.Response.WriteAsJsonAsync(new { message = "Sunucu hatası oluştu. Lütfen tekrar deneyin." });
}));

// Şema onarımı + örnek veri. Veritabanına ulaşılamazsa API yine de açılır (controller'lar varsayılan veri döner).
using (var scope = app.Services.CreateScope())
{
    try
    {
        VeriTohumlayici.Calistir(scope.ServiceProvider.GetRequiredService<MesDbContext>());
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "Veritabanı hazırlanamadı (ConnectionStrings:DefaultConnection).");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    // Üretimde yalnızca HTTPS: HTTP istekleri yönlendirilir, tarayıcıya HSTS bildirilir.
    // (Yerel geliştirmede kolay kurulum için HTTP açık bırakılır.)
    app.UseHsts();
    app.UseHttpsRedirection();
}

// ---> CORS VE GÜVENLİK PİPELİNE SIRALAMASI <---
app.UseCors("ReactIzin");

app.UseAuthentication(); // Önce kim olduğunu doğrula
app.UseAuthorization();  // Sonra yetkisini kontrol et
app.UseRateLimiter();

// Frontend'in "sistem çevrimiçi mi?" kontrolü için giriş gerektirmeyen sağlık endpoint'i
app.MapGet("/api/health", () => Results.Ok(new { durum = "ok", zaman = DateTime.UtcNow }))
   .AllowAnonymous();

app.MapControllers();

app.Run();
public partial class Program { } // Entegrasyon testleri (WebApplicationFactory) için
