using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AydMES.Api.Migrations
{
    /// <inheritdoc />
    public partial class KalipTablosuEklendi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "KalipKayitlari",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    KalipKodu = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AktifMakine = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Parca = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MevcutVurus = table.Column<int>(type: "int", nullable: false),
                    BakimLimiti = table.Column<int>(type: "int", nullable: false),
                    Durum = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KalipKayitlari", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "KalipKayitlari");
        }
    }
}
