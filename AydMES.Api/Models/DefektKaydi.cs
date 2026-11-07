using System.ComponentModel.DataAnnotations;
namespace AydMES.Api.Models
{
    public class DefektKaydi
    {
        public int Id { get; set; }
        [MetinSiniri(100)]
        public string? DefektTuru { get; set; } // string yanına ? koyduk
        [Range(0, 10_000_000, ErrorMessage = "{0} 0 ile 10.000.000 arasında olmalıdır.")]
        public int Adet { get; set; }
        [MetinSiniri(50)]
        public string? MakineKod { get; set; }  // string yanına ? koyduk
        [MetinSiniri(20)]
        public string? Oran { get; set; }       // string yanına ? koyduk
    }
}