namespace AydMES.Models // Kendi projene göre namespace'i ayarlamayý unutma
{
    public class OeeKaydi
    {
        public int Id { get; set; }
        public string? MakineKod { get; set; } // Hangi makinenin OEE verisi (Örn: PRES-01)
        public string? Tarih { get; set; } // Hangi günün kaydý
        public double Kullanilabilirlik { get; set; } // Örn: 82.3
        public double Performans { get; set; } // Örn: 95.4
        public double Kalite { get; set; } // Örn: 99.1
        public double GenelOee { get; set; } // Örn: 78.2
    }
}