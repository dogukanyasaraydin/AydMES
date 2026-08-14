using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AydMES.Api.Models;

namespace AydMES.Api.Controllers
{
    public class KaliteOnayDto
    {
        public int Id { get; set; }
        public string? PartiKodu { get; set; }
        public string? IslemAdimi { get; set; }
        public string? Durum { get; set; }
        public string? Saat { get; set; }
        public string? OlcumDegeri { get; set; }
        public string? Notlar { get; set; }
    }

    [Route("api/[controller]")]
    [ApiController]
    public class KaliteOnaylariController : ControllerBase
    {
        private readonly MesDbContext _context;

        public KaliteOnaylariController(MesDbContext context)
        {
            _context = context;
        }

        // GET: api/KaliteOnaylari
        [HttpGet]
        public async Task<ActionResult<IEnumerable<KaliteOnayi>>> GetKaliteOnaylari()
        {
            return await _context.KaliteOnaylari.ToListAsync();
        }

        // POST: api/KaliteOnaylari
        [HttpPost]
        public async Task<ActionResult<KaliteOnayi>> PostKaliteOnayi([FromBody] KaliteOnayDto model)
        {
            if (model == null)
            {
                return BadRequest(new { mesaj = "Geçersiz veri." });
            }

            var yeniOnay = new KaliteOnayi
            {
                PartiKodu = model.PartiKodu ?? "Bilinmiyor",
                IslemAdimi = string.IsNullOrEmpty(model.IslemAdimi) ? "Son Kontrol" : model.IslemAdimi,
                Durum = model.Durum ?? "Bekliyor",
                Saat = string.IsNullOrEmpty(model.Saat) ? DateTime.Now.ToString("HH:mm") : model.Saat,
                OlcumDegeri = model.OlcumDegeri ?? "0",
                Notlar = model.Notlar ?? ""
            };

            _context.KaliteOnaylari.Add(yeniOnay);
            await _context.SaveChangesAsync();

            return Ok(yeniOnay);
        }

        // PUT: api/KaliteOnaylari/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutKaliteOnayi(int id, [FromBody] KaliteOnayDto model)
        {
            var onay = await _context.KaliteOnaylari.FindAsync(id);
            if (onay == null)
            {
                return NotFound();
            }

            if (!string.IsNullOrEmpty(model.Durum)) onay.Durum = model.Durum;
            if (!string.IsNullOrEmpty(model.Notlar)) onay.Notlar = model.Notlar;
            if (!string.IsNullOrEmpty(model.OlcumDegeri)) onay.OlcumDegeri = model.OlcumDegeri;

            await _context.SaveChangesAsync();
            return Ok(onay);
        }

        // DELETE: api/KaliteOnaylari/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteKaliteOnayi(int id)
        {
            var onay = await _context.KaliteOnaylari.FindAsync(id);
            if (onay == null)
            {
                return NotFound();
            }

            _context.KaliteOnaylari.Remove(onay);
            await _context.SaveChangesAsync();
            return Ok(new { mesaj = "Kalite kaydı silindi" });
        }
    }
}