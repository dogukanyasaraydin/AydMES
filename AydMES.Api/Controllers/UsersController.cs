using Microsoft.AspNetCore.Mvc;
using AydMES.Api.Models;
using System.Linq;

namespace AydMES.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly MesDbContext _context;

        public UsersController(MesDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult Get()
        {
            return Ok(_context.Kullanicilar.ToList());
        }

        [HttpPost]
        public IActionResult Post([FromBody] Kullanici kullanici)
        {
            if (_context.Kullanicilar.Any(u => u.KullaniciAdi == kullanici.KullaniciAdi))
                return BadRequest(new { message = "Kullanıcı adı kullanımda!" });

            _context.Kullanicilar.Add(kullanici);
            _context.SaveChanges();
            return Ok(kullanici);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var user = _context.Kullanicilar.Find(id);
            if (user == null) return NotFound();

            _context.Kullanicilar.Remove(user);
            _context.SaveChanges();
            return Ok();
        }
    }
}
