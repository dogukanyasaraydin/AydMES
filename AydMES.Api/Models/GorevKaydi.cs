using System.ComponentModel.DataAnnotations;
namespace AydMES.Api.Models
{
    public class GorevKaydi
    {
        public int Id { get; set; }
        [MetinSiniri(200)]
        public string? GorevAdi { get; set; }
        [MetinSiniri(100)]
        public string? AtananKisi { get; set; }
        [MetinSiniri(50)]
        public string? Durum { get; set; }
        [MetinSiniri(20)]
        public string? Oncelik { get; set; }
        [MetinSiniri(50)]
        public string? Termin { get; set; }
    }
}