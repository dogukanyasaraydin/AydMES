using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AydMES.Api.Migrations
{
    /// <inheritdoc />
    public partial class UretimLoglariEklendi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UretimLoglari",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Saat = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UretilenAdet = table.Column<int>(type: "int", nullable: false),
                    HataliAdet = table.Column<int>(type: "int", nullable: false),
                    DurusSuresi = table.Column<int>(type: "int", nullable: false),
                    PlanlananSure = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UretimLoglari", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UretimLoglari");
        }
    }
}
