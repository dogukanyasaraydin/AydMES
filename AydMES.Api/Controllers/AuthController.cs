using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using AydMES.Api.Models;
using AydMES.Api.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;

namespace AydMES.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly MesDbContext _context;
        private readonly JwtAyarlari _jwt;

        public AuthController(MesDbContext context, JwtAyarlari jwt)
        {
            _context = context;
            _jwt = jwt;
        }

        [AllowAnonymous]
        [EnableRateLimiting("giris")]
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrEmpty(request.Password))
                return BadRequest(new { message = "Kullanıcı adı ve şifre zorunludur." });

            var user = _context.Kullanicilar.FirstOrDefault(u => u.KullaniciAdi == request.Username);

            if (user == null
                || user.Durum != "Aktif"
                || !SifreHasher.Dogrula(user.Sifre, request.Password, out var yenidenHashlenmeli))
            {
                return Unauthorized(new { message = "Hatalı kullanıcı adı veya şifre!" });
            }

            // Eski düz metin şifreleri ilk başarılı girişte hash'e çevir
            if (yenidenHashlenmeli) user.Sifre = SifreHasher.Hashle(request.Password);

            user.SonGiris = DateTime.Now.ToString("yyyy-MM-dd HH:mm");
            _context.SaveChanges();

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.AdSoyad),
                new Claim(ClaimTypes.Role, user.Rol)
            };

            var bitis = DateTime.UtcNow.AddHours(_jwt.SureSaat);
            var token = new JwtSecurityToken(
                issuer: _jwt.Issuer,
                audience: _jwt.Audience,
                claims: claims,
                expires: bitis,
                signingCredentials: new SigningCredentials(_jwt.ImzaAnahtari(), SecurityAlgorithms.HmacSha256)
            );

            // Token gövdede değil, JavaScript'in okuyamadığı httpOnly cookie'de döner
            Response.Cookies.Append(OturumCerezi.Ad, new JwtSecurityTokenHandler().WriteToken(token),
                OturumCerezi.Secenekler(Request, bitis));

            return Ok(new
            {
                role = user.Rol,
                username = user.AdSoyad
            });
        }

        [AllowAnonymous]
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete(OturumCerezi.Ad, OturumCerezi.Secenekler(Request, null));
            return Ok();
        }
    }

    // Basit bir DTO (Data Transfer Object) sınıfı
    public class LoginRequest
    {
        [MetinSiniri(50)]
        public string? Username { get; set; }

        [MetinSiniri(128)]
        public string? Password { get; set; }
    }
}
