using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AydMES.Api.Models;

namespace AydMES.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GorevKayitlariController : ControllerBase
    {
        private readonly MesDbContext _context;

        public GorevKayitlariController(MesDbContext context)
        {
            _context = context;
        }

        // GET: api/GorevKayitlari
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GorevKaydi>>> GetGorevKayitlari()
        {
            return await _context.GorevKayitlari.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<GorevKaydi>> GetGorevKaydi(int id)
        {
            var kayit = await _context.GorevKayitlari.FindAsync(id);
            if (kayit == null) return NotFound();
            return kayit;
        }

        // POST: api/GorevKayitlari
        [HttpPost]
        public async Task<ActionResult<GorevKaydi>> PostGorevKaydi(GorevKaydi gorevKaydi)
        {
            _context.GorevKayitlari.Add(gorevKaydi);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetGorevKaydi), new { id = gorevKaydi.Id }, gorevKaydi);
        }
    }
}