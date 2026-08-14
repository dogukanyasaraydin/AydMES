namespace AydMES.Api.Models
{
    public class UretimPlani
    {
        public int Id { get; set; }
        public string? SaatAraligi { get; set; }
        public string? IsEmri { get; set; }
        public string? Makine { get; set; }
        public string? Oncelik { get; set; }
        public string? Durum { get; set; }
    }
}