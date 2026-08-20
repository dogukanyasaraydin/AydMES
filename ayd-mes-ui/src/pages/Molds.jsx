import { API_URL } from '../config/api';
import { useState, useEffect } from 'react';
import { mockKalipKayitlari } from '../utils/mockData';
import { canEdit } from '../utils/permissions';

function Badge({ children, tone = 'neutral' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function Card({ title, action, children, className = '' }) {
  return (
    <section className={`panel ${className}`}>
      {title && <div className="panel-head"><div><h2>{title}</h2></div>{action}</div>}
      {children}
    </section>
  );
}

function Stat({ label, value, sub, icon, danger }) { 
  return (
    <Card className="kpi">
      <div className="kpi-top"><span className="icon-surface">{icon}</span></div>
      <span>{label}</span>
      <strong className={danger ? 'danger-text' : ''}>{value}</strong>
      <small>{sub}</small>
    </Card>
  ); 
}

export default function Molds({ ayarlar, gosterBildirim, userRole }) { 
  const [kaliplar, setKaliplar] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [isKalipModalAcik, setIsKalipModalAcik] = useState(false);
  const [yeniKalip, setYeniKalip] = useState({
    kalipKodu: '',
    kalipAdi: '',
    aktifMakine: 'PRES-01',
    parca: '',
    bakimLimiti: '150000'
  });

  useEffect(() => {
    let isMounted = true;
    const fetchMolds = async () => {
      try {
        const apiUrl = API_URL;
        const response = await fetch(`${apiUrl}/KalipKayitlari`);
        if (response.ok && isMounted) {
          const data = await response.json();
          setKaliplar(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Kalıp verileri çekilemedi (Offline Moda Geçiliyor):", error);
        setKaliplar(mockKalipKayitlari);
      }
    };

    fetchMolds();
    const timer = setInterval(fetchMolds, ayarlar?.yenilemeHizi || 5000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [ayarlar?.yenilemeHizi, refreshKey]);

  useEffect(() => {
    const handleOpenModal = () => setIsKalipModalAcik(true);
    const handleRefresh = () => {
      setRefreshKey(p => p + 1);
      if (gosterBildirim) gosterBildirim("Kalıp listesi ve bakım durumları güncellendi.", "info");
    };

    window.addEventListener('app-mold-form-open', handleOpenModal);
    window.addEventListener('app-data-refresh', handleRefresh);

    return () => {
      window.removeEventListener('app-mold-form-open', handleOpenModal);
      window.removeEventListener('app-data-refresh', handleRefresh);
    };
  }, []);

  const kalipBakimiYap = async (id, kalipKodu) => {
    try {
      const apiUrl = API_URL;
      const response = await fetch(`${apiUrl}/KalipKayitlari/bakim-yap/${id}`, {
        method: "POST"
      });

      if (response.ok) {
        gosterBildirim(`🔧 ${kalipKodu} kalıp bakımı yapıldı, ömür sayacı 0'a sıfırlandı!`, "success");
        setRefreshKey(p => p + 1);
      } else {
        gosterBildirim("Kalıp bakımı işlenemedi.", "error");
      }
    } catch {
      gosterBildirim("Sunucu bağlantı hatası!", "error");
    }
  };

  const kalipKaydet = async (e) => {
    e.preventDefault(); 
    try {
      const apiUrl = API_URL;
      const response = await fetch(`${apiUrl}/KalipKayitlari`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kalipKodu: yeniKalip.kalipKodu,
          kalipAdi: yeniKalip.kalipAdi || `${yeniKalip.kalipKodu} Kalıbı`,
          aktifMakine: yeniKalip.aktifMakine,
          parca: yeniKalip.parca,
          mevcutVurus: 0, 
          bakimLimiti: parseInt(yeniKalip.bakimLimiti),
          durum: 'İyi'
        }),
      });

      if (response.ok) {
        setIsKalipModalAcik(false); 
        setYeniKalip({ kalipKodu: '', kalipAdi: '', aktifMakine: 'PRES-01', parca: '', bakimLimiti: '150000' }); 
        gosterBildirim("Yeni kalıp başarıyla eklendi!", "success");
        setRefreshKey(p => p + 1);
      } else {
        gosterBildirim("Kalıp eklenemedi.", "error");
      }
    } catch {
      gosterBildirim("Sunucu bağlantı hatası!", "error");
    }
  };

  const safeKaliplar = Array.isArray(kaliplar) ? kaliplar : [];
  const aktifKalip = safeKaliplar.length;
  const bakimYaklasan = safeKaliplar.filter(k => k.durum === 'Bakım Yaklaşıyor' || k.durum === 'Bakım Zamanı Geldi' || ((k.bakimLimiti || 0) - (k.mevcutVurus || 0)) <= 10000).length;

  return (
    <>
      <div className="kpi-grid">
        <Stat label="Aktif kalıp envanteri" value={aktifKalip} sub={`${aktifKalip} kalıp sistemde tanımlı`} icon="◇"/>
        <Stat label="Bakım yaklaşan kalıp" value={bakimYaklasan} sub="Bakım limiti dolmak üzere" icon="⚠️" danger={bakimYaklasan > 0}/>
        <Stat label="Ort. Değişim (SMED)" value={safeKaliplar.length > 0 ? "18 dk" : "0 dk"} sub={safeKaliplar.length > 0 ? "-2 dk geçen aya göre" : "Veri yok"} icon="⏱️"/>
        <Stat label="Kalıp Verimliliği" value={safeKaliplar.length > 0 ? "%98.4" : "%0"} sub={safeKaliplar.length > 0 ? "Aşınma oranı düşük" : "Veri yok"} icon="📈"/>
      </div>
      
      <Card title="📊 Kalıp Ömrü & Bakım Takip Envanteri" action={
        canEdit(userRole) && (
          <button className="primary-button" onClick={() => setIsKalipModalAcik(true)}>
            + Kalıp ekle
          </button>
        )
      }>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Kalıp Kodu / Adı</th>
                <th>Takılı Makine</th>
                <th>Basılan Parça</th>
                <th>Kalıp Aşınma İlerlemesi (% Ömür)</th>
                <th>Mevcut / Bakım Limiti</th>
                <th>Durum</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {safeKaliplar.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Kalıp verisi yükleniyor veya kayıt yok...</td>
                </tr>
              ) : (
                safeKaliplar.map((m) => {
                  const mevcut = m.mevcutVurus || m.vurusSayaci || m.MevcutVurus || 0;
                  const limit = m.bakimLimiti || 150000;
                  const yuzde = Math.min(100, Math.round((mevcut / limit) * 100));
                  const isCritical = yuzde >= 95;
                  const isWarning = yuzde >= 85 && yuzde < 95;

                  return (
                    <tr key={m.id || m.kalipKodu}>
                      <td>
                        <strong>{m.kalipKodu}</strong>
                        <div style={{ fontSize: '11px', color: '#718096' }}>{m.kalipAdi || 'Pres Kalıbı'}</div>
                      </td>
                      <td><span style={{ fontWeight: 'bold', color: '#3182CE' }}>{m.aktifMakine}</span></td>
                      <td>{m.parca}</td>
                      <td style={{ minWidth: '180px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px', fontWeight: 'bold' }}>
                          <span>Aşınma Oranı</span>
                          <span style={{ color: isCritical ? '#E53E3E' : isWarning ? '#DD6B20' : '#38B2AC' }}>%{yuzde}</span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <span style={{ 
                            width: `${yuzde}%`, 
                            backgroundColor: isCritical ? '#E53E3E' : isWarning ? '#DD6B20' : '#38B2AC' 
                          }} />
                        </div>
                      </td>
                      <td><strong>{mevcut.toLocaleString('tr-TR')}</strong> / {limit.toLocaleString('tr-TR')} Vuruş</td>
                      <td>
                        <Badge tone={isCritical ? 'danger' : isWarning ? 'warning' : 'success'}>
                          {isCritical ? 'Bakım Zamanı Geldi' : isWarning ? 'Bakım Yaklaşıyor' : 'Sağlıklı (İyi)'}
                        </Badge>
                      </td>
                      <td>
                        {canEdit(userRole) && (
                          <button 
                            className="outline-button" 
                            onClick={() => kalipBakimiYap(m.id, m.kalipKodu)}
                            style={{ fontSize: '11px', padding: '4px 8px', borderColor: isCritical ? '#E53E3E' : undefined }}
                          >
                            🔧 Bakım Yap (Sıfırla)
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {isKalipModalAcik && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ 
            backgroundColor: ayarlar?.tema === 'dark' ? '#2D3748' : '#FAFAFA', 
            padding: '32px', borderRadius: '10px', width: '420px', 
            border: `1px solid ${ayarlar?.tema === 'dark' ? '#4A5568' : '#E5E7EB'}`, 
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)' 
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>🔧 Yeni Kalıp Kaydı</h3>
            
            <form onSubmit={kalipKaydet} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                Kalıp Kodu
                <input required type="text" value={yeniKalip.kalipKodu} onChange={(e) => setYeniKalip({...yeniKalip, kalipKodu: e.target.value})} style={{ padding: '8px', border: '1px solid #CBD5E0', borderRadius: '4px' }} placeholder="Örn: KLP-005" />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                Kalıp Adı / Tanımı
                <input required type="text" value={yeniKalip.kalipAdi} onChange={(e) => setYeniKalip({...yeniKalip, kalipAdi: e.target.value})} style={{ padding: '8px', border: '1px solid #CBD5E0', borderRadius: '4px' }} placeholder="Örn: Şasi Çift Büküm Kalıbı" />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                Takılacağı Makine
                <select value={yeniKalip.aktifMakine} onChange={(e) => setYeniKalip({...yeniKalip, aktifMakine: e.target.value})} style={{ padding: '8px', border: '1px solid #CBD5E0', borderRadius: '4px' }}>
                  <option value="PRES-01">PRES-01</option>
                  <option value="PRES-02">PRES-02</option>
                  <option value="PRES-03">PRES-03</option>
                  <option value="PRES-04">PRES-04</option>
                </select>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                Basılacak Parça
                <input required type="text" value={yeniKalip.parca} onChange={(e) => setYeniKalip({...yeniKalip, parca: e.target.value})} style={{ padding: '8px', border: '1px solid #CBD5E0', borderRadius: '4px' }} placeholder="Örn: Yan Panel Sac Parçası" />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                Bakım Limiti (Kaç vuruşta bakıma girsin?)
                <input required type="number" value={yeniKalip.bakimLimiti} onChange={(e) => setYeniKalip({...yeniKalip, bakimLimiti: e.target.value})} style={{ padding: '8px', border: '1px solid #CBD5E0', borderRadius: '4px' }} placeholder="Örn: 150000" />
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsKalipModalAcik(false)} className="outline-button">İptal</button>
                <button type="submit" className="primary-button">Kalıbı Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  ); 
}
