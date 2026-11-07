namespace AydMES.Api.Security
{
    /// <summary>
    /// JWT tarayıcıda JavaScript'in okuyamadığı httpOnly bir cookie'de taşınır (XSS ile çalınamaz).
    /// SameSite=Strict, başka sitelerden gelen isteklerde cookie'nin gönderilmesini engeller (CSRF koruması).
    /// </summary>
    public static class OturumCerezi
    {
        public const string Ad = "aydmes_oturum";

        public static CookieOptions Secenekler(HttpRequest istek, DateTimeOffset? bitis) => new()
        {
            HttpOnly = true,
            Secure = istek.IsHttps,
            SameSite = SameSiteMode.Strict,
            Path = "/api",
            Expires = bitis
        };
    }
}
