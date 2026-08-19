using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AydMES.Api.Models;
using System.Linq;

namespace AydMES.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private const string SecretKey = "AydMES_Proje_Guvenlik_Anahtari_123456789";
        private readonly MesDbContext _context;

        public AuthController(MesDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            // Veritabanından kullanıcıyı kontrol et
            var user = _context.Kullanicilar.FirstOrDefault(u => u.KullaniciAdi == request.Username && u.Sifre == request.Password);

            if (user != null)
            {
                user.SonGiris = DateTime.Now.ToString("yyyy-MM-dd HH:mm");
                _context.SaveChanges();

                var claims = new[]
                {
                    new Claim(ClaimTypes.Name, user.AdSoyad),
                    new Claim(ClaimTypes.Role, user.Rol)
                };

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SecretKey));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var token = new JwtSecurityToken(
                    claims: claims,
                    expires: DateTime.Now.AddHours(2), // Token 2 saat geçerli
                    signingCredentials: creds
                );

                return Ok(new
                {
                    token = new JwtSecurityTokenHandler().WriteToken(token),
                    role = user.Rol,
                    username = user.AdSoyad
                });
            }

            return Unauthorized(new { message = "Hatalı kullanıcı adı veya şifre!" });
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] Kullanici kullanici)
        {
            if (_context.Kullanicilar.Any(u => u.KullaniciAdi == kullanici.KullaniciAdi))
            {
                return BadRequest(new { message = "Bu kullanıcı adı zaten alınmış!" });
            }

            _context.Kullanicilar.Add(kullanici);
            _context.SaveChanges();

            return Ok(new { message = "Kullanıcı başarıyla kaydedildi." });
        }
    }

    // Basit bir DTO (Data Transfer Object) sınıfı
    public class LoginRequest
    {
        public string? Username { get; set; }
        public string? Password { get; set; }
    }
}