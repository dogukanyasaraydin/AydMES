using System.ComponentModel.DataAnnotations.Schema;

namespace AydMES.Api.Models
{
    public class Makine
    {
        public int Id { get; set; }
        public string Kod { get; set; } = string.Empty;      // Örn: "PRES-01"
        public string Aciklama { get; set; } = string.Empty; // Örn: "Ana Gövde Pres Makinesi"
        public string Durum { get; set; } = string.Empty;    // Örn: "Çalışıyor", "Planlı duruş", "Bakımda", "Tamamlandı"
        public double Sicaklik { get; set; }
        public string Basinc { get; set; } = string.Empty;   // Örn: "185 Bar"
        public int VurusSayisi { get; set; }
        public string YagSeviyesi { get; set; } = string.Empty; // Örn: "%88"

        // Bu alanlar Program.cs'deki ALTER TABLE ile SQL'e eklendi, artık kaydedilebilir:
        public int HedefVurus { get; set; }                  // Örn: 1000
        public int? HataliAdet { get; set; }                 // Örn: 12 (Fire/Hurda sayısı)
        public double FireOrani { get; set; }                // Örn: 1.2 (%1.2)

        // Vardiya kolonu SQL'de henüz yok, [NotMapped] kalır:
        [NotMapped]
        public string Vardiya { get; set; } = "Vardiya A";   // Örn: "Vardiya A"
    }
}