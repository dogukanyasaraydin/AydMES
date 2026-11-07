using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AydMES.Api.Models;
using AydMES.Models; // Kendi model klasörünün adını buraya yazabilirsin

namespace AydMES.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DurusKayitlariController : ControllerBase
    {
        private readonly MesDbContext _context;

        public DurusKayitlariController(MesDbContext context)
        {
            _context = context;
        }

        // GET: api/DurusKayitlari (React'in verileri çekeceği yer)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DurusKaydi>>> GetDurusKayitlari()
        {
            return await _context.DurusKayitlari.ToListAsync();
        }

        // POST: api/DurusKayitlari (Swagger'dan veya React'ten yeni duruş ekleyeceğimiz yer)
        [HttpPost]
        public async Task<ActionResult<DurusKaydi>> PostDurusKaydi(DurusKaydi durusKaydi)
        {
            _context.DurusKayitlari.Add(durusKaydi);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetDurusKayitlari", new { id = durusKaydi.Id }, durusKaydi);
        }
    }
}