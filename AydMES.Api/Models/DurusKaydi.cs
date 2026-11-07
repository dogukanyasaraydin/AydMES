using System.ComponentModel.DataAnnotations;
using AydMES.Api.Models;
namespace AydMES.Models // Kendi proje adına göre burayı ayarlarsın
{
    public class DurusKaydi
    {
        public int Id { get; set; }
        [MetinSiniri(20)]
        public string? Saat { get; set; } // Örn: "14:12"
        [MetinSiniri(50)]
        public string? MakineKod { get; set; } // Örn: "PRES-02"
        [MetinSiniri(200)]
        public string? Neden { get; set; } // Örn: "Malzeme bekleme"
        [Range(0, 10_000_000, ErrorMessage = "{0} 0 ile 10.000.000 arasında olmalıdır.")]
        public int Sure { get; set; } // Örn: 27 (dakika cinsinden)
        [MetinSiniri(50)]
        public string? Durum { get; set; } // Örn: "Açık", "Kapandı"
    }
}