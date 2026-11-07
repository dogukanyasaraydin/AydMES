using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AydMES.Api.Migrations
{
    /// <inheritdoc />
    public partial class IlkKurulum : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DefektKayitlari",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    DefektTuru = table.Column<string>(type: "TEXT", nullable: true),
                    Adet = table.Column<int>(type: "INTEGER", nullable: false),
                    MakineKod = table.Column<string>(type: "TEXT", nullable: true),
                    Oran = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DefektKayitlari", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DevirTeslimKayitlari",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Saat = table.Column<string>(type: "TEXT", nullable: true),
                    TeslimEden = table.Column<string>(type: "TEXT", nullable: true),
                    TeslimAlan = table.Column<string>(type: "TEXT", nullable: true),
                    Not = table.Column<string>(type: "TEXT", nullable: true),
                    Durum = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DevirTeslimKayitlari", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DurusKayitlari",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Saat = table.Column<string>(type: "TEXT", nullable: true),
                    MakineKod = table.Column<string>(type: "TEXT", nullable: true),
                    Neden = table.Column<string>(type: "TEXT", nullable: true),
                    Sure = table.Column<int>(type: "INTEGER", nullable: false),
                    Durum = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DurusKayitlari", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GorevKayitlari",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    GorevAdi = table.Column<string>(type: "TEXT", nullable: true),
                    AtananKisi = table.Column<string>(type: "TEXT", nullable: true),
                    Durum = table.Column<string>(type: "TEXT", nullable: true),
                    Oncelik = table.Column<string>(type: "TEXT", nullable: true),
                    Termin = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GorevKayitlari", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KalipKayitlari",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    KalipKodu = table.Column<string>(type: "TEXT", nullable: true),
                    KalipAdi = table.Column<string>(type: "TEXT", nullable: true),
                    AktifMakine = table.Column<string>(type: "TEXT", nullable: true),
                    Parca = table.Column<string>(type: "TEXT", nullable: true),
                    MevcutVurus = table.Column<int>(type: "INTEGER", nullable: false),
                    BakimLimiti = table.Column<int>(type: "INTEGER", nullable: false),
                    Durum = table.Column<string>(type: "TEXT", nullable: true),
                    SonBakimTarihi = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KalipKayitlari", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KaliteOnaylari",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    PartiKodu = table.Column<string>(type: "TEXT", nullable: true),
                    IslemAdimi = table.Column<string>(type: "TEXT", nullable: true),
                    Durum = table.Column<string>(type: "TEXT", nullable: true),
                    Saat = table.Column<string>(type: "TEXT", nullable: true),
                    OlcumDegeri = table.Column<string>(type: "TEXT", nullable: true),
                    Notlar = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KaliteOnaylari", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Kullanicilar",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    AdSoyad = table.Column<string>(type: "TEXT", nullable: false),
                    KullaniciAdi = table.Column<string>(type: "TEXT", nullable: false),
                    Sifre = table.Column<string>(type: "TEXT", nullable: false),
                    Rol = table.Column<string>(type: "TEXT", nullable: false),
                    Durum = table.Column<string>(type: "TEXT", nullable: false),
                    SonGiris = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Kullanicilar", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Makineler",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Kod = table.Column<string>(type: "TEXT", nullable: false),
                    Aciklama = table.Column<string>(type: "TEXT", nullable: false),
                    Durum = table.Column<string>(type: "TEXT", nullable: false),
                    Sicaklik = table.Column<double>(type: "REAL", nullable: false),
                    Basinc = table.Column<string>(type: "TEXT", nullable: false),
                    VurusSayisi = table.Column<int>(type: "INTEGER", nullable: false),
                    YagSeviyesi = table.Column<string>(type: "TEXT", nullable: false),
                    HedefVurus = table.Column<int>(type: "INTEGER", nullable: false),
                    HataliAdet = table.Column<int>(type: "INTEGER", nullable: true),
                    FireOrani = table.Column<double>(type: "REAL", nullable: false),
                    Vardiya = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Makineler", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OeeKayitlari",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    MakineKod = table.Column<string>(type: "TEXT", nullable: true),
                    Tarih = table.Column<string>(type: "TEXT", nullable: true),
                    Kullanilabilirlik = table.Column<double>(type: "REAL", nullable: false),
                    Performans = table.Column<double>(type: "REAL", nullable: false),
                    Kalite = table.Column<double>(type: "REAL", nullable: false),
                    GenelOee = table.Column<double>(type: "REAL", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OeeKayitlari", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PersonelKayitlari",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Sicil = table.Column<string>(type: "TEXT", nullable: true),
                    AdSoyad = table.Column<string>(type: "TEXT", nullable: true),
                    Vardiya = table.Column<string>(type: "TEXT", nullable: true),
                    Gorev = table.Column<string>(type: "TEXT", nullable: true),
                    Makine = table.Column<string>(type: "TEXT", nullable: true),
                    Yetkinlik = table.Column<string>(type: "TEXT", nullable: true),
                    Durum = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PersonelKayitlari", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UretimLoglari",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Saat = table.Column<string>(type: "TEXT", nullable: true),
                    UretilenAdet = table.Column<int>(type: "INTEGER", nullable: false),
                    HataliAdet = table.Column<int>(type: "INTEGER", nullable: false),
                    DurusSuresi = table.Column<int>(type: "INTEGER", nullable: false),
                    PlanlananSure = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UretimLoglari", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UretimPlanlari",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    SaatAraligi = table.Column<string>(type: "TEXT", nullable: true),
                    IsEmri = table.Column<string>(type: "TEXT", nullable: true),
                    Makine = table.Column<string>(type: "TEXT", nullable: true),
                    Oncelik = table.Column<string>(type: "TEXT", nullable: true),
                    Durum = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UretimPlanlari", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DefektKayitlari");

            migrationBuilder.DropTable(
                name: "DevirTeslimKayitlari");

            migrationBuilder.DropTable(
                name: "DurusKayitlari");

            migrationBuilder.DropTable(
                name: "GorevKayitlari");

            migrationBuilder.DropTable(
                name: "KalipKayitlari");

            migrationBuilder.DropTable(
                name: "KaliteOnaylari");

            migrationBuilder.DropTable(
                name: "Kullanicilar");

            migrationBuilder.DropTable(
                name: "Makineler");

            migrationBuilder.DropTable(
                name: "OeeKayitlari");

            migrationBuilder.DropTable(
                name: "PersonelKayitlari");

            migrationBuilder.DropTable(
                name: "UretimLoglari");

            migrationBuilder.DropTable(
                name: "UretimPlanlari");
        }
    }
}
