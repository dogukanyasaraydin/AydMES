using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AydMES.Api.Migrations
{
    /// <inheritdoc />
    public partial class OeeTablosuEklendi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OeeKayitlari",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MakineKod = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Tarih = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Kullanilabilirlik = table.Column<double>(type: "float", nullable: false),
                    Performans = table.Column<double>(type: "float", nullable: false),
                    Kalite = table.Column<double>(type: "float", nullable: false),
                    GenelOee = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OeeKayitlari", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OeeKayitlari");
        }
    }
}
