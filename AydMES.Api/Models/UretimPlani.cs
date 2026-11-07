using System.ComponentModel.DataAnnotations;
namespace AydMES.Api.Models
{
    public class UretimPlani
    {
        public int Id { get; set; }
        [MetinSiniri(30)]
        public string? SaatAraligi { get; set; }
        [MetinSiniri(50)]
        public string? IsEmri { get; set; }
        [MetinSiniri(50)]
        public string? Makine { get; set; }
        [MetinSiniri(20)]
        public string? Oncelik { get; set; }
        [MetinSiniri(50)]
        public string? Durum { get; set; }
    }
}