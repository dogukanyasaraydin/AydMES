namespace AydMES.Api.Models
{
    public class KalipKaydi
    {
        public int Id { get; set; }
        public string? KalipKodu { get; set; }  // Örn: "KLP-001"
        public string? KalipAdi { get; set; }   // Örn: "Ana Gövde Form Kalıbı"
        public string? AktifMakine { get; set; } // Örn: "PRES-01"
        public string? Parca { get; set; }       // Örn: "Ana Gövde Sac Parçası"
        public int MevcutVurus { get; set; }                   // Örn: 145000
        public int BakimLimiti { get; set; }                   // Örn: 150000
        public string? Durum { get; set; }       // Örn: "İyi", "Bakım Yaklaşıyor", "Bakım Zamanı Geldi"
        public string? SonBakimTarihi { get; set; }
    }
}