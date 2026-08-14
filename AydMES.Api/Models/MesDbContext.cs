using Microsoft.EntityFrameworkCore;
using AydMES.Api.Models;
using AydMES.Models;

namespace AydMES.Api.Models
{
    public class MesDbContext : DbContext
    {
        public MesDbContext(DbContextOptions<MesDbContext> options) : base(options)
        {
        }

        public DbSet<Makine> Makineler { get; set; }
        public DbSet<DurusKaydi> DurusKayitlari { get; set; }
        public DbSet<OeeKaydi> OeeKayitlari { get; set; }
        public DbSet<DefektKaydi> DefektKayitlari { get; set; }
        public DbSet<KalipKaydi> KalipKayitlari { get; set; }
        public DbSet<UretimPlani> UretimPlanlari { get; set; }
        public DbSet<GorevKaydi> GorevKayitlari { get; set; }
        public DbSet<UretimLog> UretimLoglari { get; set; }
        public DbSet<KaliteOnayi> KaliteOnaylari { get; set; }
        public DbSet<PersonelKaydi> PersonelKayitlari { get; set; }
        public DbSet<DevirTeslimKaydi> DevirTeslimKayitlari { get; set; }
    }
}