using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
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
        public IActionResult Post([FromBody] KullaniciOlusturIstek istek)
        {
            if (!Roller.Tumu.Contains(istek.Rol))
                return BadRequest(new { message = "Geçersiz rol." });

            if (_context.Kullanicilar.Any(u => u.KullaniciAdi == istek.KullaniciAdi))
                return BadRequest(new { message = "Kullanıcı adı kullanımda!" });

            var kullanici = new Kullanici
            {
                AdSoyad = istek.AdSoyad.Trim(),
                KullaniciAdi = istek.KullaniciAdi.Trim(),
                Sifre = SifreHasher.Hashle(istek.Sifre),
                Rol = istek.Rol
            };
            _context.Kullanicilar.Add(kullanici);
            _context.SaveChanges();
            return Ok(KullaniciDto.Projeksiyon.Compile()(kullanici));
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var user = _context.Kullanicilar.Find(id);
            if (user == null) return NotFound();

            // Kişi kendi hesabını silemez (oturumu açıkken kendini sistemden atmasın)
            if (User.FindFirstValue(ClaimTypes.NameIdentifier) == id.ToString())
                return BadRequest(new { message = "Kendi hesabınızı silemezsiniz." });

            // Son aktif yönetici silinirse kullanıcı yönetimine kimse giremez
            if (Roller.YoneticiListesi.Contains(user.Rol)
                && _context.Kullanicilar.Count(u => u.Id != id && u.Durum == "Aktif" && Roller.YoneticiListesi.Contains(u.Rol)) == 0)
                return BadRequest(new { message = "Sistemdeki son yönetici silinemez." });

            _context.Kullanicilar.Remove(user);
            _context.SaveChanges();
            return Ok();
        }
    }

    public class KullaniciOlusturIstek
    {
        [Required(ErrorMessage = "Ad soyad zorunludur."), StringLength(100)]
        public string AdSoyad { get; set; } = string.Empty;

        [Required(ErrorMessage = "Kullanıcı adı zorunludur."), StringLength(50, MinimumLength = 3)]
        [RegularExpression(@"^[a-zA-Z0-9._-]+$", ErrorMessage = "Kullanıcı adı yalnızca harf, rakam ve . _ - içerebilir.")]
        public string KullaniciAdi { get; set; } = string.Empty;

        [Required(ErrorMessage = "Şifre zorunludur."), StringLength(128, MinimumLength = 6, ErrorMessage = "Şifre en az 6 karakter olmalıdır.")]
        public string Sifre { get; set; } = string.Empty;

        [Required]
        public string Rol { get; set; } = string.Empty;
    }

    public record KullaniciDto(int Id, string AdSoyad, string KullaniciAdi, string Rol, string Durum, string SonGiris)
    {
        public static readonly System.Linq.Expressions.Expression<Func<Kullanici, KullaniciDto>> Projeksiyon =
            u => new KullaniciDto(u.Id, u.AdSoyad, u.KullaniciAdi, u.Rol, u.Durum, u.SonGiris);
    }
}
