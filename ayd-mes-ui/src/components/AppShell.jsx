import { API_URL, DEMO_MODE } from '../config/api';
import { useState } from 'react';

export function Badge({ children, tone = 'neutral' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Toast({ toast, ayarlar }) {
  if (!toast.visible) return null;
  const isDark = ayarlar?.tema === 'dark';
  const isSuccess = toast.type === 'success';

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px',
      backgroundColor: isSuccess ? (isDark ? '#22543D' : '#F0FDF4') : (isDark ? '#742A2A' : '#FEF2F2'),
      color: isSuccess ? (isDark ? '#9AE6B4' : '#166534') : (isDark ? '#FEB2B2' : '#991B1B'),
      border: `1px solid ${isSuccess ? (isDark ? '#38A169' : '#BBF7D0') : (isDark ? '#E53E3E' : '#FECACA')}`,
      padding: '14px 20px', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
      display: 'flex', alignItems: 'center', gap: '12px', zIndex: 99999,
      animation: 'slideUp 0.3s ease-out', fontWeight: '600', fontSize: '14px'
    }}>
      <span style={{ fontSize: '18px' }}>{isSuccess ? '✅' : '❌'}</span>
      <span>{toast.message}</span>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Backend'e giriş isteği atar. Başarılıysa sunucu JWT'yi httpOnly cookie olarak ayarlar ve true döner;
  // hatalı şifrede false döner; çok fazla denemede (429) uyarı verir; sunucuya ulaşılamazsa hata fırlatır.
  const apiGirisi = async (kullaniciAdi, sifre) => {
    const response = await fetch(`${API_URL}/Auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: kullaniciAdi, password: sifre })
    });
    if (response.status === 429) {
      setError('Çok fazla hatalı deneme. Lütfen 1 dakika sonra tekrar deneyin.');
      return null;
    }
    if (!response.ok) return false;
    const data = await response.json();
    localStorage.setItem('role', data.role);
    localStorage.setItem('username', data.username);
    onLogin(data.role, data.username);
    return true;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!username.trim() || !password.trim()) {
      return setError('Kullanıcı adı ve şifre alanlarını doldurun.');
    }

    try {
      if ((await apiGirisi(username, password)) === false) {
        setError('Hatalı kullanıcı adı veya şifre! (Deneme: dogukan / 123)');
      }
    } catch {
      setError(DEMO_MODE
        ? 'Canlı demoda backend yok. Aşağıdaki hızlı demo girişini kullanın.'
        : 'Sunucuya bağlanılamadı. Backend (C#) açık mı?');
    }
  };

  // Hızlı demo: backend açıksa seed edilmiş demo hesabıyla gerçek JWT girişi yapılır,
  // kapalıysa (veya canlı demoda) çevrimdışı modda seçilen rolle devam edilir.
  const demoGirisi = async (rol, adSoyad, kullaniciAdi, sifre) => {
    try {
      const sonuc = await apiGirisi(kullaniciAdi, sifre);
      if (sonuc || sonuc === null) return; // giriş başarılı veya deneme sınırı aşıldı
    } catch {
      // Backend kapalı → çevrimdışı demo
    }
    onLogin(rol, adSoyad);
  };

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-visual-content">
          <div className="login-brand">
            <span className="brand-mark">A</span>
            <div><strong>AYD</strong><small>MES PLATFORM</small></div>
          </div>
          <div className="login-copy">
            <Badge tone="login">ÜRETİM YÖNETİM SİSTEMİ</Badge>
            <h1>Üretimin her anı<br />kontrol altında.</h1>
            <p>Operasyon, kalite ve performans verilerinize tek noktadan güvenle erişin.</p>
          </div>
          <div className="login-metrics">
            <div><strong>92</strong><span>Bağlı makine</span></div>
            <div><strong>%98,7</strong><span>Kalite oranı</span></div>
            <div><strong>24/7</strong><span>Canlı izleme</span></div>
          </div>
        </div>
      </section>
      <section className="login-form-side">
        <form className="login-form" onSubmit={submit}>
          <div>
            <span className="eyebrow">HOŞ GELDİNİZ</span>
            <h2>MES Platforma giriş yapın</h2>
            <p>Devam etmek için kurumsal bilgilerinizi girin.</p>
          </div>
          <label>Kullanıcı adı<input value={username} onChange={(event) => { setUsername(event.target.value); setError(''); }} placeholder="Sicil no (Örn: dogukan)" autoComplete="username" /></label>
          <label>Şifre<div className="password-field"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} placeholder="Şifreniz (Örn: 123)" autoComplete="current-password" /><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Gizle' : 'Göster'}</button></div></label>
          {error && <p className="login-error">{error}</p>}
          <div className="login-options"><label className="remember"><input type="checkbox" /> Beni hatırla</label><button type="button" className="forgot">Şifremi unuttum</button></div>
          <button className="login-button" type="submit">Giriş yap <span>→</span></button>
          
          <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #E2E8F0', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>⚡ Hızlı Demo Girişi (Rol Seçin):</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
              <button 
                type="button" 
                onClick={() => demoGirisi('Fabrika Müdürü', 'Ahmet Yılmaz', 'ahmet', 'demo123')}
                style={{ padding: '8px 10px', fontSize: '11px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFF5F5', color: '#C53030', fontWeight: 'bold', cursor: 'pointer', textAlign: 'left' }}
              >
                👨‍💼 Fabrika Müdürü
              </button>
              <button 
                type="button" 
                onClick={() => demoGirisi('Kalite Mühendisi', 'Ayşe Demir', 'ayse', 'demo123')}
                style={{ padding: '8px 10px', fontSize: '11px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#E6FFFA', color: '#2C7A7B', fontWeight: 'bold', cursor: 'pointer', textAlign: 'left' }}
              >
                🔬 Kalite Mühendisi
              </button>
              <button 
                type="button" 
                onClick={() => demoGirisi('Operatör', 'Mehmet Kaya', 'mehmet', 'demo123')}
                style={{ padding: '8px 10px', fontSize: '11px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#EBF8FF', color: '#2B6CB0', fontWeight: 'bold', cursor: 'pointer', textAlign: 'left' }}
              >
                ⚙️ Operatör
              </button>
              <button 
                type="button" 
                onClick={() => demoGirisi('Yazılım Stajyeri', 'Doğukan Aydın', 'dogukan', '123')}
                style={{ padding: '8px 10px', fontSize: '11px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FAF5FF', color: '#6B46C1', fontWeight: 'bold', cursor: 'pointer', textAlign: 'left' }}
              >
                👨‍💻 Yazılım Stajyeri
              </button>
            </div>
          </div>

          <p className="login-help" style={{ marginTop: '15px' }}>Giriş desteği için <a href="mailto:destek@aydmes.com">AYD MES destek ekibi</a> ile iletişime geçin.</p>
        </form>
      </section>
    </main>
  );
}

export function CalendarModal({ isOpen, onClose, page, tarihFiltresi, setTarihFiltresi, ayarlar }) {
  const isDark = ayarlar?.tema === 'dark';
  const isProduction = page === 'production';

  const [baslangic, setBaslangic] = useState(tarihFiltresi?.baslangic || '');
  const [bitis, setBitis] = useState(tarihFiltresi?.bitis || '');
  const [preset, setPreset] = useState(tarihFiltresi?.preset || 'Tüm Zamanlar');

  if (!isOpen) return null;

  const applyPreset = (p) => {
    setPreset(p);
    const d = new Date();
    if (p === 'Bugün') {
      const today = d.toISOString().split('T')[0];
      setBaslangic(today);
      setBitis(today);
    } else if (p === 'Son 7 Gün') {
      const end = d.toISOString().split('T')[0];
      d.setDate(d.getDate() - 7);
      const start = d.toISOString().split('T')[0];
      setBaslangic(start);
      setBitis(end);
    } else if (p === 'Bu Ay') {
      const firstDay = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
      const today = d.toISOString().split('T')[0];
      setBaslangic(firstDay);
      setBitis(today);
    } else {
      setBaslangic('');
      setBitis('');
    }
  };

  const handleApply = () => {
    if (setTarihFiltresi) {
      setTarihFiltresi({ baslangic, bitis, preset });
    }
    onClose();
  };

  const handleReset = () => {
    setBaslangic('');
    setBitis('');
    setPreset('Tüm Zamanlar');
    if (setTarihFiltresi) {
      setTarihFiltresi({ baslangic: '', bitis: '', preset: 'Tüm Zamanlar' });
    }
    onClose();
  };

  return (
    <div style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000,
      display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)'
    }}>
      <div style={{ 
        backgroundColor: isDark ? '#2D3748' : '#fff', 
        borderRadius: '12px', 
        width: '450px', 
        padding: '24px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        border: `1px solid ${isDark ? '#4A5568' : '#E2E8F0'}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: isDark ? '#F7FAFC' : '#2D3748', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>📅</span> {isProduction ? 'Üretim Takvimi' : 'Tarih Süzgeci'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#A0AEC0' }}>&times;</button>
        </div>

        {isProduction ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px', backgroundColor: isDark ? '#1A202C' : '#F7FAFC', borderRadius: '8px', borderLeft: '4px solid #3182CE' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ color: isDark ? '#E2E8F0' : '#2D3748' }}>10 Ağustos 2026</strong>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#3182CE', backgroundColor: '#EBF8FF', padding: '2px 8px', borderRadius: '12px' }}>Bugün</span>
              </div>
              <div style={{ fontSize: '14px', color: isDark ? '#A0AEC0' : '#4A5568', marginTop: '4px' }}>08:00 - 16:00 | Gündüz Vardiyası (Umut Bey)</div>
            </div>
            <div style={{ padding: '12px', backgroundColor: isDark ? '#1A202C' : '#F7FAFC', borderRadius: '8px', borderLeft: '4px solid #E53E3E' }}>
              <strong style={{ color: isDark ? '#E2E8F0' : '#2D3748' }}>12 Ağustos 2026</strong>
              <div style={{ fontSize: '14px', color: isDark ? '#A0AEC0' : '#4A5568', marginTop: '4px' }}>PRES-04 Planlı Genel Bakım (Tüm Gün)</div>
            </div>
            <div style={{ padding: '12px', backgroundColor: isDark ? '#1A202C' : '#F7FAFC', borderRadius: '8px', borderLeft: '4px solid #D69E2E' }}>
              <strong style={{ color: isDark ? '#E2E8F0' : '#2D3748' }}>15 Ağustos 2026</strong>
              <div style={{ fontSize: '14px', color: isDark ? '#A0AEC0' : '#4A5568', marginTop: '4px' }}>Kalite İncelemesi - Parti A001 Teslimi</div>
            </div>
            <button onClick={onClose} style={{ width: '100%', padding: '12px', marginTop: '24px', backgroundColor: '#4A5568', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Takvimi Kapat</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['Bugün', 'Son 7 Gün', 'Bu Ay', 'Tüm Zamanlar'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => applyPreset(p)}
                  style={{
                    padding: '6px 12px', borderRadius: '6px', border: 'none', fontSize: '11px', fontWeight: 'bold',
                    cursor: 'pointer', transition: 'all 0.2s',
                    backgroundColor: preset === p ? '#d40511' : (isDark ? '#4A5568' : '#EDF2F7'),
                    color: preset === p ? '#FFFFFF' : (isDark ? '#E2E8F0' : '#4A5568')
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: isDark ? '#A0AEC0' : '#718096', fontWeight: 'bold' }}>
                Başlangıç Tarihi:
                <input
                  type="date"
                  value={baslangic}
                  onChange={(e) => { setBaslangic(e.target.value); setPreset('Özel'); }}
                  style={{
                    padding: '8px 12px', borderRadius: '6px', border: `1px solid ${isDark ? '#4A5568' : '#CBD5E0'}`,
                    backgroundColor: isDark ? '#1A202C' : '#F7FAFC', color: isDark ? '#F7FAFC' : '#2D3748',
                    fontSize: '13px', outline: 'none'
                  }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: isDark ? '#A0AEC0' : '#718096', fontWeight: 'bold' }}>
                Bitiş Tarihi:
                <input
                  type="date"
                  value={bitis}
                  onChange={(e) => { setBitis(e.target.value); setPreset('Özel'); }}
                  style={{
                    padding: '8px 12px', borderRadius: '6px', border: `1px solid ${isDark ? '#4A5568' : '#CBD5E0'}`,
                    backgroundColor: isDark ? '#1A202C' : '#F7FAFC', color: isDark ? '#F7FAFC' : '#2D3748',
                    fontSize: '13px', outline: 'none'
                  }}
                />
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button onClick={handleReset} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', color: isDark ? '#E2E8F0' : '#4A5568', border: `1px solid ${isDark ? '#4A5568' : '#CBD5E0'}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Temizle</button>
              <button onClick={handleApply} style={{ flex: 2, padding: '12px', backgroundColor: '#d40511', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Filtreyi Uygula</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AyarlarModal({ isOpen, onClose, ayarlar, setAyarlar, gosterBildirim }) {
  if (!isOpen) return null;

  const kaydet = (e) => {
    e.preventDefault();
    gosterBildirim('Sistem ayarları başarıyla güncellendi!', 'success');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 10000,
      display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: ayarlar.tema === 'dark' ? '#2D3748' : '#FAFAFA', padding: '32px', borderRadius: '12px', width: '450px',
        border: `1px solid ${ayarlar.tema === 'dark' ? '#4A5568' : '#E5E7EB'}`, boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: ayarlar.tema === 'dark' ? '#F7FAFC' : '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚙</span> Sistem Ayarları
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#A0AEC0' }}>&times;</button>
        </div>

        <form onSubmit={kaydet} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: ayarlar.tema === 'dark' ? '#E2E8F0' : '#555', fontWeight: 'bold' }}>
            Arayüz Teması
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => setAyarlar({...ayarlar, tema: 'light'})} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: `2px solid ${ayarlar.tema === 'light' ? '#3182CE' : '#E2E8F0'}`, backgroundColor: '#fff', color: '#2D3748', cursor: 'pointer', fontWeight: 'bold' }}>
                ☀️ Açık
              </button>
              <button type="button" onClick={() => setAyarlar({...ayarlar, tema: 'dark'})} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: `2px solid ${ayarlar.tema === 'dark' ? '#3182CE' : '#4A5568'}`, backgroundColor: '#1A202C', color: '#F7FAFC', cursor: 'pointer', fontWeight: 'bold' }}>
                🌙 Koyu
              </button>
            </div>
          </label>

          <hr style={{ borderTop: `1px solid ${ayarlar.tema === 'dark' ? '#4A5568' : '#E2E8F0'}`, borderBottom: 'none', margin: '5px 0' }} />

          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: ayarlar.tema === 'dark' ? '#E2E8F0' : '#555', fontWeight: 'bold' }}>
            Veri Yenileme (Polling) Hızı
            <select value={ayarlar.yenilemeHizi} onChange={(e) => setAyarlar({...ayarlar, yenilemeHizi: parseInt(e.target.value)})}
                    style={{ padding: '10px', border: `1px solid ${ayarlar.tema === 'dark' ? '#4A5568' : '#CCC'}`, borderRadius: '6px', backgroundColor: ayarlar.tema === 'dark' ? '#1A202C' : '#FFF', color: ayarlar.tema === 'dark' ? '#F7FAFC' : '#333' }}>
              <option value="2000">Agresif (2 Saniye) - Çok Hızlı</option>
              <option value="5000">Standart (5 Saniye) - Önerilen</option>
              <option value="15000">Ekonomi (15 Saniye) - Sunucuyu Yormaz</option>
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: ayarlar.tema === 'dark' ? '#E2E8F0' : '#555', fontWeight: 'bold' }}>
            Makine Kritik Sıcaklık Limiti (°C)
            <input required type="number" value={ayarlar.sicaklikLimiti} onChange={(e) => setAyarlar({...ayarlar, sicaklikLimiti: parseInt(e.target.value)})}
                   style={{ padding: '10px', border: `1px solid ${ayarlar.tema === 'dark' ? '#4A5568' : '#CCC'}`, borderRadius: '6px', backgroundColor: ayarlar.tema === 'dark' ? '#1A202C' : '#FFF', color: ayarlar.tema === 'dark' ? '#F7FAFC' : '#333' }} />
            <small style={{ color: '#718096', fontSize: '12px', fontWeight: 'normal' }}>Bu değer aşılırsa sistem Dashboard'da kırmızı alarm verir.</small>
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="outline-button" style={{ borderColor: ayarlar.tema === 'dark' ? '#4A5568' : '#E2E8F0', color: ayarlar.tema === 'dark' ? '#E2E8F0' : '#4A5568' }}>İptal</button>
            <button type="submit" className="primary-button">Ayarları Uygula</button>
          </div>
        </form>
      </div>
    </div>
  );
}
