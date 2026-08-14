using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AydMES.Api.Migrations
{
    /// <inheritdoc />
    public partial class UretimPlaniEklendi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UretimPlanlari",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SaatAraligi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsEmri = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Makine = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Oncelik = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Durum = table.Column<string>(type: "nvarchar(max)", nullable: true)
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
                name: "UretimPlanlari");
        }
    }
}
