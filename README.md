# AYD MES Platform (Üretim Yönetim Sistemi)

AYD MES, fabrika üretim sahasındaki makine verilerini, OEE (Genel Ekipman Etkinliği) performansını, duruşları ve kalite süreçlerini gerçek zamanlı olarak takip etmeyi sağlayan web tabanlı bir Üretim Yönetim Sistemi (Manufacturing Execution System) yazılımıdır.

## 🚀 Özellikler

- **Gerçek Zamanlı Makine İzleme:** Fabrikadaki pres vb. makinelerin anlık durumlarını (Çalışıyor, Durdu, Arıza), vuruş sayılarını ve sıcaklık değerlerini canlı olarak takip edebilirsiniz.
- **OEE Analizi ve Dashboard:** Üretim trendlerini, canlı OEE verilerini ve makine performanslarını özet grafiklerle tek ekranda inceleme.
- **Üretim Planlama ve Optimizasyon:** Vardiyalık iş emirlerini (ürün, hat, hedef sayı) oluşturma, planlama ve durumlarını takip etme.
- **Duruş (Downtime) Yönetimi:** Planlı ve plansız duruşları kaydetme, nedenlerini raporlama.
- **Kalıp ve Bakım Yönetimi:** Üretimde kullanılan kalıpların vuruş ömürlerini izleme ve bakım/revizyon süreçlerini yönetme.
- **Kalite Kontrol:** Hatalı ürün (defekt) girişleri yapma ve parti bazlı kalite onay süreçlerini işletme.
- **Fabrika Telemetri Haritası:** Tesis içerisindeki makine yerleşimlerine göre canlı performans renk haritalaması.
- **Çevrimdışı (Offline) Demo Modu:** Backend kapalı olduğunda sistemin otomatik olarak Sahte (Mock) verilerle "Sistem Çevrimdışı" moduna geçip tam teşekküllü çalışmaya devam etmesi. Akıllı Timeout yapısıyla donmaları engeller.

## 🛠️ Teknolojiler

Bu proje iki ana katmandan oluşmaktadır:
1. **Frontend (Kullanıcı Arayüzü):** React.js, Vite, CSS (Responsive & Dark Mode Destekli)
2. **Backend (Sunucu ve API):** C# .NET 8 (RESTful API), Entity Framework Core
3. **Veritabanı:** Microsoft SQL Server (MSSQL)

## 📦 Kurulum ve Çalıştırma

Projeyi yerel bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyebilirsiniz.

### 1. Frontend (React Uygulaması)
Terminal veya komut satırını açıp `ayd-mes-ui` klasörüne gidin:
```bash
cd ayd-mes-ui
npm install
npm run dev
```
Uygulama varsayılan olarak `http://localhost:5173` adresinde çalışacaktır.

### 2. Backend (C# API Uygulaması)
Visual Studio üzerinden veya terminal kullanarak `AydMES.Api` klasörüne gidin:
```bash
cd AydMES.Api
dotnet build
dotnet run
```
API varsayılan olarak `http://localhost:5139` adresinde ayağa kalkacaktır.

### 3. Veritabanı
Proje Code-First yaklaşımı ile yazılmıştır. `AydMES.Api` dizinindeyken aşağıdaki komutu çalıştırarak MSSQL üzerinde gerekli veritabanı tablolarını oluşturabilirsiniz:
```bash
dotnet ef database update
```

## ⚠️ Sık Karşılaşılan Hatalar ve Çözümleri

**1. "Belirtilen komut veya dosya bulunamadı (dotnet-ef)" Hatası**
Veritabanını oluştururken `dotnet ef database update` komutu hata veriyorsa, Entity Framework CLI aracının sisteminizde yüklü olmamasından kaynaklanır. Önce şu komutla aracı kurun:
```bash
dotnet tool install --global dotnet-ef
```
Ardından `database update` komutunu tekrar çalıştırın.

**2. Frontend Giriş Ekranında "Sunucuya bağlanılamadı" Hatası**
Bunun başlıca iki sebebi olabilir:
- **Backend çalışmıyordur:** `AydMES.Api` klasöründe `dotnet run` komutuyla sunucuyu başlattığınızdan emin olun.
- **HTTPS Sertifika Sorunu (CORS/Fetch failed):** Tarayıcı yerel geliştirme sertifikasını engelliyor olabilir. Çözüm olarak `ayd-mes-ui` klasörünün içine `.env` isimli bir dosya oluşturup içine şu satırı ekleyin (böylece sistem otomatik olarak güvenilir HTTP portunu kullanacaktır):
  ```text
  VITE_API_URL=http://localhost:5139/api
  ```
  Ardından `npm run dev` komutunu durdurup tekrar başlatın.

## 🤝 İletişim & Telif Hakkı
Bu proje portfolyo amaçlı geliştirilmiş kapalı kaynaklı (özel) bir projedir. **Tüm telif hakları saklıdır.** Projenin kaynak kodları, tasarımı veya herhangi bir parçası izinsiz olarak başka bir yerde **kullanılamaz, kopyalanamaz, çoğaltılamaz veya ticari amaçlarla satılamaz.** Sadece inceleme (portfolyo) amacıyla görüntülenmesine izin verilmiştir. 

*Geliştirici:* **Doğukan Yaşar Aydın**
