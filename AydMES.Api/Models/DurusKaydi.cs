namespace AydMES.Models // Kendi proje adına göre burayı ayarlarsın
{
    public class DurusKaydi
    {
        public int Id { get; set; }
        public string? Saat { get; set; } // Örn: "14:12"
        public string? MakineKod { get; set; } // Örn: "PRES-02"
        public string? Neden { get; set; } // Örn: "Malzeme bekleme"
        public int Sure { get; set; } // Örn: 27 (dakika cinsinden)
        public string? Durum { get; set; } // Örn: "Açık", "Kapandı"
    }
}