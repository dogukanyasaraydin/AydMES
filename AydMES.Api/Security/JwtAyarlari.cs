using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace AydMES.Api.Security
{
    /// <summary>
    /// appsettings.json'daki "Jwt" bölümü. Anahtar kaynak koda ve depoya yazılmaz: üretimde ortam
    /// değişkeninden (Jwt__Key) okunur, geliştirmede tanımlı değilse açılışta rastgele üretilir (Program.cs).
    /// </summary>
    public class JwtAyarlari
    {
        public const string Bolum = "Jwt";

        public string Key { get; set; } = string.Empty;
        public string Issuer { get; set; } = "AydMES.Api";
        public string Audience { get; set; } = "AydMES.Ui";
        public int SureSaat { get; set; } = 2;

        /// <summary>"Beni hatırla" seçildiğinde oturumun geçerli kalacağı gün sayısı.</summary>
        public int HatirlaGun { get; set; } = 7;

        public SymmetricSecurityKey ImzaAnahtari()
        {
            // HMAC-SHA256 için en az 256 bit (32 bayt) anahtar gerekir.
            if (Encoding.UTF8.GetByteCount(Key) < 32)
                throw new InvalidOperationException(
                    "Jwt:Key yapılandırılmamış veya 32 karakterden kısa. Ortam değişkeni olarak Jwt__Key tanımlayın.");
            return new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Key));
        }
    }
}
