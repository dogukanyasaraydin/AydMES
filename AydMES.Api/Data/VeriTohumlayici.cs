using AydMES.Api.Models;
using AydMES.Api.Security;
using AydMES.Models;
using Microsoft.EntityFrameworkCore;

namespace AydMES.Api.Data
{
    /// <summary>
    /// Uygulama açılışında veritabanını migration'larla oluşturur/günceller ve boş tabloları örnek verilerle doldurur.
    /// SQLite kullanıldığı için ek kurulum gerekmez: veritabanı ilk çalıştırmada tek bir dosya olarak oluşur.
    /// </summary>
    public static class VeriTohumlayici
    {
        public static void Calistir(MesDbContext db)
        {
            db.Database.Migrate();

            // Her açılışta makineler temiz bir vardiya başlangıcına alınır (simülasyon sıfırdan başlar)
            if (!db.Makineler.Any())
            {
                db.Makineler.AddRange(VarsayilanMakineler());
            }
            else
            {
                foreach (var makine in db.Makineler)
                {
                    makine.VurusSayisi = 0;
                    makine.HedefVurus = 0;
                    makine.HataliAdet = 0;
                    makine.FireOrani = 0;
                    makine.Durum = makine.Kod == "PRES-04" ? "Bakımda" : "Planlı duruş";
                }
            }

            if (!db.KalipKayitlari.Any()) db.KalipKayitlari.AddRange(VarsayilanKaliplar());

            if (!db.KaliteOnaylari.Any())
            {
                db.KaliteOnaylari.AddRange(
                    new KaliteOnayi { PartiKodu = "PRT-1045", IslemAdimi = "Son Kontrol", Durum = "Onaylandı", Saat = "10:30", OlcumDegeri = "98.5", Notlar = "Toleranslar normal." },
                    new KaliteOnayi { PartiKodu = "PRT-1046", IslemAdimi = "Görsel Kontrol", Durum = "Bekliyor", Saat = "14:15", OlcumDegeri = "0", Notlar = "Doğukan Bey'den onay bekleniyor." },
                    new KaliteOnayi { PartiKodu = "PRT-1047", IslemAdimi = "Ölçüm", Durum = "Reddedildi", Saat = "15:45", OlcumDegeri = "91.2", Notlar = "Çizik tespit edildi, analize gönderildi." }
                );
            }

            if (!db.GorevKayitlari.Any())
            {
                db.GorevKayitlari.AddRange(
                    new GorevKaydi { GorevAdi = "PRES-02 Kalıp Bakımı", AtananKisi = "Doğukan Aydın", Durum = "Devam ediyor", Oncelik = "high", Termin = "Bugün" },
                    new GorevKaydi { GorevAdi = "A001 Parti Analizi", AtananKisi = "Doğukan Bey", Durum = "Beklemede", Oncelik = "medium", Termin = "Yarın" },
                    new GorevKaydi { GorevAdi = "Haftalık OEE Raporu", AtananKisi = "Doğukan Aydın", Durum = "Tamamlandı", Oncelik = "low", Termin = "Cuma" }
                );
            }

            if (!db.DurusKayitlari.Any())
            {
                db.DurusKayitlari.AddRange(
                    new DurusKaydi { Saat = "09:15", MakineKod = "PRES-01", Neden = "Malzeme Bekleme", Sure = 15, Durum = "Kapalı" },
                    new DurusKaydi { Saat = "11:40", MakineKod = "PRES-03", Neden = "Kalıp Ayarı", Sure = 45, Durum = "Açık" },
                    new DurusKaydi { Saat = "14:20", MakineKod = "PRES-02", Neden = "Arıza - Sensör", Sure = 120, Durum = "Devam ediyor" }
                );
            }

            if (!db.UretimPlanlari.Any())
            {
                db.UretimPlanlari.AddRange(
                    new UretimPlani { SaatAraligi = "08:00 - 12:00", IsEmri = "IE-2026-08-01", Makine = "PRES-01", Oncelik = "Yüksek", Durum = "Üretimde" },
                    new UretimPlani { SaatAraligi = "13:00 - 17:00", IsEmri = "IE-2026-08-02", Makine = "PRES-03", Oncelik = "Orta", Durum = "Bekliyor" }
                );
            }

            if (!db.DefektKayitlari.Any())
            {
                db.DefektKayitlari.AddRange(
                    new DefektKaydi { DefektTuru = "Çizik / Yüzey Hatası", Adet = 14, MakineKod = "PRES-01", Oran = "%1.2" },
                    new DefektKaydi { DefektTuru = "Ölçü Sapması", Adet = 8, MakineKod = "PRES-03", Oran = "%0.8" }
                );
            }

            // Demo kullanıcıları (şifreler hashlenerek saklanır)
            if (!db.Kullanicilar.Any())
            {
                db.Kullanicilar.AddRange(
                    DemoKullanici("Doğukan Aydın", "dogukan", "123", Roller.YazilimStajyeri),
                    DemoKullanici("Ahmet Yılmaz", "ahmet", "demo123", Roller.FabrikaMuduru),
                    DemoKullanici("Ayşe Demir", "ayse", "demo123", Roller.KaliteMuhendisi),
                    DemoKullanici("Mehmet Kaya", "mehmet", "demo123", Roller.Operator)
                );
            }

            db.SaveChanges();
        }

        public static List<Makine> VarsayilanMakineler() => new()
        {
            new Makine { Kod = "PRES-01", Aciklama = "Ana Gövde Pres Makinesi", Durum = "Planlı duruş", YagSeviyesi = "%88", Sicaklik = 31.5, Basinc = "0 Bar", Vardiya = "Vardiya A" },
            new Makine { Kod = "PRES-02", Aciklama = "Yan Panel Pres Hattı", Durum = "Planlı duruş", YagSeviyesi = "%92", Sicaklik = 31.8, Basinc = "0 Bar", Vardiya = "Vardiya A" },
            new Makine { Kod = "PRES-03", Aciklama = "Kapak Şekillendirme Presi", Durum = "Planlı duruş", YagSeviyesi = "%74", Sicaklik = 35.0, Basinc = "0 Bar", Vardiya = "Vardiya B" },
            new Makine { Kod = "PRES-04", Aciklama = "Şase Kaynak ve Pres Hattı", Durum = "Bakımda", YagSeviyesi = "%60", Sicaklik = 27.4, Basinc = "0 Bar", Vardiya = "Vardiya C" }
        };

        public static List<KalipKaydi> VarsayilanKaliplar() => new()
        {
            new KalipKaydi { KalipKodu = "KLP-001", KalipAdi = "Ana Gövde Derin Çekme Kalıbı", AktifMakine = "PRES-01", Parca = "Ana Gövde Sac Parçası", MevcutVurus = 145200, BakimLimiti = 150000, Durum = "Bakım Yaklaşıyor", SonBakimTarihi = "01.07.2026" },
            new KalipKaydi { KalipKodu = "KLP-002", KalipAdi = "Yan Panel Büküm Kalıbı", AktifMakine = "PRES-02", Parca = "Yan Panel Pres Parçası", MevcutVurus = 45000, BakimLimiti = 200000, Durum = "İyi", SonBakimTarihi = "15.07.2026" },
            new KalipKaydi { KalipKodu = "KLP-003", KalipAdi = "Kapak Şekillendirme Kalıbı", AktifMakine = "PRES-03", Parca = "Kapak Sacı", MevcutVurus = 198500, BakimLimiti = 200000, Durum = "Bakım Yaklaşıyor", SonBakimTarihi = "10.06.2026" },
            new KalipKaydi { KalipKodu = "KLP-004", KalipAdi = "Şase Delme ve Kaynak Kalıbı", AktifMakine = "PRES-04", Parca = "Şase Sac Parçası", MevcutVurus = 150000, BakimLimiti = 150000, Durum = "Bakım Zamanı Geldi", SonBakimTarihi = "01.05.2026" }
        };

        private static Kullanici DemoKullanici(string adSoyad, string kullaniciAdi, string sifre, string rol) =>
            new() { AdSoyad = adSoyad, KullaniciAdi = kullaniciAdi, Sifre = SifreHasher.Hashle(sifre), Rol = rol };
    }
}
