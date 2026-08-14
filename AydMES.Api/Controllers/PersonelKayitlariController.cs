using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AydMES.Api.Models;

namespace AydMES.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PersonelKayitlariController : ControllerBase
    {
        private readonly MesDbContext _context;

        public PersonelKayitlariController(MesDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PersonelKaydi>>> GetPersonelKayitlari()
        {
            var liste = await _context.PersonelKayitlari.ToListAsync();
            if (!liste.Any())
            {
                var varsayilanlar = new List<PersonelKaydi>
                {
                    new PersonelKaydi { Sicil = "VST-1042", AdSoyad = "Ahmet Yılmaz", Vardiya = "Vardiya A", Gorev = "Pres Operatörü", Makine = "PRES-01", Yetkinlik = "Seviye 4 (Uzman)", Durum = "Görevde" },
                    new PersonelKaydi { Sicil = "VST-1088", AdSoyad = "Mehmet Demir", Vardiya = "Vardiya A", Gorev = "Pres Operatörü", Makine = "PRES-02", Yetkinlik = "Seviye 3 (Kıdemli)", Durum = "Görevde" },
                    new PersonelKaydi { Sicil = "VST-1104", AdSoyad = "Caner Şahin", Vardiya = "Vardiya A", Gorev = "Kalıp Bağlama Uzmanı", Makine = "PRES-03", Yetkinlik = "Seviye 4 (Uzman)", Durum = "Görevde" },
                    new PersonelKaydi { Sicil = "VST-1120", AdSoyad = "Murat Kaya", Vardiya = "Vardiya A", Gorev = "Kalite Kontrolör", Makine = "PRES-04", Yetkinlik = "Seviye 3 (Kıdemli)", Durum = "İzinde" },
                    new PersonelKaydi { Sicil = "VST-2012", AdSoyad = "Hasan Öztürk", Vardiya = "Vardiya B", Gorev = "Vardiya Amiri", Makine = "Saha Geneli", Yetkinlik = "Seviye 5 (Amir)", Durum = "Görevde" },
                    new PersonelKaydi { Sicil = "VST-2045", AdSoyad = "Emre Çelik", Vardiya = "Vardiya B", Gorev = "Pres Operatörü", Makine = "PRES-01", Yetkinlik = "Seviye 2 (Operatör)", Durum = "Görevde" },
                    new PersonelKaydi { Sicil = "VST-2089", AdSoyad = "Ali Yıldız", Vardiya = "Vardiya B", Gorev = "Pres Operatörü", Makine = "PRES-02", Yetkinlik = "Seviye 3 (Kıdemli)", Durum = "Görevde" },
                    new PersonelKaydi { Sicil = "VST-3001", AdSoyad = "Serkan Arslan", Vardiya = "Vardiya C", Gorev = "Vardiya Amiri", Makine = "Saha Geneli", Yetkinlik = "Seviye 5 (Amir)", Durum = "Görevde" }
                };
                await _context.PersonelKayitlari.AddRangeAsync(varsayilanlar);
                await _context.SaveChangesAsync();
                return Ok(varsayilanlar);
            }
            return Ok(liste);
        }

        [HttpPost]
        public async Task<ActionResult<PersonelKaydi>> PostPersonelKaydi(PersonelKaydi kayit)
        {
            _context.PersonelKayitlari.Add(kayit);
            await _context.SaveChangesAsync();
            return Ok(kayit);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutPersonelKaydi(int id, PersonelKaydi guncelKayit)
        {
            var kayit = await _context.PersonelKayitlari.FindAsync(id);
            if (kayit == null) return NotFound();

            if (!string.IsNullOrEmpty(guncelKayit.Makine)) kayit.Makine = guncelKayit.Makine;
            if (!string.IsNullOrEmpty(guncelKayit.Durum)) kayit.Durum = guncelKayit.Durum;
            if (!string.IsNullOrEmpty(guncelKayit.Vardiya)) kayit.Vardiya = guncelKayit.Vardiya;
            if (!string.IsNullOrEmpty(guncelKayit.Gorev)) kayit.Gorev = guncelKayit.Gorev;

            await _context.SaveChangesAsync();
            return Ok(kayit);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePersonelKaydi(int id)
        {
            var kayit = await _context.PersonelKayitlari.FindAsync(id);
            if (kayit == null) return NotFound();

            _context.PersonelKayitlari.Remove(kayit);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
