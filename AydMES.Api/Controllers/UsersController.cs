using AydMES.Api.Models;
using AydMES.Api.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AydMES.Api.Controllers
{
    /// <summary>Kullanıcı yönetimi — yalnızca yönetici rolleri erişebilir.</summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = Roller.Yoneticiler)]
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
            // Şifre (hash dahil) hiçbir zaman istemciye gönderilmez
            return Ok(_context.Kullanicilar.Select(KullaniciDto.Projeksiyon).ToList());
        }

        [HttpPost]
        public IActionResult Post([FromBody] Kullanici kullanici)
        {
            if (string.IsNullOrWhiteSpace(kullanici.KullaniciAdi) || string.IsNullOrEmpty(kullanici.Sifre))
                return BadRequest(new { message = "Kullanıcı adı ve şifre zorunludur." });

            if (_context.Kullanicilar.Any(u => u.KullaniciAdi == kullanici.KullaniciAdi))
                return BadRequest(new { message = "Kullanıcı adı kullanımda!" });

            kullanici.Id = 0;
            kullanici.Sifre = SifreHasher.Hashle(kullanici.Sifre);
            _context.Kullanicilar.Add(kullanici);
            _context.SaveChanges();
            return Ok(KullaniciDto.Projeksiyon.Compile()(kullanici));
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

    public record KullaniciDto(int Id, string AdSoyad, string KullaniciAdi, string Rol, string Durum, string SonGiris)
    {
        public static readonly System.Linq.Expressions.Expression<Func<Kullanici, KullaniciDto>> Projeksiyon =
            u => new KullaniciDto(u.Id, u.AdSoyad, u.KullaniciAdi, u.Rol, u.Durum, u.SonGiris);
    }
}
