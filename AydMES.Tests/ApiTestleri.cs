using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using AydMES.Api.Models;
using AydMES.Api.Security;

namespace AydMES.Tests;

public class ApiTestleri : IDisposable
{
    private readonly TestUygulamasi _uygulama = new();

    public void Dispose() => _uygulama.Dispose();

    private async Task<HttpClient> GirisYap(string kullaniciAdi, string sifre)
    {
        var istemci = _uygulama.CreateClient(); // cookie'leri saklar
        var yanit = await istemci.PostAsJsonAsync("/api/Auth/login", new { username = kullaniciAdi, password = sifre });
        Assert.Equal(HttpStatusCode.OK, yanit.StatusCode);
        return istemci;
    }

    private static async Task<string> Mesaj(HttpResponseMessage yanit) =>
        JsonDocument.Parse(await yanit.Content.ReadAsStringAsync()).RootElement.GetProperty("message").GetString()!;

    [Fact]
    public async Task Health_giris_gerektirmez()
    {
        var yanit = await _uygulama.CreateClient().GetAsync("/api/health");
        Assert.Equal(HttpStatusCode.OK, yanit.StatusCode);
    }

    [Fact]
    public async Task Korumali_uc_girissiz_401_doner()
    {
        var yanit = await _uygulama.CreateClient().GetAsync("/api/DurusKayitlari");
        Assert.Equal(HttpStatusCode.Unauthorized, yanit.StatusCode);
    }

    [Fact]
    public async Task Giris_tokeni_httpOnly_cookie_olarak_verir_ve_govdede_dondurmez()
    {
        var yanit = await _uygulama.CreateClient().PostAsJsonAsync("/api/Auth/login", new { username = "ahmet", password = "demo123" });

        Assert.Equal(HttpStatusCode.OK, yanit.StatusCode);
        var cerez = Assert.Single(yanit.Headers.GetValues("Set-Cookie"));
        Assert.StartsWith(OturumCerezi.Ad + "=", cerez);
        Assert.Contains("httponly", cerez, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("samesite=strict", cerez, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("token", await yanit.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Cookie_ile_korumali_uca_erisilir_cikista_oturum_kapanir()
    {
        var istemci = await GirisYap("ahmet", "demo123");
        Assert.Equal(HttpStatusCode.OK, (await istemci.GetAsync("/api/DurusKayitlari")).StatusCode);

        await istemci.PostAsync("/api/Auth/logout", null);
        Assert.Equal(HttpStatusCode.Unauthorized, (await istemci.GetAsync("/api/DurusKayitlari")).StatusCode);
    }

    [Fact]
    public async Task Hatali_sifre_401_doner()
    {
        var yanit = await _uygulama.CreateClient().PostAsJsonAsync("/api/Auth/login", new { username = "ahmet", password = "yanlis" });
        Assert.Equal(HttpStatusCode.Unauthorized, yanit.StatusCode);
    }

    [Fact]
    public async Task Altinci_hatali_denemede_429_doner()
    {
        var istemci = _uygulama.CreateClient();
        for (var i = 0; i < 5; i++)
        {
            var y = await istemci.PostAsJsonAsync("/api/Auth/login", new { username = "ahmet", password = "yanlis" });
            Assert.Equal(HttpStatusCode.Unauthorized, y.StatusCode);
        }
        var altinci = await istemci.PostAsJsonAsync("/api/Auth/login", new { username = "ahmet", password = "demo123" });
        Assert.Equal(HttpStatusCode.TooManyRequests, altinci.StatusCode);
    }

    [Fact]
    public async Task Operator_okuyabilir_ama_veri_degistiremez()
    {
        var istemci = await GirisYap("mehmet", "demo123");

        Assert.Equal(HttpStatusCode.OK, (await istemci.GetAsync("/api/DurusKayitlari")).StatusCode);
        var yazma = await istemci.PostAsJsonAsync("/api/DurusKayitlari", new { saat = "10:00", makineKod = "PRES-01", neden = "Test", sure = 5 });
        Assert.Equal(HttpStatusCode.Forbidden, yazma.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await istemci.DeleteAsync("/api/UretimPlanlari/1")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await istemci.GetAsync("/api/Users")).StatusCode);
    }

    [Fact]
    public async Task Duzenleyici_kayit_ekleyebilir()
    {
        var istemci = await GirisYap("ayse", "demo123"); // Kalite Mühendisi
        var yanit = await istemci.PostAsJsonAsync("/api/DurusKayitlari", new { saat = "10:00", makineKod = "PRES-01", neden = "Test", sure = 5 });
        Assert.Equal(HttpStatusCode.Created, yanit.StatusCode);
    }

    [Fact]
    public async Task Gecersiz_veri_okunabilir_mesajla_400_doner()
    {
        var istemci = await GirisYap("ahmet", "demo123");

        var negatif = await istemci.PostAsJsonAsync("/api/DurusKayitlari", new { makineKod = "PRES-01", sure = -5 });
        Assert.Equal(HttpStatusCode.BadRequest, negatif.StatusCode);
        Assert.Contains("0 ile 10.000.000", await Mesaj(negatif));

        var uzun = await istemci.PostAsJsonAsync("/api/DurusKayitlari", new { makineKod = new string('X', 51), sure = 5 });
        Assert.Equal(HttpStatusCode.BadRequest, uzun.StatusCode);

        var tip = await istemci.PutAsJsonAsync("/api/MakineVerileri/1", new { vurusSayisi = "yuz" });
        Assert.Equal(HttpStatusCode.BadRequest, tip.StatusCode);

        var hedef = await istemci.PostAsJsonAsync("/api/MakineVerileri/baslat", new { makineKod = "PRES-01", hedefVurus = 0 });
        Assert.Equal(HttpStatusCode.BadRequest, hedef.StatusCode);
    }

    [Fact]
    public async Task Kullanici_olusturma_sifreyi_hashler_ve_kurallari_uygular()
    {
        var istemci = await GirisYap("ahmet", "demo123");

        var kisa = await istemci.PostAsJsonAsync("/api/Users", new { adSoyad = "Test", kullaniciAdi = "test1", sifre = "123", rol = "Operatör" });
        Assert.Equal(HttpStatusCode.BadRequest, kisa.StatusCode);
        Assert.Contains("en az 6", await Mesaj(kisa));

        var rol = await istemci.PostAsJsonAsync("/api/Users", new { adSoyad = "Test", kullaniciAdi = "test1", sifre = "guclu123", rol = "Patron" });
        Assert.Equal(HttpStatusCode.BadRequest, rol.StatusCode);

        var ok = await istemci.PostAsJsonAsync("/api/Users", new { adSoyad = "Test", kullaniciAdi = "test1", sifre = "guclu123", rol = "Operatör" });
        Assert.Equal(HttpStatusCode.OK, ok.StatusCode);
        Assert.DoesNotContain("sifre", (await ok.Content.ReadAsStringAsync()).ToLowerInvariant());

        using var db = _uygulama.VeritabaniAc();
        var kayit = db.Kullanicilar.Single(u => u.KullaniciAdi == "test1");
        Assert.NotEqual("guclu123", kayit.Sifre);
        Assert.True(SifreHasher.Dogrula(kayit.Sifre, "guclu123", out _));
    }

    [Fact]
    public async Task Kullanici_listesi_sifre_dondurmez()
    {
        var istemci = await GirisYap("ahmet", "demo123");
        var govde = await istemci.GetStringAsync("/api/Users");
        Assert.DoesNotContain("sifre", govde.ToLowerInvariant());
        Assert.Contains("ahmet", govde);
    }

    [Fact]
    public async Task Yonetici_kendi_hesabini_silemez()
    {
        var istemci = await GirisYap("ahmet", "demo123");
        int id;
        using (var db = _uygulama.VeritabaniAc()) id = db.Kullanicilar.Single(u => u.KullaniciAdi == "ahmet").Id;

        var yanit = await istemci.DeleteAsync($"/api/Users/{id}");
        Assert.Equal(HttpStatusCode.BadRequest, yanit.StatusCode);
        Assert.Contains("Kendi hesabınızı", await Mesaj(yanit));
    }

    [Fact]
    public async Task Eski_duz_metin_sifre_ilk_giriste_hashe_cevrilir()
    {
        using (var db = _uygulama.VeritabaniAc())
        {
            db.Kullanicilar.Add(new Kullanici { AdSoyad = "Eski", KullaniciAdi = "eski", Sifre = "eski123", Rol = Roller.Operator });
            db.SaveChanges();
        }

        await GirisYap("eski", "eski123");

        using var db2 = _uygulama.VeritabaniAc();
        var sifre = db2.Kullanicilar.Single(u => u.KullaniciAdi == "eski").Sifre;
        Assert.NotEqual("eski123", sifre);
        Assert.True(SifreHasher.Dogrula(sifre, "eski123", out var tekrar));
        Assert.False(tekrar);
    }

    [Fact]
    public async Task Uretim_baslatma_makineyi_calistirir_ve_kaydeder()
    {
        var istemci = await GirisYap("ahmet", "demo123");

        var makineler = await istemci.GetFromJsonAsync<JsonElement>("/api/MakineVerileri");
        Assert.Equal(4, makineler.GetArrayLength());

        var yanit = await istemci.PostAsJsonAsync("/api/MakineVerileri/baslat", new { makineKod = "PRES-02", hedefVurus = 500 });
        Assert.Equal(HttpStatusCode.OK, yanit.StatusCode);

        using var db = _uygulama.VeritabaniAc();
        var makine = db.Makineler.Single(m => m.Kod == "PRES-02");
        Assert.Equal("Çalışıyor", makine.Durum);
        Assert.Equal(500, makine.HedefVurus);

        var yok = await istemci.PostAsJsonAsync("/api/MakineVerileri/baslat", new { makineKod = "PRES-99", hedefVurus = 500 });
        Assert.Equal(HttpStatusCode.NotFound, yok.StatusCode);
    }

    [Fact]
    public async Task Kalip_bakimi_vurus_sayacini_sifirlar()
    {
        var istemci = await GirisYap("ayse", "demo123");
        int id;
        using (var db = _uygulama.VeritabaniAc()) id = db.KalipKayitlari.Single(k => k.KalipKodu == "KLP-004").Id;

        var yanit = await istemci.PostAsync($"/api/KalipKayitlari/bakim-yap/{id}", null);
        Assert.Equal(HttpStatusCode.OK, yanit.StatusCode);

        using var db2 = _uygulama.VeritabaniAc();
        var kalip = db2.KalipKayitlari.Single(k => k.Id == id);
        Assert.Equal(0, kalip.MevcutVurus);
        Assert.Equal("İyi", kalip.Durum);
    }

    [Fact]
    public async Task Oturum_ucu_sayfa_yenilenince_kullaniciyi_geri_yukler()
    {
        Assert.Equal(HttpStatusCode.Unauthorized, (await _uygulama.CreateClient().GetAsync("/api/Auth/oturum")).StatusCode);

        var istemci = await GirisYap("ayse", "demo123");
        var oturum = await istemci.GetFromJsonAsync<JsonElement>("/api/Auth/oturum");
        Assert.Equal("Kalite Mühendisi", oturum.GetProperty("role").GetString());
        Assert.Equal("Ayşe Demir", oturum.GetProperty("username").GetString());
    }

    [Fact]
    public async Task Beni_hatirla_kalici_cookie_verir_secilmezse_oturum_cookiesi()
    {
        var normal = await _uygulama.CreateClient().PostAsJsonAsync("/api/Auth/login", new { username = "ahmet", password = "demo123" });
        Assert.DoesNotContain("expires=", Assert.Single(normal.Headers.GetValues("Set-Cookie")), StringComparison.OrdinalIgnoreCase);

        var hatirla = await _uygulama.CreateClient().PostAsJsonAsync("/api/Auth/login", new { username = "ahmet", password = "demo123", beniHatirla = true });
        var cerez = Assert.Single(hatirla.Headers.GetValues("Set-Cookie"));
        var bitis = DateTimeOffset.Parse(cerez.Split(';').Select(x => x.Trim()).Single(x => x.StartsWith("expires=", StringComparison.OrdinalIgnoreCase))[8..]);
        Assert.InRange(bitis, DateTimeOffset.UtcNow.AddDays(6), DateTimeOffset.UtcNow.AddDays(8));
    }
}
