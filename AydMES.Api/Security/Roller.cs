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
    }
}
