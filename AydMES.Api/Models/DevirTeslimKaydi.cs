using System.ComponentModel.DataAnnotations;
namespace AydMES.Api.Models
{
    public class DevirTeslimKaydi
    {
        public int Id { get; set; }
        [MetinSiniri(20)]
        public string? Saat { get; set; }
        [MetinSiniri(100)]
        public string? TeslimEden { get; set; }
        [MetinSiniri(100)]
        public string? TeslimAlan { get; set; }
        [MetinSiniri(1000)]
        public string? Not { get; set; }
        [MetinSiniri(50)]
        public string? Durum { get; set; }
    }
}
