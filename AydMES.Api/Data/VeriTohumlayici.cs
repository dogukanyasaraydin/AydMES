using AydMES.Api.Models;
using AydMES.Api.Security;
using AydMES.Models;
using Microsoft.EntityFrameworkCore;

namespace AydMES.Api.Data
{
    /// <summary>
    /// Uygulama açılışında veritabanı şemasını onarır ve boş tabloları örnek verilerle doldurur
    /// (GitHub'dan klonlayan birinin projeyi tek komutla çalıştırabilmesi için).
    /// </summary>
    public static class VeriTohumlayici
    {
        public static void Calistir(MesDbContext db)
        {

            try { db.Database.EnsureCreated(); } catch {}

            // ==========================================
            // SQL KOLON TİP UYUMSUZLUĞUNU DÜZELT
            // Hata: "Unable to cast object of type 'System.Int32' to type 'System.String'"
            // Neden: SQL Server'daki bazı kolonlar INT olarak oluşturulmuş ama C# modeli STRING bekliyor.
            // Çözüm: Tüm kolonları C# modeline uygun tipe ALTER et.
            // ==========================================
            string[] kolonDuzeltmeleri = {
                "ALTER TABLE Makineler ALTER COLUMN Kod NVARCHAR(MAX) NULL",
                "ALTER TABLE Makineler ALTER COLUMN Aciklama NVARCHAR(MAX) NULL",
                "ALTER TABLE Makineler ALTER COLUMN Durum NVARCHAR(MAX) NULL",
                "ALTER TABLE Makineler ALTER COLUMN Basinc NVARCHAR(MAX) NULL",
                "ALTER TABLE Makineler ALTER COLUMN YagSeviyesi NVARCHAR(MAX) NULL",
                "ALTER TABLE Makineler ALTER COLUMN Sicaklik FLOAT NULL",
                "ALTER TABLE Makineler ALTER COLUMN VurusSayisi INT NOT NULL"
            };
            foreach (var sql in kolonDuzeltmeleri)
            {
                try { db.Database.ExecuteSqlRaw(sql); } catch {}
            }

            // Eksik olabilecek SQL kolonlarını otomatik ekle
            try { db.Database.ExecuteSqlRaw("IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Makineler' AND COLUMN_NAME = 'Vardiya') ALTER TABLE Makineler ADD Vardiya NVARCHAR(MAX) NULL;"); } catch {}
            try { db.Database.ExecuteSqlRaw("IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Makineler' AND COLUMN_NAME = 'HedefVurus') ALTER TABLE Makineler ADD HedefVurus INT NOT NULL DEFAULT 0;"); } catch {}
            try { db.Database.ExecuteSqlRaw("IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Makineler' AND COLUMN_NAME = 'HataliAdet') ALTER TABLE Makineler ADD HataliAdet INT NOT NULL DEFAULT 0;"); } catch {}
            try { db.Database.ExecuteSqlRaw("IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Makineler' AND COLUMN_NAME = 'FireOrani') ALTER TABLE Makineler ADD FireOrani FLOAT NOT NULL DEFAULT 0;"); } catch {}

            // Backend her açıldığında SQL Server'daki tüm makineleri temiz bir başlangıç için sıfırla:
            try { db.Database.ExecuteSqlRaw("UPDATE Makineler SET VurusSayisi = 0, HedefVurus = 0, HataliAdet = 0, FireOrani = 0, Durum = N'Planlı duruş' WHERE Kod != 'PRES-04';"); } catch {}
            try { db.Database.ExecuteSqlRaw("UPDATE Makineler SET VurusSayisi = 0, HedefVurus = 0, HataliAdet = 0, FireOrani = 0, Durum = N'Bakımda' WHERE Kod = 'PRES-04';"); } catch {}

            // ==========================================
            // KALİP KAYITLARI TABLO ONARIMI
            // KalipAdi veya SonBakimTarihi kolonları eksikse otomatik ekle
            // ==========================================
            try { db.Database.ExecuteSqlRaw("IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'KalipKayitlari' AND COLUMN_NAME = 'KalipAdi') ALTER TABLE KalipKayitlari ADD KalipAdi NVARCHAR(MAX) NULL;"); } catch {}
            try { db.Database.ExecuteSqlRaw("IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'KalipKayitlari' AND COLUMN_NAME = 'SonBakimTarihi') ALTER TABLE KalipKayitlari ADD SonBakimTarihi NVARCHAR(MAX) NULL;"); } catch {}
            // String kolonların tipi NVARCHAR olduğundan emin ol ve NULL değerleri temizle
            try { db.Database.ExecuteSqlRaw("ALTER TABLE KalipKayitlari ALTER COLUMN KalipKodu NVARCHAR(MAX) NULL"); } catch {}
            try { db.Database.ExecuteSqlRaw("ALTER TABLE KalipKayitlari ALTER COLUMN AktifMakine NVARCHAR(MAX) NULL"); } catch {}
            try { db.Database.ExecuteSqlRaw("ALTER TABLE KalipKayitlari ALTER COLUMN Parca NVARCHAR(MAX) NULL"); } catch {}
            try { db.Database.ExecuteSqlRaw("ALTER TABLE KalipKayitlari ALTER COLUMN Durum NVARCHAR(MAX) NULL"); } catch {}
            try { db.Database.ExecuteSqlRaw("UPDATE KalipKayitlari SET KalipKodu = ISNULL(KalipKodu, 'KLP-001'), KalipAdi = ISNULL(KalipAdi, 'Pres Kalıbı'), AktifMakine = ISNULL(AktifMakine, 'PRES-01'), Parca = ISNULL(Parca, 'Sac Parça'), Durum = ISNULL(Durum, 'İyi'), SonBakimTarihi = ISNULL(SonBakimTarihi, '01.01.2026') WHERE KalipKodu IS NULL OR KalipAdi IS NULL OR SonBakimTarihi IS NULL OR Parca IS NULL OR Durum IS NULL;"); } catch {}

            // 1. MAKİNE VERİLERİ 
            try
            {
                if (!db.Makineler.Any())
                {
                    db.Makineler.AddRange(
                        new Makine { Kod = "PRES-01", Aciklama = "Ana Gövde Pres Makinesi", Durum = "Planlı duruş", YagSeviyesi = "%88", Sicaklik = 31.5, Basinc = "0 Bar", VurusSayisi = 0 },
                        new Makine { Kod = "PRES-02", Aciklama = "Yan Panel Pres Hattı", Durum = "Planlı duruş", YagSeviyesi = "%92", Sicaklik = 31.8, Basinc = "0 Bar", VurusSayisi = 0 },
                        new Makine { Kod = "PRES-03", Aciklama = "Kapak Şekillendirme Presi", Durum = "Planlı duruş", YagSeviyesi = "%74", Sicaklik = 35.0, Basinc = "0 Bar", VurusSayisi = 0 },
                        new Makine { Kod = "PRES-04", Aciklama = "Şase Kaynak ve Pres Hattı", Durum = "Bakımda", YagSeviyesi = "%60", Sicaklik = 27.4, Basinc = "0 Bar", VurusSayisi = 0 }
                    );
                    db.SaveChanges();
                }
            } catch {}

            // 2. KALİTE ONAYLARI
            if (!db.KaliteOnaylari.Any())
            {
                db.KaliteOnaylari.AddRange(
                    new KaliteOnayi { PartiKodu = "PRT-1045", IslemAdimi = "Son Kontrol", Durum = "Onaylandı", Saat = "10:30", OlcumDegeri = "98.5", Notlar = "Toleranslar normal." },
                    new KaliteOnayi { PartiKodu = "PRT-1046", IslemAdimi = "Görsel Kontrol", Durum = "Bekliyor", Saat = "14:15", OlcumDegeri = "0", Notlar = "Umut Bey'den onay bekleniyor." },
                    new KaliteOnayi { PartiKodu = "PRT-1047", IslemAdimi = "Ölçüm", Durum = "Reddedildi", Saat = "15:45", OlcumDegeri = "91.2", Notlar = "Çizik tespit edildi, analize gönderildi." }
                );
                db.SaveChanges();
            }

            // 3. GÖREV KAYITLARI
            if (!db.GorevKayitlari.Any())
            {
                db.GorevKayitlari.AddRange(
                    new GorevKaydi { GorevAdi = "PRES-02 Kalıp Bakımı", AtananKisi = "Doğukan Aydın", Durum = "Devam ediyor", Oncelik = "high", Termin = "Bugün" },
                    new GorevKaydi { GorevAdi = "A001 Parti Analizi", AtananKisi = "Umut Bey", Durum = "Beklemede", Oncelik = "medium", Termin = "Yarın" },
                    new GorevKaydi { GorevAdi = "Haftalık OEE Raporu", AtananKisi = "Doğukan Aydın", Durum = "Tamamlandı", Oncelik = "low", Termin = "Cuma" }
                );
                db.SaveChanges();
            }

            // 4. DURUŞ KAYITLARI
            if (!db.DurusKayitlari.Any())
            {
                db.DurusKayitlari.AddRange(
                    new DurusKaydi { Saat = "09:15", MakineKod = "PRES-01", Neden = "Malzeme Bekleme", Sure = 15, Durum = "Kapalı" },
                    new DurusKaydi { Saat = "11:40", MakineKod = "PRES-03", Neden = "Kalıp Ayarı", Sure = 45, Durum = "Açık" },
                    new DurusKaydi { Saat = "14:20", MakineKod = "PRES-02", Neden = "Arıza - Sensör", Sure = 120, Durum = "Devam ediyor" }
                );
                db.SaveChanges();
            }

            // 5. KALIP KAYITLARI
            if (!db.KalipKayitlari.Any())
            {
                db.KalipKayitlari.AddRange(
                    new KalipKaydi { KalipKodu = "KLP-001", AktifMakine = "PRES-01", Parca = "Ana Gövde", MevcutVurus = 145000, BakimLimiti = 150000, Durum = "Yaklaşıyor" },
                    new KalipKaydi { KalipKodu = "KLP-002", AktifMakine = "PRES-03", Parca = "Yan Panel", MevcutVurus = 45000, BakimLimiti = 200000, Durum = "İyi" }
                );
                db.SaveChanges();
            }

            // 6. ÜRETİM PLANLARI
            if (!db.UretimPlanlari.Any())
            {
                db.UretimPlanlari.AddRange(
                    new UretimPlani { SaatAraligi = "08:00 - 12:00", IsEmri = "IE-2026-08-01", Makine = "PRES-01", Oncelik = "Yüksek", Durum = "Üretimde" },
                    new UretimPlani { SaatAraligi = "13:00 - 17:00", IsEmri = "IE-2026-08-02", Makine = "PRES-03", Oncelik = "Orta", Durum = "Bekliyor" }
                );
                db.SaveChanges();
            }

            // 7. DEFEKT KAYITLARI
            if (!db.DefektKayitlari.Any())
            {
                db.DefektKayitlari.AddRange(
                    new DefektKaydi { DefektTuru = "Çizik / Yüzey Hatası", Adet = 14, MakineKod = "PRES-01", Oran = "%1.2" },
                    new DefektKaydi { DefektTuru = "Ölçü Sapması", Adet = 8, MakineKod = "PRES-03", Oran = "%0.8" }
                );
                db.SaveChanges();
            }

            // 8. DEMO KULLANICILARI (şifreler hashlenerek saklanır)
            if (!db.Kullanicilar.Any())
            {
                db.Kullanicilar.AddRange(
                    DemoKullanici("Doğukan Aydın", "dogukan", "123", "Yazılım Stajyeri"),
                    DemoKullanici("Ahmet Yılmaz", "ahmet", "demo123", "Fabrika Müdürü"),
                    DemoKullanici("Ayşe Demir", "ayse", "demo123", "Kalite Mühendisi"),
                    DemoKullanici("Mehmet Kaya", "mehmet", "demo123", "Operatör")
                );
                db.SaveChanges();
            }
        }

        private static Kullanici DemoKullanici(string adSoyad, string kullaniciAdi, string sifre, string rol) =>
            new() { AdSoyad = adSoyad, KullaniciAdi = kullaniciAdi, Sifre = SifreHasher.Hashle(sifre), Rol = rol };
    }
}
