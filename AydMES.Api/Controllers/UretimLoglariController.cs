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

                // Baþarýlý olursa React'a 200 OK mesajý gönder (Bu mesaj pencereyi kapatacak!)
                return Ok(new { message = "Kayýt baþarýyla eklendi." });
            }
            catch (Exception ex)
            {
                // Bir hata olursa 500 kodu dön
                return StatusCode(500, $"Sunucu hatasý: {ex.Message}");
            }
        }
    }
}