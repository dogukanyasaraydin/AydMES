import { useState, useMemo, useEffect } from 'react';

export default function Users({ ayarlar, gosterBildirim }) {
  const [users, setUsers] = useState([]);
  const [arama, setArama] = useState('');
  const [yeniKullaniciModal, setYeniKullaniciModal] = useState(false);
  const [yeniKullanici, setYeniKullanici] = useState({ adSoyad: '', kullaniciAdi: '', rol: 'Operatör', sifre: '' });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:7193/api";
        const response = await fetch(`${apiUrl}/Users`);
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error("Kullanıcılar yüklenemedi", error);
      }
    };
    fetchUsers();
  }, []);

  const filtrelenmisUsers = useMemo(() => {
    return users.filter(u => 
      u.adSoyad?.toLowerCase().includes(arama.toLowerCase()) || 
      u.rol?.toLowerCase().includes(arama.toLowerCase())
    );
  }, [users, arama]);

  const rolRenkleri = {
    'Fabrika Müdürü': 'danger',
    'Yazılım Stajyeri': 'info',
    'Kalite Mühendisi': 'warning',
    'Süpervizör': 'primary',
    'Operatör': 'success'
  };

  const handleKullaniciEkle = async (e) => {
    e.preventDefault();
    if (!yeniKullanici.adSoyad || !yeniKullanici.kullaniciAdi || !yeniKullanici.sifre) {
      gosterBildirim("Lütfen tüm alanları doldurun!", "error");
      return;
    }
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:7193/api";
      const eklenecek = {
        ...yeniKullanici,
        durum: 'Aktif',
        sonGiris: 'Hiç girilmedi'
      };

      const response = await fetch(`${apiUrl}/Users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eklenecek)
      });

      if (response.ok) {
        const kaydedilen = await response.json();
        setUsers([...users, kaydedilen]);
        setYeniKullaniciModal(false);
        setYeniKullanici({ adSoyad: '', kullaniciAdi: '', rol: 'Operatör', sifre: '' });
        gosterBildirim(`${yeniKullanici.adSoyad} sisteme ${yeniKullanici.rol} olarak eklendi!`, "success");
      } else {
        const err = await response.json();
        gosterBildirim(err.message || "Kayıt başarısız!", "error");
      }
    } catch {
      gosterBildirim("Sunucuya ulaşılamadı!", "error");
    }
  };

  const handleSil = async (id) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:7193/api";
      const response = await fetch(`${apiUrl}/Users/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setUsers(users.filter(u => u.id !== id));
        gosterBildirim("Kullanıcı sistemden silindi.", "success");
      }
    } catch {
      gosterBildirim("Silme başarısız!", "error");
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
      <div className="filter-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', justifyContent: 'space-between' }}>
        <input 
          type="text" 
          placeholder="Kullanıcı ara (Ad veya Rol)..." 
          className="search-input"
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          style={{ maxWidth: '300px' }}
        />
        <button className="primary-button" onClick={() => setYeniKullaniciModal(true)}>
          + Yeni Kullanıcı Ekle
        </button>
      </div>

      <div className="panel" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ad Soyad</th>
              <th>Kullanıcı Adı</th>
              <th>Sistem Rolü</th>
              <th>Durum</th>
              <th>Son Giriş</th>
              <th style={{ textAlign: 'right' }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filtrelenmisUsers.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>Kullanıcı bulunamadı...</td></tr>
            ) : (
              filtrelenmisUsers.map(user => (
                <tr key={user.id}>
                  <td><strong>#{user.id}</strong></td>
                  <td>{user.adSoyad}</td>
                  <td><code style={{ fontSize: '12px', color: '#718096' }}>@{user.kullaniciAdi}</code></td>
                  <td>
                    <span className={`badge badge-${rolRenkleri[user.rol] || 'success'}`}>
                      {user.rol}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: user.durum === 'Aktif' ? '#10B981' : '#718096' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: user.durum === 'Aktif' ? '#10B981' : '#CBD5E0' }} />
                      {user.durum}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: '#718096' }}>{user.sonGiris}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="icon-button" style={{ color: '#3182CE' }} title="Düzenle">✏️</button>
                    <button className="icon-button" style={{ color: '#E53E3E' }} title="Sil" onClick={() => handleSil(user.id)}>🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Yeni Kullanıcı Ekleme Modalı */}
      {yeniKullaniciModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ backgroundColor: ayarlar?.tema === 'dark' ? '#2D3748' : '#FFF', padding: '24px', borderRadius: '12px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', borderBottom: `1px solid ${ayarlar?.tema === 'dark' ? '#4A5568' : '#E2E8F0'}`, paddingBottom: '10px' }}>
              👤 Yeni Kullanıcı Oluştur
            </h3>
            
            <form onSubmit={handleKullaniciEkle} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Ad Soyad</label>
                <input type="text" className="search-input" value={yeniKullanici.adSoyad} onChange={e => setYeniKullanici({...yeniKullanici, adSoyad: e.target.value})} placeholder="Örn: Veli Gündüz" style={{ width: '100%' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Sisteme Giriş Adı</label>
                <input type="text" className="search-input" value={yeniKullanici.kullaniciAdi} onChange={e => setYeniKullanici({...yeniKullanici, kullaniciAdi: e.target.value})} placeholder="Örn: veli.g" style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Şifre</label>
                <input type="password" className="search-input" value={yeniKullanici.sifre} onChange={e => setYeniKullanici({...yeniKullanici, sifre: e.target.value})} placeholder="******" style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Sistem Yetkisi (Rol)</label>
                <select className="search-input" value={yeniKullanici.rol} onChange={e => setYeniKullanici({...yeniKullanici, rol: e.target.value})} style={{ width: '100%' }}>
                  <option value="Operatör">Operatör</option>
                  <option value="Süpervizör">Süpervizör</option>
                  <option value="Kalite Mühendisi">Kalite Mühendisi</option>
                  <option value="Fabrika Müdürü">Fabrika Müdürü</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setYeniKullaniciModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', backgroundColor: ayarlar?.tema === 'dark' ? '#4A5568' : '#E2E8F0', cursor: 'pointer', fontWeight: 'bold', color: ayarlar?.tema === 'dark' ? '#FFF' : '#4A5568' }}>İptal</button>
                <button type="submit" className="primary-button" style={{ flex: 1, textAlign: 'center', justifyContent: 'center' }}>Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
