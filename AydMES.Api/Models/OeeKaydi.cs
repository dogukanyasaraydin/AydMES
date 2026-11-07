using System.ComponentModel.DataAnnotations;
using AydMES.Api.Models;
namespace AydMES.Models // Kendi projene göre namespace'i ayarlamayı unutma
{
    public class OeeKaydi
    {
        public int Id { get; set; }
        [MetinSiniri(50)]
        public string? MakineKod { get; set; } // Hangi makinenin OEE verisi (Örn: PRES-01)
        [MetinSiniri(30)]
        public string? Tarih { get; set; } // Hangi günün kaydı
        [Range(0, 100, ErrorMessage = "{0} 0 ile 100 arasında olmalıdır.")]
        public double Kullanilabilirlik { get; set; } // Örn: 82.3
        [Range(0, 100, ErrorMessage = "{0} 0 ile 100 arasında olmalıdır.")]
        public double Performans { get; set; } // Örn: 95.4
        [Range(0, 100, ErrorMessage = "{0} 0 ile 100 arasında olmalıdır.")]
        public double Kalite { get; set; } // Örn: 99.1
        [Range(0, 100, ErrorMessage = "{0} 0 ile 100 arasında olmalıdır.")]
        public double GenelOee { get; set; } // Örn: 78.2
    }
}