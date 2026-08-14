namespace AydMES.Api.Models
{
    public class DefektKaydi
    {
        public int Id { get; set; }
        public string? DefektTuru { get; set; } // string yanýna ? koyduk
        public int Adet { get; set; }
        public string? MakineKod { get; set; }  // string yanýna ? koyduk
        public string? Oran { get; set; }       // string yanýna ? koyduk
    }
}