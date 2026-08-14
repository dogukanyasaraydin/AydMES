import { useMemo, useState, useEffect } from 'react';
import PageContent from './pages/PageContent';
import { rolePermissions } from './utils/permissions';
import { Toast, LoginScreen, CalendarModal, AyarlarModal } from './components/AppShell';

const menuItems = [
  ['dashboard', '▦', 'Genel Bakış'],
  ['map', '◈', 'Dijital İkiz Haritası'],
  ['production', '◫', 'Üretim Planlama'],
  ['machines', '◉', 'Pres Makineleri'],
  ['analytics', '⌁', 'OEE & Analiz'],
  ['stops', '△', 'Duruş Kayıtları'],
  ['molds', '◇', 'Kalıp Yönetimi'],
  ['quality', '✓', 'Kalite Kontrol'],
];

const pageMeta = {
  dashboard: ['Genel Bakış', 'Vardiya performansını ve öncelikli aksiyonları tek ekranda izleyin.'],
  map: ['Fabrika Haritası (Dijital İkiz)', 'Fabrika katı mimari yerleşimi, 2D/3D kuş bakışı görünüm ve canlı telemetri odaklanması.'],
  production: ['Üretim Planlama', 'Bugünün planını, iş emirlerini ve kaynak uygunluğunu yönetin.'],
  machines: ['Pres Makineleri', 'Hat telemetrisi, kapasite ve bakım durumlarını anlık takip edin.'],
  analytics: ['OEE & Analiz', 'Kullanılabilirlik, performans ve kalite verilerini karşılaştırın.'],
  stops: ['Duruş Kayıtları', 'Andon kayıtlarını inceleyin ve kök neden çalışmalarını yönetin.'],
  molds: ['Kalıp Yönetimi', 'Kalıp ömrü, değişim planı ve bakım ihtiyaçlarını takip edin.'],
  quality: ['Kalite Kontrol', 'Defekt trendlerini, kontrol planlarını ve kalite onaylarını yönetin.'],
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(localStorage.getItem("role") || 'Yazılım Stajyeri');
  const [userName, setUserName] = useState(localStorage.getItem("username") || 'Doğukan Aydın');
  const [page, setPage] = useState('dashboard');
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState(false);
  
  const [isTakvimAcik, setIsTakvimAcik] = useState(false);
  const [isYeniKayitAcik, setIsYeniKayitAcik] = useState(false);
  const [tarihFiltresi, setTarihFiltresi] = useState({ baslangic: '', bitis: '', preset: 'Tüm Zamanlar' });
  
  const [isAyarlarAcik, setIsAyarlarAcik] = useState(false); 
  const [isKullaniciMenuAcik, setIsKullaniciMenuAcik] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState(true);

  useEffect(() => {
    const handleStatus = (e) => setIsBackendOnline(e.detail);
    window.addEventListener('backend-status', handleStatus);
    return () => window.removeEventListener('backend-status', handleStatus);
  }, []);

  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  const gosterBildirim = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const [ayarlar, setAyarlar] = useState({
    tema: 'light', 
    yenilemeHizi: 5000, 
    sicaklikLimiti: 55, 
    varsayilanVardiya: 'Vardiya A'
  });

  const [yeniUretim, setYeniUretim] = useState({
    makineKod: 'PRES-01', 
    urun: 'Ana Gövde Sac Parçası', 
    hedefVurus: '1000', 
    saat: '18:00'
  });

  useEffect(() => {
    const sistemDurumunuKontrolEt = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:7193/api";
        const response = await fetch(`${apiUrl}/MakineVerileri`, { method: 'GET' });
        setIsBackendOnline(response.ok);
      } catch {
        setIsBackendOnline(false); 
      }
    };

    sistemDurumunuKontrolEt();
    const timer = setInterval(sistemDurumunuKontrolEt, ayarlar.yenilemeHizi); 
    return () => clearInterval(timer);
  }, [ayarlar.yenilemeHizi]); 

  // Dark mode effect on body
  useEffect(() => {
    if (ayarlar.tema === 'dark') {
      document.body.classList.add('theme-dark');
    } else {
      document.body.classList.remove('theme-dark');
    }
  }, [ayarlar.tema]);

  const uretimKaydet = async (e) => {
    e.preventDefault(); 
    
    const parsedHedef = parseInt(yeniUretim.hedefVurus);

    if (isNaN(parsedHedef) || parsedHedef <= 0) {
      return gosterBildirim("Geçerli bir hedef vuruş sayısı giriniz (Örn: 1000).", "error");
    }

    const isEmriKodu = 'IE-' + Math.floor(100 + Math.random() * 900);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:7193/api";
      
      await fetch(`${apiUrl}/UretimLoglari`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isEmri: isEmriKodu,
          hat: yeniUretim.makineKod,
          urun: yeniUretim.urun,
          hedef: parsedHedef,
          uretilen: 0,
          saat: yeniUretim.saat,
          durum: 'Üretimde'
        }),
      }).catch(() => {});

      // C# Web API POST /api/MakineVerileri/baslat ile SQL Server'da makineyi 0'dan hedefe başlatır
      await fetch(`${apiUrl}/MakineVerileri/baslat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          makineKod: yeniUretim.makineKod,
          hedefVurus: parsedHedef
        }),
      }).catch(() => {});

      window.dispatchEvent(new CustomEvent('yeniUretimBaslatildi', { 
        detail: { 
          makineKod: yeniUretim.makineKod, 
          hedefVurus: parsedHedef, 
          urun: yeniUretim.urun,
          isEmri: isEmriKodu
        } 
      }));

      setIsYeniKayitAcik(false);
      setYeniUretim({ makineKod: 'PRES-01', urun: 'Ana Gövde Sac Parçası', hedefVurus: '1000', saat: '18:00' });
      gosterBildirim(`🚀 ${yeniUretim.makineKod} için 0'dan ${parsedHedef} vuruşluk üretim başlatıldı!`, "success");
    } catch { 
      gosterBildirim("Sunucu bağlantı hatası!", "error"); 
    }
  };

  const handleLogin = (role, name) => {
    const activeRole = role || 'Yazılım Stajyeri';
    const activeName = name || (activeRole === 'Fabrika Müdürü' ? 'Ahmet Yılmaz' : activeRole === 'Kalite Mühendisi' ? 'Ayşe Demir' : activeRole === 'Operatör' ? 'Mehmet Kaya' : 'Doğukan Aydın');
    
    setUserRole(activeRole);
    setUserName(activeName);
    localStorage.setItem('role', activeRole);
    localStorage.setItem('username', activeName);
    
    const allowed = rolePermissions[activeRole] || rolePermissions['Yazılım Stajyeri'];
    setPage(allowed[0]);
    setIsAuthenticated(true);
    gosterBildirim(`Hoş geldiniz ${activeName} (${activeRole})!`, 'success');
  };

  const handleRoleChange = (newRole) => {
    setUserRole(newRole);
    localStorage.setItem('role', newRole);
    const allowed = rolePermissions[newRole] || rolePermissions['Yazılım Stajyeri'];
    if (!allowed.includes(page)) {
      setPage(allowed[0]);
    }
    setIsKullaniciMenuAcik(false);
    gosterBildirim(`Aktif rol değiştirildi: ${newRole}`, 'info');
  };

  const [title, subtitle] = pageMeta[page] || ['MES Platform', 'Üretim yönetim paneli'];
  
  const menu = useMemo(() => {
    const allowed = rolePermissions[userRole] || rolePermissions['Yazılım Stajyeri'];
    return menuItems.filter(([id, , label]) => 
      allowed.includes(id) && label.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr'))
    );
  }, [userRole, query]);
  
  if (!isAuthenticated) return <LoginScreen onLogin={handleLogin} />;
  
  const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2);

  return (
    <div className={`app-shell ${ayarlar.tema === 'dark' ? 'theme-dark' : ''}`}>
      
      <Toast toast={toast} ayarlar={ayarlar} />

      <aside className="sidebar">
        <div>
          <div className="brand">
            <span className="brand-mark">A</span>
            <div><strong>AYD</strong><small>MES PLATFORM</small></div>
          </div>
          <nav>
            {menu.map(([id, icon, label]) => (
              <button key={id} className={page === id ? 'nav-item active' : 'nav-item'} onClick={() => { setPage(id); setQuery(''); }}>
                <span>{icon}</span>{label}
              </button>
            ))}
          </nav>
        </div>
        <div className="sidebar-bottom">
          
          <div className="system-status" style={{
            padding: '12px', borderRadius: '8px', marginBottom: '16px',
            backgroundColor: isBackendOnline ? (ayarlar.tema === 'dark' ? 'rgba(56,178,172,0.1)' : '#E6FFFA') : (ayarlar.tema === 'dark' ? 'rgba(229,62,62,0.1)' : '#FFF5F5'),
            border: `1px solid ${isBackendOnline ? '#38B2AC' : '#E53E3E'}`, transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '13px', color: isBackendOnline ? '#38B2AC' : '#FC8181' }}>
              <span style={{ 
                width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isBackendOnline ? '#38B2AC' : '#E53E3E',
                boxShadow: isBackendOnline ? '0 0 0 2px rgba(56,178,172, 0.2)' : '0 0 0 2px rgba(229,62,62, 0.2)'
              }}></span>
              {isBackendOnline ? 'Tüm sistemler çalışıyor' : 'Sistem Çevrimdışı'}
            </div>
          </div>

          <button className="nav-item" onClick={() => setIsAyarlarAcik(true)}>Ayarlar</button>
          
          <div style={{ position: 'relative' }}>
            <div className="user-card" onClick={() => setIsKullaniciMenuAcik(!isKullaniciMenuAcik)} style={{ cursor: 'pointer' }}>
              <span className="avatar">{userInitials}</span>
              <div><strong>{userName}</strong><small>{userRole}</small></div>
              <span>{isKullaniciMenuAcik ? '▲' : '▼'}</span>
            </div>
            
            {isKullaniciMenuAcik && (
              <div style={{ 
                position: 'absolute', bottom: 'calc(100% + 10px)', left: 0, width: '220px', 
                backgroundColor: ayarlar.tema === 'dark' ? '#2D3748' : '#fff', 
                borderRadius: '8px', border: `1px solid ${ayarlar.tema === 'dark' ? '#4A5568' : '#E2E8F0'}`, 
                boxShadow: '0 -4px 15px rgba(0,0,0,0.15)', zIndex: 100, overflow: 'hidden' 
              }}>
                <div style={{ padding: '10px 15px', borderBottom: `1px solid ${ayarlar.tema === 'dark' ? '#4A5568' : '#EDF2F7'}` }}>
                  <span style={{ fontSize: '11px', color: '#A0AEC0', fontWeight: 'bold' }}>ROL DEĞİŞTİR:</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                    {Object.keys(rolePermissions).map(r => (
                      <div 
                        key={r} 
                        onClick={() => handleRoleChange(r)}
                        style={{ 
                          padding: '6px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer',
                          backgroundColor: userRole === r ? (ayarlar.tema === 'dark' ? '#4A5568' : '#EBF8FF') : 'transparent',
                          color: userRole === r ? '#3182CE' : 'inherit', fontWeight: userRole === r ? 'bold' : 'normal'
                        }}
                      >
                        {userRole === r ? '✓ ' : ''}{r}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ padding: '10px 15px', cursor: 'pointer', borderBottom: `1px solid ${ayarlar.tema === 'dark' ? '#4A5568' : '#EDF2F7'}` }} onClick={() => { setIsKullaniciMenuAcik(false); setIsAyarlarAcik(true); }}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Ayarlar</span>
                </div>
                <div style={{ padding: '10px 15px', cursor: 'pointer', color: '#E53E3E' }} onClick={() => setIsAuthenticated(false)}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Çıkış Yap</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid #E2E8F0', position: 'relative' }}>
          <div className="search" style={{ position: 'relative', width: '350px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#A0AEC0', fontSize: '13px', fontWeight: 'bold' }}>ARA</span>
            <input 
              value={query} onChange={(event) => setQuery(event.target.value)} placeholder="İş emri, makine veya operatör ara..." 
              style={{ width: '100%', padding: '10px 10px 10px 48px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: ayarlar.tema === 'dark' ? '#1A202C' : '#F7FAFC', outline: 'none', transition: 'all 0.2s', fontSize: '14px' }}
            />
          </div>

          <div className="top-actions" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', 
              backgroundColor: isBackendOnline ? (ayarlar.tema === 'dark' ? 'rgba(56,178,172,0.1)' : '#E6FFFA') : (ayarlar.tema === 'dark' ? 'rgba(229,62,62,0.1)' : '#FFF5F5'), 
              border: `1px solid ${isBackendOnline ? '#B2F5EA' : '#FEB2B2'}`, transition: 'all 0.3s ease'
            }}>
              <span style={{ 
                width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isBackendOnline ? '#38B2AC' : '#E53E3E',
                boxShadow: isBackendOnline ? '0 0 0 2px rgba(56,178,172, 0.2)' : '0 0 0 2px rgba(229,62,62, 0.2)'
              }}></span>
              <span style={{ color: isBackendOnline ? '#38B2AC' : '#FC8181', fontSize: '13px', fontWeight: 'bold' }}>
                {isBackendOnline ? 'Canlı' : 'Bağlantı Yok'}
              </span>
            </div>

            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setNotice(!notice)}
                style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: '8px', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', position: 'relative', transition: 'background-color 0.2s' }}
              >
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#4A5568' }}>BİLD</span>
                {isBackendOnline && <span style={{ position: 'absolute', top: '-6px', right: '-6px', backgroundColor: '#E53E3E', color: 'white', fontSize: '10px', fontWeight: 'bold', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>2</span>}
              </button>

              {notice && (
                <div style={{ position: 'absolute', top: '50px', right: '0', width: '320px', backgroundColor: ayarlar.tema === 'dark' ? '#2D3748' : '#fff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0', zIndex: 100, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E8F0', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', backgroundColor: ayarlar.tema === 'dark' ? '#1A202C' : '#F7FAFC' }}>
                    Bildirimler <span onClick={() => setNotice(false)} style={{ fontSize: '12px', color: '#3182CE', cursor: 'pointer', fontWeight: 'normal' }}>Tümünü okundu işaretle</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {isBackendOnline ? (
                      <>
                        <div style={{ padding: '14px 16px', borderBottom: '1px solid #EDF2F7', cursor: 'pointer', backgroundColor: ayarlar.tema === 'dark' ? 'rgba(49,130,206,0.1)' : '#EBF8FF', transition: 'background-color 0.2s' }}>
                          <strong style={{ display: 'block', fontSize: '13px', color: '#3182CE', marginBottom: '4px' }}>Umut Bey'den mesaj</strong>
                          <span style={{ fontSize: '12px', lineHeight: '1.4' }}>Yazılım kurulum izinleri için attığın maili inceledim, onay veriyorum.</span>
                        </div>
                        <div style={{ padding: '14px 16px', cursor: 'pointer', transition: 'background-color 0.2s' }}>
                          <strong style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Sistem Uyarısı</strong>
                          <span style={{ fontSize: '12px', lineHeight: '1.4' }}>PRES-02 için planlı duruş kaydı oluşturuldu.</span>
                        </div>
                      </>
                    ) : (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#A0AEC0', fontSize: '13px' }}>Bağlantı kurulamadığı için bildirimler yüklenemedi.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '24px', borderLeft: '1px solid #E2E8F0' }}>
              <div style={{ backgroundColor: '#2D3748', color: 'white', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '15px', letterSpacing: '1px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                {userInitials}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: '14px' }}>{userName}</strong>
                <span className={`badge badge-${userRole === 'Fabrika Müdürü' ? 'danger' : userRole === 'Kalite Mühendisi' ? 'info' : userRole === 'Operatör' ? 'success' : 'warning'}`} style={{ marginTop: '3px', width: 'fit-content' }}>
                  {userRole}
                </span>
              </div>
            </div>

          </div>
        </header>
        
        <div className="page-area">
          <div className="page-heading">
            <div>
              <div className="breadcrumb">MES Platform <span>/</span> {title}</div>
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
            <div className="page-actions">
              {page === 'production' && (
                <>
                  <button className="outline-button" onClick={() => setIsTakvimAcik(true)}>📅 Üretim Takvimi</button>
                  <button className="primary-button" onClick={() => setIsYeniKayitAcik(true)}>+ Yeni Üretim Başlat</button>
                </>
              )}
              {page === 'dashboard' && (
                <>
                  <button className="outline-button" onClick={() => setIsTakvimAcik(true)}>📅 Tarih Seç</button>
                  <button className="primary-button" onClick={() => window.dispatchEvent(new CustomEvent('app-pdf-export'))}>Rapor Çıktısı Al</button>
                </>
              )}
              {page === 'analytics' && (
                <>
                  <button className="outline-button" onClick={() => setIsTakvimAcik(true)}>📅 Tarih Aralığı</button>
                  <button className="primary-button" onClick={() => window.dispatchEvent(new CustomEvent('app-excel-export'))}>⬇ Excel'e Aktar</button>
                </>
              )}
              {page === 'stops' && (
                <>
                  <button className="outline-button" onClick={() => setIsTakvimAcik(true)}>📅 Tarih Filtresi</button>
                  <button className="primary-button" onClick={() => window.dispatchEvent(new CustomEvent('app-pdf-export'))}>Rapor Al</button>
                </>
              )}
              {page === 'quality' && (
                <>
                  <button className="outline-button" onClick={() => setIsTakvimAcik(true)}>📅 Tarih Filtresi</button>
                  <button className="primary-button" onClick={() => window.dispatchEvent(new CustomEvent('app-quality-form-open'))}>+ Yeni Kontrol Formu</button>
                </>
              )}
              {page === 'molds' && (
                <>
                  <button className="outline-button" onClick={() => window.dispatchEvent(new CustomEvent('app-data-refresh'))}>🔄 Liste Yenile</button>
                  <button className="primary-button" onClick={() => window.dispatchEvent(new CustomEvent('app-mold-form-open'))}>+ Yeni Kalıp Ekle</button>
                </>
              )}
              {page === 'machines' && (
                <>
                  <button className="outline-button" onClick={() => window.dispatchEvent(new CustomEvent('app-data-refresh'))}>🔄 Verileri Yenile</button>
                </>
              )}
            </div>
          </div>
          
          {!isBackendOnline && (
            <div style={{
              backgroundColor: ayarlar.tema === 'dark' ? 'rgba(221, 107, 32, 0.15)' : '#FEFCBF',
              color: ayarlar.tema === 'dark' ? '#FBD38D' : '#975A16',
              padding: '12px 24px',
              borderBottom: ayarlar.tema === 'dark' ? '1px solid rgba(221, 107, 32, 0.3)' : '1px solid #F6E05E',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '13px',
              fontWeight: '500',
              textAlign: 'center',
              letterSpacing: '0.3px'
            }}>
              <strong style={{ marginRight: '6px' }}>⚠️ DEMO MODU:</strong> Sistem şu an çevrimdışı ve sahte (mock) verilerle çalışıyor. Gerçek zamanlı veriler için lütfen C# Backend (API) uygulamasını başlatın ve SQL bağlantılarınızı kontrol edin.
            </div>
          )}

          <PageContent page={page} userRole={userRole} ayarlar={ayarlar} gosterBildirim={gosterBildirim} setPage={setPage} isBackendOnline={isBackendOnline} tarihFiltresi={tarihFiltresi} />
        </div>
      </main>

      <CalendarModal isOpen={isTakvimAcik} onClose={() => setIsTakvimAcik(false)} page={page} tarihFiltresi={tarihFiltresi} setTarihFiltresi={setTarihFiltresi} ayarlar={ayarlar} />
      <AyarlarModal isOpen={isAyarlarAcik} onClose={() => setIsAyarlarAcik(false)} ayarlar={ayarlar} setAyarlar={setAyarlar} gosterBildirim={gosterBildirim} />

      {isYeniKayitAcik && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div style={{
            backgroundColor: ayarlar.tema === 'dark' ? '#2D3748' : '#FAFAFA', padding: '32px', borderRadius: '12px', width: '420px',
            border: `1px solid ${ayarlar.tema === 'dark' ? '#4A5568' : '#E5E7EB'}`, boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '8px' }}>Yeni Üretim Başlat</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#718096' }}>Seçtiğiniz makine 0 vuruştan girilen hedefe kadar canlı üretime başlar.</p>
            <form onSubmit={uretimKaydet} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                Makine Seçin
                <select value={yeniUretim.makineKod} onChange={(e) => setYeniUretim({...yeniUretim, makineKod: e.target.value})} style={{ padding: '9px', borderRadius: '6px', border: '1px solid #CBD5E0' }}>
                  <option value="PRES-01">PRES-01 (Ana Gövde Presi)</option>
                  <option value="PRES-02">PRES-02 (Yan Panel Pres Hattı)</option>
                  <option value="PRES-03">PRES-03 (Kapak Şekillendirme Presi)</option>
                  <option value="PRES-04">PRES-04 (Şase Kaynak ve Pres Hattı)</option>
                </select>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                📦 Ürün Adı / Kodu
                <input required type="text" value={yeniUretim.urun} onChange={(e) => setYeniUretim({...yeniUretim, urun: e.target.value})} placeholder="Örn: Ön Panel Sac Şekilleme - YP-102" style={{ padding: '9px', borderRadius: '6px', border: '1px solid #CBD5E0' }} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                🎯 Hedef Vuruş Sayısı (0'dan kaça kadar vursun?)
                <input required type="number" min="1" value={yeniUretim.hedefVurus} onChange={(e) => setYeniUretim({...yeniUretim, hedefVurus: e.target.value})} placeholder="Örn: 1000" style={{ padding: '9px', borderRadius: '6px', border: '1px solid #CBD5E0' }} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                🕒 Başlangıç Vardiya Saati
                <select value={yeniUretim.saat} onChange={(e) => setYeniUretim({...yeniUretim, saat: e.target.value})} style={{ padding: '9px', borderRadius: '6px', border: '1px solid #CBD5E0' }}>
                  <option value="08:00">08:00 (Vardiya A)</option>
                  <option value="16:00">16:00 (Vardiya B)</option>
                  <option value="00:00">00:00 (Vardiya C)</option>
                </select>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsYeniKayitAcik(false)} className="outline-button">İptal</button>
                <button type="submit" className="primary-button">🚀 Üretimi 0'dan Başlat</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}