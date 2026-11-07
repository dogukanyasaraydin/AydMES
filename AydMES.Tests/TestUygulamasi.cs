using AydMES.Api.Models;
using AydMES.Api.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace AydMES.Tests;

/// <summary>
/// API'yi gerçek pipeline'ıyla (kimlik doğrulama, yetkilendirme, rate limit, doğrulama) çalıştırır.
/// Her test örneği için bellekte ayrı bir gerçek SQLite veritabanı açılır; migration'lar uygulanır
/// ve demo kullanıcıları seed edilir. Bağlantı açık kaldığı sürece veritabanı yaşar.
/// </summary>
public class TestUygulamasi : WebApplicationFactory<Program>
{
    private readonly SqliteConnection _baglanti = new("Data Source=:memory:");

    public TestUygulamasi() => _baglanti.Open();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<MesDbContext>>();
            services.AddDbContext<MesDbContext>(o => o.UseSqlite(_baglanti));

            // Arka plan simülasyonu testleri etkilemesin
            var simulasyon = services.Single(d => d.ImplementationType == typeof(UretimSimulasyonService));
            services.Remove(simulasyon);
        });
    }

    public MesDbContext VeritabaniAc() => Services.CreateScope().ServiceProvider.GetRequiredService<MesDbContext>();

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing) _baglanti.Dispose();
    }
}

internal static class ServisUzantilari
{
    public static void RemoveAll<T>(this IServiceCollection services)
    {
        foreach (var d in services.Where(d => d.ServiceType == typeof(T)).ToList()) services.Remove(d);
    }
}
