using AydMES.Api.Models;
using Microsoft.AspNetCore.Identity;

namespace AydMES.Api.Security
{
    /// <summary>
    /// Kullanıcı şifrelerini ASP.NET Core Identity'nin PasswordHasher'ı ile
    /// (PBKDF2 + HMAC-SHA512, rastgele salt) hashler ve doğrular.
    /// </summary>
    public static class SifreHasher
    {
        private static readonly PasswordHasher<Kullanici> Hasher = new();

        // Identity V3 formatındaki hashler base64'te her zaman "AQAAAA" ile başlar (0x01 + iterasyon sayısı başlığı).
        private const string V3HashOneki = "AQAAAA";

        public static string Hashle(string sifre) => Hasher.HashPassword(null!, sifre);

        /// <summary>
        /// Şifreyi doğrular. Eski sürümlerden kalan düz metin şifreler de kabul edilir;
        /// bu durumda <paramref name="yenidenHashlenmeli"/> true döner ve çağıran taraf şifreyi hashleyip kaydetmelidir.
        /// </summary>
        public static bool Dogrula(string kayitliSifre, string girilenSifre, out bool yenidenHashlenmeli)
        {
            yenidenHashlenmeli = false;
            if (string.IsNullOrEmpty(kayitliSifre) || string.IsNullOrEmpty(girilenSifre)) return false;

            if (!kayitliSifre.StartsWith(V3HashOneki, StringComparison.Ordinal))
            {
                // Eski (hashlenmemiş) kayıt: bir kereye mahsus düz metin karşılaştırması yapılır.
                var eslesti = System.Security.Cryptography.CryptographicOperations.FixedTimeEquals(
                    System.Text.Encoding.UTF8.GetBytes(kayitliSifre),
                    System.Text.Encoding.UTF8.GetBytes(girilenSifre));
                yenidenHashlenmeli = eslesti;
                return eslesti;
            }

            var sonuc = Hasher.VerifyHashedPassword(null!, kayitliSifre, girilenSifre);
            yenidenHashlenmeli = sonuc == PasswordVerificationResult.SuccessRehashNeeded;
            return sonuc != PasswordVerificationResult.Failed;
        }
    }
}
