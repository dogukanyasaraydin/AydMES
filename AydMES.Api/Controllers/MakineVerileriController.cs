using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AydMES.Api.Models;

namespace AydMES.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MakineVerileriController : ControllerBase
    {
        private readonly MesDbContext _context;
        private static readonly Random _random = new Random();

        public MakineVerileriController(MesDbContext context)
        {
            _context = context;
        }

        private List<Makine> GetVarsayilanMakineler()
        {
            return new List<Makine>
            {
                new Makine { Id = 1, Kod = "PRES-01", Aciklama = "Ana Gövde Pres Makinesi", Durum = "Planlı duruş", YagSeviyesi = "%88", Sicaklik = 31.5, Basinc = "0 Bar", VurusSayisi = 0, HedefVurus = 0, HataliAdet = 0, FireOrani = 0.0, Vardiya = "Vardiya A" },
                new Makine { Id = 2, Kod = "PRES-02", Aciklama = "Yan Panel Pres Hattı", Durum = "Planlı duruş", YagSeviyesi = "%92", Sicaklik = 31.8, Basinc = "0 Bar", VurusSayisi = 0, HedefVurus = 0, HataliAdet = 0, FireOrani = 0.0, Vardiya = "Vardiya A" },
                new Makine { Id = 3, Kod = "PRES-03", Aciklama = "Kapak Şekillendirme Presi", Durum = "Planlı duruş", YagSeviyesi = "%74", Sicaklik = 35.0, Basinc = "0 Bar", VurusSayisi = 0, HedefVurus = 0, HataliAdet = 0, FireOrani = 0.0, Vardiya = "Vardiya B" },
                new Makine { Id = 4, Kod = "PRES-04", Aciklama = "Şase Kaynak ve Pres Hattı", Durum = "Bakımda", YagSeviyesi = "%60", Sicaklik = 27.4, Basinc = "0 Bar", VurusSayisi = 0, HedefVurus = 0, HataliAdet = 0, FireOrani = 0.0, Vardiya = "Vardiya C" }
            };
        }

        // GET: api/MakineVerileri
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                var makineler = await _context.Makineler.ToListAsync();

                if (makineler.Count == 0)
                {
                    var baseList = GetVarsayilanMakineler();
                    foreach (var m in baseList)
                    {
                        try
                        {
                            await _context.Database.ExecuteSqlRawAsync(
                                "INSERT INTO Makineler (Kod, Aciklama, Durum, YagSeviyesi, Sicaklik, Basinc, VurusSayisi) VALUES ({0}, {1}, {2}, {3}, {4}, {5}, {6})",
                                m.Kod, m.Aciklama, m.Durum, m.YagSeviyesi, m.Sicaklik, m.Basinc, m.VurusSayisi
                            );
                        }
                        catch { }
                    }
                    makineler = await _context.Makineler.ToListAsync();
                }

                if (makineler.Count == 0)
                {
                    return Ok(GetVarsayilanMakineler());
                }

                return Ok(makineler);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[MakineVerileri GET] DB Error: {ex.Message}");
                return Ok(GetVarsayilanMakineler());
            }
        }

        // PUT: api/MakineVerileri/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMakine(int id, [FromBody] System.Text.Json.JsonElement body)
        {
            // Gövde doğrulaması: tip hatası veya geçersiz değer 400 döner (eskiden sessizce "İşlendi" dönüyordu)
            int vurusSayisi = 0;
            string durum = "Çalışıyor";
            string kod = "";
            if (body.ValueKind != System.Text.Json.JsonValueKind.Object)
                return BadRequest(new { message = "Geçersiz istek gövdesi." });
            if (body.TryGetProperty("vurusSayisi", out var vs)
                && (vs.ValueKind != System.Text.Json.JsonValueKind.Number || !vs.TryGetInt32(out vurusSayisi)))
                return BadRequest(new { message = "vurusSayisi bir tam sayı olmalıdır." });
            if (body.TryGetProperty("durum", out var d))
            {
                if (d.ValueKind != System.Text.Json.JsonValueKind.String) return BadRequest(new { message = "durum metin olmalıdır." });
                durum = d.GetString() ?? "Çalışıyor";
            }
            if (body.TryGetProperty("kod", out var k))
            {
                if (k.ValueKind != System.Text.Json.JsonValueKind.String) return BadRequest(new { message = "kod metin olmalıdır." });
                kod = k.GetString() ?? "";
            }
            if (vurusSayisi < 0 || vurusSayisi > 10_000_000)
                return BadRequest(new { message = "vurusSayisi 0 ile 10.000.000 arasında olmalıdır." });
            if (durum.Length > 50 || kod.Length > 50)
                return BadRequest(new { message = "durum ve kod en fazla 50 karakter olabilir." });

            try
            {

                var makine = await _context.Makineler.FirstOrDefaultAsync(m => m.Id == id || m.Kod == kod);
                if (makine != null)
                {
                    makine.VurusSayisi = vurusSayisi;
                    makine.Durum = durum;
                    try
                    {
                        await _context.SaveChangesAsync();
                    }
                    catch
                    {
                        await _context.Database.ExecuteSqlRawAsync(
                            "UPDATE Makineler SET VurusSayisi = {0}, Durum = {1} WHERE Id = {2} OR Kod = {3}",
                            vurusSayisi, durum, id, kod
                        );
                    }
                }
                else if (!string.IsNullOrEmpty(kod))
                {
                    await _context.Database.ExecuteSqlRawAsync(
                        "UPDATE Makineler SET VurusSayisi = {0}, Durum = {1} WHERE Kod = {2}",
                        vurusSayisi, durum, kod
                    );
                }

                return Ok(new { message = "SQL Server Güncellendi" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[MakineVerileri PUT] Error: {ex.Message}");
                return Ok(new { message = "İşlendi" });
            }
        }

        // POST: api/MakineVerileri/baslat
        [HttpPost("baslat")]
        public async Task<IActionResult> UretimBaslat([FromBody] UretimBaslatIstek istek)
        {
            try
            {
                var makine = await _context.Makineler.FirstOrDefaultAsync(m => m.Kod == istek.MakineKod);
                if (makine != null)
                {
                    makine.VurusSayisi = 0;
                    makine.Durum = "Çalışıyor";
                    makine.HedefVurus = istek.HedefVurus > 0 ? istek.HedefVurus : 1000;
                    makine.HataliAdet = 0;   // Her yeni üretimde fire sayacı sıfırlanır
                    makine.FireOrani = 0.0;  // Fire oranı sıfırlanır
                    try
                    {
                        await _context.SaveChangesAsync();
                    }
                    catch
                    {
                        // EF Core başarısız olursa ham SQL
                        await _context.Database.ExecuteSqlRawAsync(
                            "UPDATE Makineler SET VurusSayisi = 0, Durum = N'Çalışıyor', HedefVurus = {0}, HataliAdet = 0, FireOrani = 0 WHERE Kod = {1}",
                            makine.HedefVurus, istek.MakineKod
                        );
                    }
                }
                else
                {
                    // Makine EF Core'da bulunamadıysa direkt SQL
                    await _context.Database.ExecuteSqlRawAsync(
                        "UPDATE Makineler SET VurusSayisi = 0, Durum = N'Çalışıyor', HedefVurus = {0}, HataliAdet = 0, FireOrani = 0 WHERE Kod = {1}",
                        istek.HedefVurus > 0 ? istek.HedefVurus : 1000, istek.MakineKod
                    );
                }

                return Ok(new { status = "success", makine = istek.MakineKod, hedef = istek.HedefVurus });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[MakineVerileri BASLAT] Error: {ex.Message}");
                return Ok(new { status = "handled", makine = istek.MakineKod });
            }
        }
    }

    public class UretimBaslatIstek
    {
        [Required(ErrorMessage = "Makine kodu zorunludur."), MetinSiniri(50)]
        public string MakineKod { get; set; } = string.Empty;

        [Range(1, 1_000_000, ErrorMessage = "Hedef vuruş 1 ile 1.000.000 arasında olmalıdır.")]
        public int HedefVurus { get; set; }
    }
}