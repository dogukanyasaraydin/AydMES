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
            try
            {
                // React'tan gelen veriyi SQL tablosuna ekliyoruz
                _context.UretimLoglari.Add(yeniLog);
                await _context.SaveChangesAsync();

                // Ba�ar�l� olursa React'a 200 OK mesaj� g�nder (Bu mesaj pencereyi kapatacak!)
                return Ok(new { message = "Kay�t ba�ar�yla eklendi." });
            }
            catch (Exception ex)
            {
                // Bir hata olursa 500 kodu d�n
                return StatusCode(500, $"Sunucu hatası: {ex.Message}");
            }
        }
    }
}