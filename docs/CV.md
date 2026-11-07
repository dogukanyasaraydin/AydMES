# AYD MES — CV / Portfolyo Metinleri

CV'ye, LinkedIn'e veya iş başvurusuna kopyalanabilecek hazır metinler.

---

## 🇹🇷 Türkçe

**AYD MES — Üretim Yönetim Sistemi (MES)** · *Kişisel proje* · React, .NET 8, EF Core, SQLite
[Canlı Demo](https://dogukanyasaraydin.github.io/AydMES/) · [GitHub](https://github.com/dogukanyasaraydin/AydMES)

- Pres hatlarına sahip bir fabrika için makine telemetrisi, OEE, duruş, kalıp ömrü ve kalite süreçlerini gerçek zamanlı izleyen full-stack bir MES uygulaması geliştirdim.
- ASP.NET Core 8 ile 13 kaynak controller'lı bir REST API tasarladım; veri katmanını EF Core Code-First ve migration'larla kurdum (SQLite; tek satırla SQL Server/PostgreSQL'e geçirilebilir). Kurulum gerektirmeyen bu yapı sayesinde proje `dotnet run` ile tek komutta çalışıyor.
- JWT kimlik doğrulaması (httpOnly cookie), PBKDF2 ile şifre hashleme, 5 rollü yetkilendirme (RBAC), girişte deneme sınırı (rate limiting) ve girdi doğrulaması uyguladım; bunları 17 xUnit entegrasyon testiyle doğruladım.
- `BackgroundService` ile makinelerden canlı veri geliyormuş gibi üretim, fire ve iş emri tamamlanmasını üreten bir simülasyon servisi yazdım.
- React 19 ile OEE analizi, 2D/3D dijital ikiz fabrika haritası, üretim planlama, PDF/Excel raporlama ve koyu tema içeren 9 modüllü bir arayüz geliştirdim.
- Backend'e ulaşılamadığında arayüzün donmadan örnek verilerle çalışmaya devam ettiği bir çevrimdışı mod kurdum. Bu mod sayesinde frontend GitHub Pages'te canlı demo olarak yayınlanıyor.
- GitHub Actions ile her push'ta backend build ve frontend lint + build kontrollerini, ayrıca otomatik demo yayınını içeren bir CI/CD hattı kurdum.

**Kısa sürüm (tek satır):**
> React 19 ve .NET 8 ile fabrika üretimini (OEE, duruş, kalite, kalıp) gerçek zamanlı izleyen, JWT ve rol bazlı yetkilendirmeyle korunan full-stack bir MES uygulaması.

---

## 🇬🇧 English

**AYD MES — Manufacturing Execution System** · *Personal project* · React, .NET 8, EF Core, SQLite
[Live Demo](https://dogukanyasaraydin.github.io/AydMES/) · [GitHub](https://github.com/dogukanyasaraydin/AydMES)

- Built a full-stack MES that monitors machine telemetry, OEE, downtime, die life and quality in real time for a press-line factory.
- Designed a REST API with 13 resource controllers in ASP.NET Core 8, with an EF Core code-first data layer and migrations (SQLite, switchable to SQL Server or PostgreSQL in one line), so the whole backend runs with a single `dotnet run`.
- Implemented JWT authentication (httpOnly cookie), PBKDF2 password hashing, role-based access control with 5 roles, login rate limiting and input validation, all verified by 17 xUnit integration tests.
- Wrote a `BackgroundService` simulation that produces strokes, scrap and work-order completion as if machines were streaming data live.
- Developed a 9-module React 19 UI with OEE analytics, a 2D/3D digital-twin factory map, production planning, PDF/Excel reporting and a dark theme.
- Added an offline mode that keeps the UI working on sample data when the API is unreachable. This lets the frontend run as a live demo on GitHub Pages.
- Set up a GitHub Actions CI/CD pipeline that builds the backend, lints and builds the frontend, and deploys the demo automatically on every push.

**One-liner:**
> Full-stack MES built with React 19 and .NET 8 that tracks factory production (OEE, downtime, quality, dies) in real time, secured with JWT and role-based access control.

---

## Mülakatta anlatılabilecek teknik noktalar

- **Neden token cookie'de?** `localStorage`'daki token, sayfadaki herhangi bir XSS açığıyla JavaScript tarafından okunabilir. httpOnly cookie'ye JavaScript erişemez. SameSite=Strict de başka sitelerden gelen isteklerde cookie gönderilmesini engelleyerek CSRF'yi önler.
- **Yazma yetkisi neden tek kural (convention)?** GET dışındaki her action otomatik olarak düzenleme rolü istiyor. Yeni bir controller'da yetki etiketi unutulsa bile Operatör veri değiştiremez.
- **Neden fallback authorization policy?** Yeni bir controller eklenip `[Authorize]` unutulsa bile uç nokta açık kalmaz. Açık olması gerekenler (`login`, `health`) bilinçli olarak `[AllowAnonymous]` ile işaretleniyor.
- **Eski düz metin şifrelerin geçişi:** `SifreHasher`, hash formatında olmayan eski kayıtları bir kereye mahsus sabit zamanlı karşılaştırmayla doğruluyor ve ilk başarılı girişte hash'e çeviriyor. Böylece mevcut kullanıcılar şifre sıfırlamak zorunda kalmıyor.
- **Çevrimdışı mod:** `fetch` sarmalayıcısı istekleri zaman aşımına bağlıyor ve backend'in durumunu global bir olayla (`backend-status`) yayınlıyor. Sayfalar hata durumunda mock veriye düşüyor.
- **OEE:** Kullanılabilirlik × Performans × Kalite. Simülasyon servisi fire üreterek kalite bileşenini gerçekçi biçimde etkiliyor.
