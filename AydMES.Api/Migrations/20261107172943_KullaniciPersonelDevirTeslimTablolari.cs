using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AydMES.Api.Migrations
{
    /// <inheritdoc />
    public partial class KullaniciPersonelDevirTeslimTablolari : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Bu tablolar/kolonlar daha önce migration'a eklenmeden modele girmişti ve eski kurulumlarda
            // VeriTohumlayici tarafından elle oluşturulmuş olabilir. Bu yüzden her adım "yoksa ekle" şeklinde.
            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Makineler' AND COLUMN_NAME = 'Basinc' AND DATA_TYPE = 'int')
BEGIN
    DECLARE @df sysname;
    SELECT @df = d.name FROM sys.default_constraints d
    INNER JOIN sys.columns c ON d.parent_column_id = c.column_id AND d.parent_object_id = c.object_id
    WHERE d.parent_object_id = OBJECT_ID(N'Makineler') AND c.name = N'Basinc';
    IF @df IS NOT NULL EXEC(N'ALTER TABLE [Makineler] DROP CONSTRAINT [' + @df + '];');
    ALTER TABLE [Makineler] ALTER COLUMN [Basinc] nvarchar(max) NULL;
END");

            migrationBuilder.Sql("IF COL_LENGTH('Makineler', 'FireOrani') IS NULL ALTER TABLE [Makineler] ADD [FireOrani] float NOT NULL DEFAULT 0.0E0;");
            migrationBuilder.Sql("IF COL_LENGTH('Makineler', 'HataliAdet') IS NULL ALTER TABLE [Makineler] ADD [HataliAdet] int NULL;");
            migrationBuilder.Sql("IF COL_LENGTH('Makineler', 'HedefVurus') IS NULL ALTER TABLE [Makineler] ADD [HedefVurus] int NOT NULL DEFAULT 0;");
            migrationBuilder.Sql("IF COL_LENGTH('KalipKayitlari', 'KalipAdi') IS NULL ALTER TABLE [KalipKayitlari] ADD [KalipAdi] nvarchar(max) NULL;");
            migrationBuilder.Sql("IF COL_LENGTH('KalipKayitlari', 'SonBakimTarihi') IS NULL ALTER TABLE [KalipKayitlari] ADD [SonBakimTarihi] nvarchar(max) NULL;");

            migrationBuilder.Sql(@"
IF OBJECT_ID(N'DevirTeslimKayitlari', N'U') IS NULL
CREATE TABLE [DevirTeslimKayitlari] (
    [Id] int NOT NULL IDENTITY,
    [Saat] nvarchar(max) NULL,
    [TeslimEden] nvarchar(max) NULL,
    [TeslimAlan] nvarchar(max) NULL,
    [Not] nvarchar(max) NULL,
    [Durum] nvarchar(max) NULL,
    CONSTRAINT [PK_DevirTeslimKayitlari] PRIMARY KEY ([Id])
);");

            migrationBuilder.Sql(@"
IF OBJECT_ID(N'Kullanicilar', N'U') IS NULL
CREATE TABLE [Kullanicilar] (
    [Id] int NOT NULL IDENTITY,
    [AdSoyad] nvarchar(max) NOT NULL,
    [KullaniciAdi] nvarchar(max) NOT NULL,
    [Sifre] nvarchar(max) NOT NULL,
    [Rol] nvarchar(max) NOT NULL,
    [Durum] nvarchar(max) NOT NULL,
    [SonGiris] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Kullanicilar] PRIMARY KEY ([Id])
);");

            migrationBuilder.Sql(@"
IF OBJECT_ID(N'PersonelKayitlari', N'U') IS NULL
CREATE TABLE [PersonelKayitlari] (
    [Id] int NOT NULL IDENTITY,
    [Sicil] nvarchar(max) NULL,
    [AdSoyad] nvarchar(max) NULL,
    [Vardiya] nvarchar(max) NULL,
    [Gorev] nvarchar(max) NULL,
    [Makine] nvarchar(max) NULL,
    [Yetkinlik] nvarchar(max) NULL,
    [Durum] nvarchar(max) NULL,
    CONSTRAINT [PK_PersonelKayitlari] PRIMARY KEY ([Id])
);");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DevirTeslimKayitlari");

            migrationBuilder.DropTable(
                name: "Kullanicilar");

            migrationBuilder.DropTable(
                name: "PersonelKayitlari");

            migrationBuilder.DropColumn(
                name: "FireOrani",
                table: "Makineler");

            migrationBuilder.DropColumn(
                name: "HataliAdet",
                table: "Makineler");

            migrationBuilder.DropColumn(
                name: "HedefVurus",
                table: "Makineler");

            migrationBuilder.DropColumn(
                name: "KalipAdi",
                table: "KalipKayitlari");

            migrationBuilder.DropColumn(
                name: "SonBakimTarihi",
                table: "KalipKayitlari");

            migrationBuilder.AlterColumn<int>(
                name: "Basinc",
                table: "Makineler",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");
        }
    }
}
