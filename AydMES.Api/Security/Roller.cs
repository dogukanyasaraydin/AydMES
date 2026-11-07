namespace AydMES.Api.Security
{
    /// <summary>Rol bazlı yetkilendirmede kullanılan rol adları (frontend'deki permissions.js ile aynı).</summary>
    public static class Roller
    {
        public const string FabrikaMuduru = "Fabrika Müdürü";
        public const string KaliteMuhendisi = "Kalite Mühendisi";
        public const string Operator = "Operatör";
        public const string YazilimStajyeri = "Yazılım Stajyeri";
        public const string Supervizor = "Süpervizör";

        /// <summary>Kullanıcı yönetimi yapabilen roller.</summary>
        public const string Yoneticiler = FabrikaMuduru + "," + Supervizor + "," + YazilimStajyeri;

        /// <summary>Veri ekleyip/düzenleyip/silebilen roller (frontend'deki canEdit ile aynı). Operatör salt-okunurdur.</summary>
        public static readonly string[] Duzenleyiciler = { FabrikaMuduru, KaliteMuhendisi, YazilimStajyeri, Supervizor };

        public static readonly string[] Tumu = { FabrikaMuduru, KaliteMuhendisi, Operator, YazilimStajyeri, Supervizor };

        public static readonly string[] YoneticiListesi = Yoneticiler.Split(',');
    }
}
