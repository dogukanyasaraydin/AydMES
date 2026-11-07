using AydMES.Api.Data;
using AydMES.Api.Models;
using AydMES.Api.Security;
using AydMES.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

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
builder.Services.AddControllers();
builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
});

// SQL SERVER BAĞLANTISI
builder.Services.AddDbContext<MesDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

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
    });

// Arka planda çalışan üretim simülasyon servisi
builder.Services.AddHostedService<UretimSimulasyonService>();

// ---> REACT İÇİN CORS İZNİ (adresler appsettings'ten) <---
var izinliAdresler = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                     ?? new[] { "http://localhost:5173" };
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactIzin", policy =>
        policy.WithOrigins(izinliAdresler).AllowAnyHeader().AllowAnyMethod());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    // Swagger UI'da "Authorize" butonu ile token girilebilsin
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "POST /api/Auth/login ile alınan token'ı girin."
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Şema onarımı + örnek veri. Veritabanına ulaşılamazsa API yine de açılır (controller'lar varsayılan veri döner).
using (var scope = app.Services.CreateScope())
{
    try
    {
        VeriTohumlayici.Calistir(scope.ServiceProvider.GetRequiredService<MesDbContext>());
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "Veritabanı hazırlanamadı. Bağlantı cümlesini (ConnectionStrings:DefaultConnection) kontrol edin.");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); // YERELDE HTTP ÇALIŞMASI İÇİN KAPATILDI

// ---> CORS VE GÜVENLİK PİPELİNE SIRALAMASI <---
app.UseCors("ReactIzin");

app.UseAuthentication(); // Önce kim olduğunu doğrula
app.UseAuthorization();  // Sonra yetkisini kontrol et

// Frontend'in "sistem çevrimiçi mi?" kontrolü için giriş gerektirmeyen sağlık endpoint'i
app.MapGet("/api/health", () => Results.Ok(new { durum = "ok", zaman = DateTime.UtcNow }))
   .AllowAnonymous();

app.MapControllers();

app.Run();
