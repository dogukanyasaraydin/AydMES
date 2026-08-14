namespace AydMES.Api.Models
{
    public class KaliteOnayi
    {
        public int Id { get; set; }
        public string? PartiKodu { get; set; }
        public string? IslemAdimi { get; set; }
        public string? Durum { get; set; }
        public string? Saat { get; set; }
        public string? OlcumDegeri { get; set; }
        public string? Notlar { get; set; }
    }
}