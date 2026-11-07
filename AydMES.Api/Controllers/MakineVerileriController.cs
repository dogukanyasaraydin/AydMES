using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AydMES.Api.Models;

namespace AydMES.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MakineVerileriController : ControllerBase
    {
        private readonly MesDbContext _context;

        public MakineVerileriController(MesDbContext context)
        {
            _context = context;
        }

        // GET: api/MakineVerileri
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var makineler = await _context.Makineler.AsNoTracking().OrderBy(m => m.Kod).ToListAsync();
            return Ok(makineler);
        }

        // PUT: api/MakineVerileri/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMakine(int id, [FromBody] System.Text.Json.JsonElement body)
        {
            // Gövde doğrulaması: tip hatası veya geçersiz değer 400 döner (eskiden sessizce "İşlendi" dönüyordu)
            int vurusSayisi = 0;
            string durum = "Çalışıyor";
            string kod = "";
            if (body.ValueKind != System.Text.Json.JsonValueKind.Object)
                return BadRequest(new { message = "Geçersiz istek gövdesi." });
            if (body.TryGetProperty("vurusSayisi", out var vs)
                && (vs.ValueKind != System.Text.Json.JsonValueKind.Number || !vs.TryGetInt32(out vurusSayisi)))
                return BadRequest(new { message = "vurusSayisi bir tam sayı olmalıdır." });
            if (body.TryGetProperty("durum", out var d))
            {
                if (d.ValueKind != System.Text.Json.JsonValueKind.String) return BadRequest(new { message = "durum metin olmalıdır." });
                durum = d.GetString() ?? "Çalışıyor";
            }
            if (body.TryGetProperty("kod", out var k))
            {
                if (k.ValueKind != System.Text.Json.JsonValueKind.String) return BadRequest(new { message = "kod metin olmalıdır." });
                kod = k.GetString() ?? "";
            }
            if (vurusSayisi < 0 || vurusSayisi > 10_000_000)
                return BadRequest(new { message = "vurusSayisi 0 ile 10.000.000 arasında olmalıdır." });
            if (durum.Length > 50 || kod.Length > 50)
                return BadRequest(new { message = "durum ve kod en fazla 50 karakter olabilir." });

            var makine = await _context.Makineler.FirstOrDefaultAsync(m => m.Id == id || (kod != "" && m.Kod == kod));
            if (makine == null) return NotFound(new { message = "Makine bulunamadı." });

            makine.VurusSayisi = vurusSayisi;
            makine.Durum = durum;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Makine güncellendi." });
        }

        // POST: api/MakineVerileri/baslat
        [HttpPost("baslat")]
        public async Task<IActionResult> UretimBaslat([FromBody] UretimBaslatIstek istek)
        {
            var makine = await _context.Makineler.FirstOrDefaultAsync(m => m.Kod == istek.MakineKod);
            if (makine == null) return NotFound(new { message = "Makine bulunamadı." });

            makine.VurusSayisi = 0;
            makine.Durum = "Çalışıyor";
            makine.HedefVurus = istek.HedefVurus;
            makine.HataliAdet = 0;   // Her yeni üretimde fire sayacı sıfırlanır
            makine.FireOrani = 0.0;
            await _context.SaveChangesAsync();

            return Ok(new { status = "success", makine = istek.MakineKod, hedef = istek.HedefVurus });
        }
    }

    public class UretimBaslatIstek
    {
        [Required(ErrorMessage = "Makine kodu zorunludur."), MetinSiniri(50)]
        public string MakineKod { get; set; } = string.Empty;

        [Range(1, 1_000_000, ErrorMessage = "Hedef vuruş 1 ile 1.000.000 arasında olmalıdır.")]
        public int HedefVurus { get; set; }
    }
}