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

        // GET: api/KalipKayitlari
        [HttpGet]
        public async Task<IActionResult> GetKalipKayitlari()
        {
            return Ok(await _context.KalipKayitlari.AsNoTracking().ToListAsync());
        }

        // GET: api/KalipKayitlari/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetKalipKaydi(int id)
        {
            var kalip = await _context.KalipKayitlari.FindAsync(id);
            return kalip == null ? NotFound() : Ok(kalip);
        }

        // POST: api/KalipKayitlari
        [HttpPost]
        public async Task<IActionResult> PostKalipKaydi([FromBody] KalipKaydi kalipKaydi)
        {
            kalipKaydi.Id = 0; // Id'yi veritabanı belirler
            if (string.IsNullOrEmpty(kalipKaydi.SonBakimTarihi))
                kalipKaydi.SonBakimTarihi = DateTime.Now.ToString("dd.MM.yyyy HH:mm");

            _context.KalipKayitlari.Add(kalipKaydi);
            await _context.SaveChangesAsync();
            return Ok(kalipKaydi);
        }

        // POST: api/KalipKayitlari/bakim-yap/5
        [HttpPost("bakim-yap/{id}")]
        public async Task<IActionResult> KalipBakimiYap(int id)
        {
            var kalip = await _context.KalipKayitlari.FindAsync(id);
            if (kalip == null) return NotFound(new { message = "Kalıp bulunamadı." });

            kalip.MevcutVurus = 0;
            kalip.Durum = "İyi";
            kalip.SonBakimTarihi = DateTime.Now.ToString("dd.MM.yyyy HH:mm");
            await _context.SaveChangesAsync();
            return Ok(kalip);
        }
    }
}
