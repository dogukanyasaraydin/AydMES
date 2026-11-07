using Microsoft.AspNetCore.Mvc;
using AydMES.Api.Models;

namespace AydMES.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UretimLoglariController : ControllerBase
    {
        private readonly MesDbContext _context;

        public UretimLoglariController(MesDbContext context)
        {
            _context = context;
        }

        // POST: api/UretimLoglari
        [HttpPost]
        public async Task<IActionResult> PostUretimLog([FromBody] UretimLog yeniLog)
        {
            // React'tan gelen veriyi tabloya ekle (hatalar genel hata yakalayıcıda loglanır)
            _context.UretimLoglari.Add(yeniLog);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Kayıt başarıyla eklendi." });
        }
    }
}