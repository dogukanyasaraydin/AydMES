using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AydMES.Api.Models;

namespace AydMES.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DefektKayitlariController : ControllerBase
    {
        private readonly MesDbContext _context;

        public DefektKayitlariController(MesDbContext context)
        {
            _context = context;
        }

        // GET: api/DefektKayitlari
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DefektKaydi>>> GetDefektKayitlari()
        {
            return await _context.DefektKayitlari.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DefektKaydi>> GetDefektKaydi(int id)
        {
            var kayit = await _context.DefektKayitlari.FindAsync(id);
            if (kayit == null) return NotFound();
            return kayit;
        }

        // POST: api/DefektKayitlari
        [HttpPost]
        public async Task<ActionResult<DefektKaydi>> PostDefektKaydi(DefektKaydi defektKaydi)
        {
            _context.DefektKayitlari.Add(defektKaydi);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDefektKaydi), new { id = defektKaydi.Id }, defektKaydi);
        }

        // PUT: api/DefektKayitlari/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutDefektKaydi(int id, [FromBody] DefektKaydi model)
        {
            var mevcuted = await _context.DefektKayitlari.FindAsync(id);
            if (mevcuted == null)
            {
                return NotFound();
            }

            if (!string.IsNullOrEmpty(model.DefektTuru)) mevcuted.DefektTuru = model.DefektTuru;
            if (model.Adet > 0) mevcuted.Adet = model.Adet;
            if (!string.IsNullOrEmpty(model.MakineKod)) mevcuted.MakineKod = model.MakineKod;
            if (!string.IsNullOrEmpty(model.Oran)) mevcuted.Oran = model.Oran;

            await _context.SaveChangesAsync();
            return Ok(mevcuted);
        }

        // DELETE: api/DefektKayitlari/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDefektKaydi(int id)
        {
            var defekt = await _context.DefektKayitlari.FindAsync(id);
            if (defekt == null)
            {
                return NotFound();
            }

            _context.DefektKayitlari.Remove(defekt);
            await _context.SaveChangesAsync();
            return Ok(new { mesaj = "Defekt kaydı silindi" });
        }
    }
}