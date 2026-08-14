using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AydMES.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        // Program.cs'de kullandığın anahtar ile aynı olmalı!
        private const string SecretKey = "AydMES_Proje_Guvenlik_Anahtari_123456789";

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            // --- BURASI MOCK (SAHTE) GİRİŞ KONTROLÜ ---
            // İleride burayı 'db.Kullanicilar.FirstOrDefault(...)' ile veritabanına bağlayacağız.
            if (request.Username == "dogukan" && request.Password == "123")
            {
                // Token içine "Süpervizör" rolünü gömüyoruz
                var claims = new[]
                {
                    new Claim(ClaimTypes.Name, request.Username),
                    new Claim(ClaimTypes.Role, "Süpervizör")
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
                    role = "Süpervizör",
                    username = request.Username
                });
            }

            return Unauthorized(new { message = "Hatalı kullanıcı adı veya şifre!" });
        }
    }

    // Basit bir DTO (Data Transfer Object) sınıfı
    public class LoginRequest
    {
        public string? Username { get; set; }
        public string? Password { get; set; }
    }
}