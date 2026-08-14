using Microsoft.EntityFrameworkCore;
using AydMES.Api.Models;

namespace AydMES.Api.Services
{
    /// <summary>
    /// Arka planda çalışan üretim simülasyon servisi.
    /// "Çalışıyor" durumundaki makineler için:
    ///   - Her döngüde gerçekçi vuruş ekler (2-5 arası random)
    ///   - %4 ihtimalle fire/hurda üretir
    ///   - Hedefe ulaşınca makineyi "Tamamlandı" yapar
    /// </summary>
    public class UretimSimulasyonService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<UretimSimulasyonService> _logger;
        private static readonly Random _rng = new Random();

        // Her kaç ms'de bir döngü çalışsın (3 saniye)
        private const int DonguSuresiMs = 3000;

        // Fire üretme olasılığı (0.0 - 1.0 arası). 0.04 = %4
        private const double FireOlasiligi = 0.04;

        public UretimSimulasyonService(IServiceScopeFactory scopeFactory, ILogger<UretimSimulasyonService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("✅ Üretim Simülasyon Servisi başlatıldı.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await SimulasyonDongusu();
                }
                catch (Exception ex)
                {
                    _logger.LogError($"[SimulasyonServisi] Hata: {ex.Message}");
                }

                await Task.Delay(DonguSuresiMs, stoppingToken);
            }
        }

        private async Task SimulasyonDongusu()
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();

            // Sadece "Çalışıyor" durumundaki makineleri getir
            var calisan = await db.Makineler
                .Where(m => m.Durum == "Çalışıyor")
                .ToListAsync();

            if (!calisan.Any()) return;

            foreach (var makine in calisan)
            {
                // Hedef girilmemişse (<=0), kendi kendine saymasın! Makineyi duruşa al.
                if (makine.HedefVurus <= 0)
                {
                    makine.Durum = "Planlı duruş";
                    makine.VurusSayisi = 0;
                    _logger.LogInformation($"[{makine.Kod}] Hedef vuruş tanımlanmadığı için makine durduruldu.");
                    continue;
                }

                int hedef = makine.HedefVurus;

                // Hedefe zaten ulaşmışsa "Tamamlandı" yap ve dur
                if (makine.VurusSayisi >= hedef)
                {
                    makine.Durum = "Tamamlandı";
                    _logger.LogInformation($"[{makine.Kod}] Hedef tamamlandı ({hedef}) → Tamamlandı");
                    continue;
                }

                // Gerçekçi vuruş artışı: dakikada ~60-120 vuruş ≈ saniyede 1-2 vuruş
                // 3 saniyelik döngüde 3-7 arası vuruş ekle
                int yeniVurus = _rng.Next(3, 8);

                // Hedefe taşma kontrolü
                int yeniToplam = Math.Min(makine.VurusSayisi + yeniVurus, hedef);
                makine.VurusSayisi = yeniToplam;

                // --- FIRE / HURDA MANTIGI ---
                // Her döngüde %4 ihtimalle 1 adet fire üret
                if (_rng.NextDouble() < FireOlasiligi)
                {
                    makine.HataliAdet = (makine.HataliAdet ?? 0) + 1;
                    _logger.LogInformation($"[{makine.Kod}] 🔴 Fire üretildi! Toplam fire: {makine.HataliAdet}");
                }

                // Fire oranını güncelle
                if (makine.VurusSayisi > 0)
                {
                    makine.FireOrani = Math.Round((double)(makine.HataliAdet ?? 0) / makine.VurusSayisi * 100, 2);
                }

                // Hedefe ulaştıysa tamamlandı yap
                if (makine.VurusSayisi >= hedef)
                {
                    makine.Durum = "Tamamlandı";
                    _logger.LogInformation($"[{makine.Kod}] ✅ Üretim tamamlandı! {hedef} vuruş yapıldı.");
                }
            }

            try
            {
                await db.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // EF Core başarısız olursa ham SQL ile kaydet
                _logger.LogWarning($"[SimulasyonServisi] EF Save başarısız, SQL fallback: {ex.Message}");
                foreach (var makine in calisan)
                {
                    try
                    {
                        await db.Database.ExecuteSqlRawAsync(
                            "UPDATE Makineler SET VurusSayisi = {0}, HataliAdet = {1}, FireOrani = {2}, Durum = {3} WHERE Id = {4}",
                            makine.VurusSayisi, makine.HataliAdet ?? 0, makine.FireOrani, makine.Durum, makine.Id
                        );
                    }
                    catch { }
                }
            }
        }
    }
}
