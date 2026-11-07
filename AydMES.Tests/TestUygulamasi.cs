using AydMES.Api.Models;
using AydMES.Api.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace AydMES.Tests;

/// <summary>
/// API'yi gerçek pipeline'ıyla (kimlik doğrulama, yetkilendirme, rate limit, doğrulama) bellekte çalıştırır.
/// SQL Server yerine her örnek için ayrı bir InMemory veritabanı kullanılır; demo kullanıcıları seed edilir.
/// </summary>
public class TestUygulamasi : WebApplicationFactory<Program>
{
    private readonly string _veritabaniAdi = "AydMES_Test_" + Guid.NewGuid();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<MesDbContext>>();
            services.AddDbContext<MesDbContext>(o => o.UseInMemoryDatabase(_veritabaniAdi));

            // Arka plan simülasyonu testleri etkilemesin
            var simulasyon = services.Single(d => d.ImplementationType == typeof(UretimSimulasyonService));
            services.Remove(simulasyon);
        });
    }

    public MesDbContext VeritabaniAc() => Services.CreateScope().ServiceProvider.GetRequiredService<MesDbContext>();
}

internal static class ServisUzantilari
{
    public static void RemoveAll<T>(this IServiceCollection services)
    {
        foreach (var d in services.Where(d => d.ServiceType == typeof(T)).ToList()) services.Remove(d);
    }
}
