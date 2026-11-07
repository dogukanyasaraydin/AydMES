using System.ComponentModel.DataAnnotations;
namespace AydMES.Api.Models
{
    public class KalipKaydi
    {
        public int Id { get; set; }
        [MetinSiniri(50)]
        public string? KalipKodu { get; set; }  // Örn: "KLP-001"
        [MetinSiniri(100)]
        public string? KalipAdi { get; set; }   // Örn: "Ana Gövde Form Kalıbı"
        [MetinSiniri(50)]
        public string? AktifMakine { get; set; } // Örn: "PRES-01"
        [MetinSiniri(100)]
        public string? Parca { get; set; }       // Örn: "Ana Gövde Sac Parçası"
        [Range(0, 10_000_000, ErrorMessage = "{0} 0 ile 10.000.000 arasında olmalıdır.")]
        public int MevcutVurus { get; set; }                   // Örn: 145000
        [Range(0, 10_000_000, ErrorMessage = "{0} 0 ile 10.000.000 arasında olmalıdır.")]
        public int BakimLimiti { get; set; }                   // Örn: 150000
        [MetinSiniri(50)]
        public string? Durum { get; set; }       // Örn: "İyi", "Bakım Yaklaşıyor", "Bakım Zamanı Geldi"
        [MetinSiniri(20)]
        public string? SonBakimTarihi { get; set; }
    }
}