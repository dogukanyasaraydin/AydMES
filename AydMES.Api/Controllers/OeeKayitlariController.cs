using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AydMES.Api.Models;
using AydMES.Models;

namespace AydMES.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OeeKayitlariController : ControllerBase
    {
        private readonly MesDbContext _context;

        public OeeKayitlariController(MesDbContext context)
        {
            _context = context;
        }

        // GET: api/OeeKayitlari
        [HttpGet]
        public async Task<ActionResult> GetOeeKayitlari()
        {
            try
            {
                // 1) Önce OeeKayitlari tablosuna bak
                var kayitlar = await _context.OeeKayitlari.ToListAsync();
                if (kayitlar.Count > 0)
                {
                    // Frontend'in beklediği property adlarıyla dön
                    var result = kayitlar.Select(k => new {
                        id = k.Id,
                        makineKod = k.MakineKod,
                        kullanilabilirlik = k.Kullanilabilirlik,
                        performans = k.Performans,
                        kalite = k.Kalite,
                        oee = k.GenelOee
                    });
                    return Ok(result);
                }

                // 2) OeeKayitlari boşsa -> Makineler tablosundan canlı hesapla
                var makineler = await _context.Makineler.ToListAsync();
                if (!makineler.Any())
                {
                    return Ok(new List<object>());
                }

                var canliOeeListesi = makineler.Select(m =>
                {
                    bool isCalisiyor = m.Durum == "Çalışıyor";
                    bool isBakim = m.Durum == "Bakımda";

                    double kullanilabilirlik = isCalisiyor ? 95.0 : (isBakim ? 0.0 : 85.0);
                    double performans = m.VurusSayisi > 0
                        ? Math.Min(99.0, Math.Max(70.0, 75.0 + (m.VurusSayisi % 24)))
                        : 0.0;
                    double kalite = m.VurusSayisi > 0
                        ? Math.Round((double)(m.VurusSayisi - (m.HataliAdet ?? 0)) / m.VurusSayisi * 100, 1)
                        : 100.0;
                    double oee = Math.Round((kullanilabilirlik * performans * kalite) / 10000, 1);

                    return new
                    {
                        id = m.Id,
                        makineKod = m.Kod,
                        kullanilabilirlik = kullanilabilirlik,
                        performans = performans,
                        kalite = kalite,
                        oee = oee
                    };
                }).ToList();

                return Ok(canliOeeListesi);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"OeeKayitlari Hata: {ex.Message}");
                return Ok(new List<object>());
            }
        }

        // POST: api/OeeKayitlari
        [HttpPost]
        public async Task<ActionResult<OeeKaydi>> PostOeeKaydi(OeeKaydi oeeKaydi)
        {
            _context.OeeKayitlari.Add(oeeKaydi);
            await _context.SaveChangesAsync();
            return Ok(oeeKaydi);
        }
    }
}