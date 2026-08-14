namespace AydMES.Api.Models
{
    public class UretimLog
    {
        public int Id { get; set; }
        public string? Saat { get; set; }          // Örn: "08:00"
        public int UretilenAdet { get; set; }      // O saatte üretilen toplam parça
        public int HataliAdet { get; set; }        // O saatte çıkan fire/hurda
        public int DurusSuresi { get; set; }       // Dakika cinsinden arıza/bekleme
        public int PlanlananSure { get; set; }     // O saat için planlanan net çalışma süresi (Örn: 60 dk)
    }
}