namespace AydMES.Api.Models
{
    public class Kullanici
    {
        public int Id { get; set; }
        public string AdSoyad { get; set; } = string.Empty;
        public string KullaniciAdi { get; set; } = string.Empty;
        public string Sifre { get; set; } = string.Empty; // PBKDF2 hash (Security/SifreHasher) — düz metin saklanmaz
        public string Rol { get; set; } = string.Empty; // Fabrika Müdürü, Operatör, vs.
        public string Durum { get; set; } = "Aktif";
        public string SonGiris { get; set; } = "Hiç girilmedi";
    }
}
