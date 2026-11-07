using System.ComponentModel.DataAnnotations;
namespace AydMES.Api.Models
{
    public class PersonelKaydi
    {
        public int Id { get; set; }
        [MetinSiniri(20)]
        public string? Sicil { get; set; }
        [MetinSiniri(100)]
        public string? AdSoyad { get; set; }
        [MetinSiniri(30)]
        public string? Vardiya { get; set; }
        [MetinSiniri(100)]
        public string? Gorev { get; set; }
        [MetinSiniri(50)]
        public string? Makine { get; set; }
        [MetinSiniri(100)]
        public string? Yetkinlik { get; set; }
        [MetinSiniri(50)]
        public string? Durum { get; set; }
    }
}
