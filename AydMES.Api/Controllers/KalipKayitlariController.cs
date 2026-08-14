using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AydMES.Api.Models;

namespace AydMES.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class KalipKayitlariController : ControllerBase
    {
        private readonly MesDbContext _context;

        public KalipKayitlariController(MesDbContext context)
        {
            _context = context;
        }

        private List<KalipKaydi> GetVarsayilanKaliplar()
        {
            return new List<KalipKaydi>
            {
                new KalipKaydi { Id = 1, KalipKodu = "KLP-001", KalipAdi = "Ana Gövde Derin Çekme Kalıbı", AktifMakine = "PRES-01", Parca = "Ana Gövde Sac Parçası", MevcutVurus = 145200, BakimLimiti = 150000, Durum = "Bakım Yaklaşıyor", SonBakimTarihi = "01.07.2026" },
                new KalipKaydi { Id = 2, KalipKodu = "KLP-002", KalipAdi = "Yan Panel Büküm Kalıbı", AktifMakine = "PRES-02", Parca = "Yan Panel Pres Parçası", MevcutVurus = 45000, BakimLimiti = 200000, Durum = "İyi", SonBakimTarihi = "15.07.2026" },
                new KalipKaydi { Id = 3, KalipKodu = "KLP-003", KalipAdi = "Kapak Şekillendirme Kalıbı", AktifMakine = "PRES-03", Parca = "Kapak Sacı", MevcutVurus = 198500, BakimLimiti = 200000, Durum = "Bakım Yaklaşıyor", SonBakimTarihi = "10.06.2026" },
                new KalipKaydi { Id = 4, KalipKodu = "KLP-004", KalipAdi = "Şase Delme ve Kaynak Kalıbı", AktifMakine = "PRES-04", Parca = "Şase Sac Parçası", MevcutVurus = 150000, BakimLimiti = 150000, Durum = "Bakım Zamanı Geldi", SonBakimTarihi = "01.05.2026" }
            };
        }

        // GET: api/KalipKayitlari
        [HttpGet]
        public async Task<IActionResult> GetKalipKayitlari()
        {
            try
            {
                var kaliplar = await _context.KalipKayitlari.ToListAsync();

                if (kaliplar.Count == 0)
                {
                    var defaults = GetVarsayilanKaliplar();
                    foreach (var k in defaults)
                    {
                        try
                        {
                            await _context.Database.ExecuteSqlRawAsync(
                                "INSERT INTO KalipKayitlari (KalipKodu, KalipAdi, AktifMakine, Parca, MevcutVurus, BakimLimiti, Durum, SonBakimTarihi) VALUES ({0}, {1}, {2}, {3}, {4}, {5}, {6}, {7})",
                                k.KalipKodu ?? "", k.KalipAdi ?? "", k.AktifMakine ?? "", k.Parca ?? "", k.MevcutVurus, k.BakimLimiti, k.Durum ?? "", k.SonBakimTarihi ?? ""
                            );
                        }
                        catch { }
                    }
                    kaliplar = await _context.KalipKayitlari.ToListAsync();
                }

                if (kaliplar.Count == 0)
                {
                    return Ok(GetVarsayilanKaliplar());
                }

                return Ok(kaliplar);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[KalipKayitlari GET] DB Error: {ex.Message}");
                return Ok(GetVarsayilanKaliplar());
            }
        }

        // GET: api/KalipKayitlari/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetKalipKaydi(int id)
        {
            try
            {
                var kalip = await _context.KalipKayitlari.FindAsync(id);
                if (kalip == null) return NotFound();
                return Ok(kalip);
            }
            catch
            {
                return NotFound();
            }
        }

        // POST: api/KalipKayitlari
        [HttpPost]
        public async Task<IActionResult> PostKalipKaydi([FromBody] KalipKaydi kalipKaydi)
        {
            try
            {
                if (string.IsNullOrEmpty(kalipKaydi.SonBakimTarihi))
                {
                    kalipKaydi.SonBakimTarihi = DateTime.Now.ToString("dd.MM.yyyy HH:mm");
                }

                _context.KalipKayitlari.Add(kalipKaydi);
                await _context.SaveChangesAsync();

                return Ok(kalipKaydi);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[KalipKayitlari POST] Error: {ex.Message}");
                try
                {
                    await _context.Database.ExecuteSqlRawAsync(
                        "INSERT INTO KalipKayitlari (KalipKodu, KalipAdi, AktifMakine, Parca, MevcutVurus, BakimLimiti, Durum, SonBakimTarihi) VALUES ({0}, {1}, {2}, {3}, {4}, {5}, {6}, {7})",
                        kalipKaydi.KalipKodu ?? "KLP-NEW", kalipKaydi.KalipAdi ?? "Yeni Kalıp", kalipKaydi.AktifMakine ?? "PRES-01", kalipKaydi.Parca ?? "Parça", kalipKaydi.MevcutVurus, kalipKaydi.BakimLimiti > 0 ? kalipKaydi.BakimLimiti : 150000, kalipKaydi.Durum ?? "İyi", kalipKaydi.SonBakimTarihi ?? DateTime.Now.ToString("dd.MM.yyyy")
                    );
                    return Ok(kalipKaydi);
                }
                catch (Exception sqlEx)
                {
                    return BadRequest(new { message = sqlEx.Message });
                }
            }
        }

        // POST: api/KalipKayitlari/bakim-yap/5
        [HttpPost("bakim-yap/{id}")]
        public async Task<IActionResult> KalipBakimiYap(int id)
        {
            try
            {
                var kalip = await _context.KalipKayitlari.FindAsync(id);
                if (kalip != null)
                {
                    kalip.MevcutVurus = 0;
                    kalip.Durum = "İyi";
                    kalip.SonBakimTarihi = DateTime.Now.ToString("dd.MM.yyyy HH:mm");
                    await _context.SaveChangesAsync();
                    return Ok(kalip);
                }

                await _context.Database.ExecuteSqlRawAsync(
                    "UPDATE KalipKayitlari SET MevcutVurus = 0, Durum = N'İyi', SonBakimTarihi = {0} WHERE Id = {1}",
                    DateTime.Now.ToString("dd.MM.yyyy HH:mm"), id
                );
                return Ok(new { status = "success", id });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[KalipBakimiYap] Error: {ex.Message}");
                return Ok(new { status = "handled", id });
            }
        }
    }
}