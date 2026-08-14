using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AydMES.Api.Models;

namespace AydMES.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DevirTeslimKayitlariController : ControllerBase
    {
        private readonly MesDbContext _context;

        public DevirTeslimKayitlariController(MesDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DevirTeslimKaydi>>> GetDevirTeslimKayitlari()
        {
            var liste = await _context.DevirTeslimKayitlari.ToListAsync();
            if (!liste.Any())
            {
                var varsayilanlar = new List<DevirTeslimKaydi>
                {
                    new DevirTeslimKaydi { Saat = "08:00", TeslimEden = "Serkan Arslan (Vardiya C)", TeslimAlan = "Ahmet Yılmaz (Vardiya A)", Not = "PRES-04 hidrolik yağ filtresi kontrol edildi. PRES-01 kalıp sıkma cıvataları torklandı.", Durum = "Tamamlandı" },
                    new DevirTeslimKaydi { Saat = "16:00", TeslimEden = "Ahmet Yılmaz (Vardiya A)", TeslimAlan = "Hasan Öztürk (Vardiya B)", Not = "PRES-02 ısı sensörü stabil. PRT-908 partisi teslim edildi.", Durum = "Tamamlandı" }
                };
                await _context.DevirTeslimKayitlari.AddRangeAsync(varsayilanlar);
                await _context.SaveChangesAsync();
                return Ok(varsayilanlar);
            }
            return Ok(liste.OrderByDescending(d => d.Id));
        }

        [HttpPost]
        public async Task<ActionResult<DevirTeslimKaydi>> PostDevirTeslimKaydi(DevirTeslimKaydi kayit)
        {
            _context.DevirTeslimKayitlari.Add(kayit);
            await _context.SaveChangesAsync();
            return Ok(kayit);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDevirTeslimKaydi(int id)
        {
            var kayit = await _context.DevirTeslimKayitlari.FindAsync(id);
            if (kayit == null) return NotFound();

            _context.DevirTeslimKayitlari.Remove(kayit);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
