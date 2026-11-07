using System.ComponentModel.DataAnnotations;
namespace AydMES.Api.Models
{
    public class UretimLog
    {
        public int Id { get; set; }
        [MetinSiniri(20)]
        public string? Saat { get; set; }          // Örn: "08:00"
        [Range(0, 10_000_000, ErrorMessage = "{0} 0 ile 10.000.000 arasında olmalıdır.")]
        public int UretilenAdet { get; set; }      // O saatte üretilen toplam parça
        [Range(0, 10_000_000, ErrorMessage = "{0} 0 ile 10.000.000 arasında olmalıdır.")]
        public int HataliAdet { get; set; }        // O saatte çıkan fire/hurda
        [Range(0, 10_000_000, ErrorMessage = "{0} 0 ile 10.000.000 arasında olmalıdır.")]
        public int DurusSuresi { get; set; }       // Dakika cinsinden arıza/bekleme
        [Range(0, 10_000_000, ErrorMessage = "{0} 0 ile 10.000.000 arasında olmalıdır.")]
        public int PlanlananSure { get; set; }     // O saat için planlanan net çalışma süresi (Örn: 60 dk)
    }
}