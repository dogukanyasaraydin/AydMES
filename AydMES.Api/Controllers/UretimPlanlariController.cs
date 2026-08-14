using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AydMES.Api.Models;

namespace AydMES.Api.Controllers
{
    public class OptimizasyonDto
    {
        public string? Hedef { get; set; }
    }

    [Route("api/[controller]")]
    [ApiController]
    public class UretimPlanlariController : ControllerBase
    {
        private readonly MesDbContext _context;

        public UretimPlanlariController(MesDbContext context)
        {
            _context = context;
        }

        // GET: api/UretimPlanlari
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UretimPlani>>> GetUretimPlanlari()
        {
            return await _context.UretimPlanlari.ToListAsync();
        }

        // POST: api/UretimPlanlari
        [HttpPost]
        public async Task<ActionResult<UretimPlani>> PostUretimPlani([FromBody] UretimPlani plan)
        {
            _context.UretimPlanlari.Add(plan);
            await _context.SaveChangesAsync();
            return Ok(plan);
        }

        // PUT: api/UretimPlanlari/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUretimPlani(int id, [FromBody] UretimPlani plan)
        {
            var mevcuted = await _context.UretimPlanlari.FindAsync(id);
            if (mevcuted == null)
            {
                return NotFound();
            }

            mevcuted.SaatAraligi = plan.SaatAraligi ?? mevcuted.SaatAraligi;
            mevcuted.IsEmri = plan.IsEmri ?? mevcuted.IsEmri;
            mevcuted.Makine = plan.Makine ?? mevcuted.Makine;
            mevcuted.Oncelik = plan.Oncelik ?? mevcuted.Oncelik;
            mevcuted.Durum = plan.Durum ?? mevcuted.Durum;

            await _context.SaveChangesAsync();
            return Ok(mevcuted);
        }

        // DELETE: api/UretimPlanlari/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUretimPlani(int id)
        {
            var plan = await _context.UretimPlanlari.FindAsync(id);
            if (plan == null)
            {
                return NotFound();
            }

            _context.UretimPlanlari.Remove(plan);
            await _context.SaveChangesAsync();
            return Ok(new { mesaj = "Plan silindi" });
        }

        // POST: api/UretimPlanlari/Optimize
        [HttpPost("Optimize")]
        public IActionResult OptimizeEt([FromBody] OptimizasyonDto model)
        {
            if (model == null || string.IsNullOrEmpty(model.Hedef))
            {
                return BadRequest(new { mesaj = "Geçersiz optimizasyon hedefi." });
            }

            return Ok(new { mesaj = $"Plan '{model.Hedef}' hedefiyle başarıyla optimize edildi." });
        }
    }
}