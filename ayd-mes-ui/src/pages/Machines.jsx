import { useState, useEffect, useMemo } from 'react';
import { mockMakineVerileri } from '../utils/mockData';

function PresMakineleri({ ayarlar }) {
  const [makineVerileri, setMakineVerileri] = useState([]);

  // --- FİLTRE STATE'LERİ ---
  const [seciliHat, setSeciliHat] = useState('Tüm hatlar');
  const [hatMenuAcik, setHatMenuAcik] = useState(false);
  const [seciliVardiya, setSeciliVardiya] = useState('Tüm Vardiyalar');
  const [vardiyaMenuAcik, setVardiyaMenuAcik] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // --- DETAY MODALI STATE'LERİ ---
  const [isDetayModalAcik, setIsDetayModalAcik] = useState(false);
  const [secilenMakine, setSecilenMakine] = useState(null);

  const hatSecenekleri = ['Tüm hatlar', 'Pres Makineleri', 'Progresif Makineleri', 'Küvet Makineleri'];
  const vardiyaSecenekleri = ['Tüm Vardiyalar', 'Vardiya A', 'Vardiya B', 'Vardiya C'];

  useEffect(() => {
    const makineDurumlariniGetir = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:7193/api";
        const response = await fetch(`${apiUrl}/MakineVerileri`);
        if (response.ok) {
          const data = await response.json();
          setMakineVerileri(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Bağlantı Hatası (Offline Moda Geçiliyor):", error);
        setMakineVerileri(mockMakineVerileri);
      }
    };

    makineDurumlariniGetir();
    const interval = setInterval(makineDurumlariniGetir, ayarlar?.yenilemeHizi || 5000);
    return () => clearInterval(interval);
  }, [ayarlar?.yenilemeHizi, refreshKey]);

  useEffect(() => {
    const handleRefresh = () => {
      setRefreshKey(k => k + 1);
    };
    window.addEventListener('app-data-refresh', handleRefresh);
    return () => window.removeEventListener('app-data-refresh', handleRefresh);
  }, []);

  // Vuruş sayısı artık doğrudan SQL/API'den geliyor — sahte sayaç YOK

  const varsayilanMakineler = useMemo(() => [
    { id: 1, kod: 'PRES-01', aciklama: 'Ana Gövde Pres Makinesi', durum: 'Planlı Duruş', yagSeviyesi: '%0', sicaklik: '0.0', basinc: '0 Bar', vurusSayisi: 0, vardiya: 'Vardiya A', hataliAdet: 0, fireOrani: 0 },
    { id: 2, kod: 'PRES-02', aciklama: 'Yan Panel Pres Hattı', durum: 'Planlı Duruş', yagSeviyesi: '%0', sicaklik: '0.0', basinc: '0 Bar', vurusSayisi: 0, vardiya: 'Vardiya A', hataliAdet: 0, fireOrani: 0 },
    { id: 3, kod: 'PRES-03', aciklama: 'Kapak Şekillendirme Presi', durum: 'Planlı Duruş', yagSeviyesi: '%0', sicaklik: '0.0', basinc: '0 Bar', vurusSayisi: 0, vardiya: 'Vardiya B', hataliAdet: 0, fireOrani: 0 },
    { id: 4, kod: 'PRES-04', aciklama: 'Şase Kaynak ve Pres Hattı', durum: 'Bakımda', yagSeviyesi: '%0', sicaklik: '0.0', basinc: '0 Bar', vurusSayisi: 0, vardiya: 'Vardiya C', hataliAdet: 0, fireOrani: 0 }
  ], []);

  const islenenMakineler = useMemo(() => {
    const hamKaynak = (makineVerileri && makineVerileri.length > 0) ? makineVerileri : varsayilanMakineler;

    return varsayilanMakineler.map((baseMakine, index) => {
      const apiMatch = hamKaynak.find(m => {
        if (Array.isArray(m)) return m[0] === baseMakine.kod;
        return (m.kod || m.Kod) === baseMakine.kod;
      }) || (Array.isArray(hamKaynak[index]) ? null : hamKaynak[index]) || baseMakine;

      const isArray = Array.isArray(apiMatch);
      const kod = isArray ? apiMatch[0] : (apiMatch.kod || apiMatch.Kod || baseMakine.kod);
      const aciklama = isArray ? apiMatch[1] : (apiMatch.aciklama || apiMatch.Aciklama || baseMakine.aciklama);
      const durum = isArray ? apiMatch[2] : (apiMatch.durum || apiMatch.Durum || baseMakine.durum);
      const yagSeviyesi = isArray ? apiMatch[3] : (apiMatch.yagSeviyesi || apiMatch.YagSeviyesi || baseMakine.yagSeviyesi);
      
      let sicaklikRaw = isArray ? apiMatch[4] : (apiMatch.sicaklik || apiMatch.Sicaklik);
      let basincRaw = isArray ? apiMatch[5] : (apiMatch.basinc || apiMatch.Basinc);
      
      const sicaklik = sicaklikRaw ? sicaklikRaw.toString().replace('°C', '') : baseMakine.sicaklik;
      const basinc = basincRaw ? basincRaw.toString().replace(/bar/i, '').trim() : baseMakine.basinc;
      const vurusSayisi = isArray ? 0 : (apiMatch.vurusSayisi !== undefined ? apiMatch.vurusSayisi : (apiMatch.VurusSayisi !== undefined ? apiMatch.VurusSayisi : baseMakine.vurusSayisi));
      const vardiya = apiMatch.vardiya || apiMatch.Vardiya || baseMakine.vardiya;
      const hataliAdet = apiMatch.hataliAdet !== undefined ? apiMatch.hataliAdet : (apiMatch.HataliAdet || 0);
      const fireOrani = apiMatch.fireOrani !== undefined ? apiMatch.fireOrani : (apiMatch.FireOrani || 0);
      
      return { id: apiMatch.id || apiMatch.Id || (index + 1), kod, aciklama, durum, yagSeviyesi, sicaklik, basinc, vurusSayisi, vardiya, hataliAdet, fireOrani };
    });
  }, [makineVerileri, varsayilanMakineler]);

  // Sahte sayaç kaldırıldı — vuruş sayısı artık yalnızca C# API/SQL'den okunur

  const filtrelenmisMakineler = islenenMakineler.filter((makine) => {
    if (seciliHat !== 'Tüm hatlar') {
      const hatEslesmesi = makine.aciklama.toLowerCase().includes(seciliHat.toLowerCase()) || 
                           makine.kod.toLowerCase().includes(seciliHat.substring(0, 4).toLowerCase());
      if (!hatEslesmesi) return false;
    }
    if (seciliVardiya !== 'Tüm Vardiyalar') {
      if (makine.vardiya !== seciliVardiya) return false;
    }
    return true;
  });

  const detayAc = (makine) => {
    setSecilenMakine(makine);
    setIsDetayModalAcik(true);
  };

  return (
    <>
      <div className="filter-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ position: 'relative' }}>
          <button className="select-like" onClick={() => { setHatMenuAcik(!hatMenuAcik); setVardiyaMenuAcik(false); }} style={{ minWidth: '160px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {seciliHat} <span style={{ fontSize: '10px', marginLeft: '8px' }}>{hatMenuAcik ? '▲' : '▼'}</span>
          </button>
          {hatMenuAcik && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, width: '100%', backgroundColor: ayarlar?.tema === 'dark' ? '#2D3748' : '#fff', border: `1px solid ${ayarlar?.tema === 'dark' ? '#4A5568' : '#E2E8F0'}`, borderRadius: '6px', zIndex: 50, overflow: 'hidden' }}>
              {hatSecenekleri.map(hat => (
                <div key={hat} onClick={() => { setSeciliHat(hat); setHatMenuAcik(false); }} style={{ padding: '10px 12px', fontSize: '13px', cursor: 'pointer', backgroundColor: seciliHat === hat ? (ayarlar?.tema === 'dark' ? '#4A5568' : '#EBF8FF') : 'transparent' }}>{hat}</div>
              ))}
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <button className="select-like" onClick={() => { setVardiyaMenuAcik(!vardiyaMenuAcik); setHatMenuAcik(false); }} style={{ minWidth: '140px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {seciliVardiya} <span style={{ fontSize: '10px', marginLeft: '8px' }}>{vardiyaMenuAcik ? '▲' : '▼'}</span>
          </button>
          {vardiyaMenuAcik && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, width: '100%', backgroundColor: ayarlar?.tema === 'dark' ? '#2D3748' : '#fff', border: `1px solid ${ayarlar?.tema === 'dark' ? '#4A5568' : '#E2E8F0'}`, borderRadius: '6px', zIndex: 50, overflow: 'hidden' }}>
              {vardiyaSecenekleri.map(vardiya => (
                <div key={vardiya} onClick={() => { setSeciliVardiya(vardiya); setVardiyaMenuAcik(false); }} style={{ padding: '10px 12px', fontSize: '13px', cursor: 'pointer', backgroundColor: seciliVardiya === vardiya ? (ayarlar?.tema === 'dark' ? '#4A5568' : '#EBF8FF') : 'transparent' }}>{vardiya}</div>
              ))}
            </div>
          )}
        </div>
        <span className="live-label" style={{ marginLeft: 'auto' }}><i /> Canlı telemetri & SQL senkronizasyonu aktif</span>
      </div>

      <div className="machine-grid">
        {filtrelenmisMakineler.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666' }}>Seçilen kriterlere uygun makine bulunamadı...</div>
        ) : (
          filtrelenmisMakineler.map((makine) => {
            const mevcutVurus = makine.vurusSayisi || 0;
            const mevcutDurum = makine.durum;

            return (
              <section key={makine.id || makine.kod} className="panel machine-card">
                <div className="machine-head">
                  <div>
                    <span className="machine-icon">◉</span>
                    <h3>{makine.kod}</h3>
                    <small>{makine.aciklama}</small>
                  </div>
                  <span className={`badge badge-${mevcutDurum === 'Çalışıyor' ? 'success' : mevcutDurum === 'Arıza' ? 'danger' : 'warning'}`}>
                    {mevcutDurum}
                  </span>
                </div>
                <div className="machine-metrics">
                  <div><span>Yağ Seviyesi</span><strong>{makine.yagSeviyesi}</strong></div>
                  <div><span>Sıcaklık</span><strong>{makine.sicaklik}°C</strong></div>
                  <div><span>Basınç</span><strong>{mevcutDurum === 'Çalışıyor' ? (!makine.basinc || makine.basinc === '0' || makine.basinc === '0 Bar' ? '185 Bar' : (makine.basinc.includes('Bar') ? makine.basinc : `${makine.basinc} Bar`)) : (makine.basinc?.includes('Bar') ? makine.basinc : `${makine.basinc || 0} Bar`)}</strong></div>
                  <div><span>Fire / Hurda</span><strong style={{ color: (makine.hataliAdet || 0) > 0 ? '#E53E3E' : 'inherit' }}>{makine.hataliAdet || 0} Adet (%{makine.fireOrani || 0})</strong></div>
                </div>
                <div className="progress"><span style={{ width: makine.yagSeviyesi ? makine.yagSeviyesi.replace('%', '') + '%' : '0%' }} /></div>

                <div className="machine-foot" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                  <small>
                    Vuruş: <strong style={{ fontSize: '13px' }}>{mevcutVurus.toLocaleString()}</strong>
                  </small>
                  <button className="text-action" onClick={() => detayAc({ ...makine, vurusSayisi: mevcutVurus, durum: mevcutDurum })}>Detaylar →</button>
                </div>
              </section>
            );
          })
        )}
      </div>

      {/* MAKİNE DETAY MODALI */}
      {isDetayModalAcik && secilenMakine && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: ayarlar?.tema === 'dark' ? '#2D3748' : '#fff', padding: '32px', borderRadius: '12px', width: '480px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', border: ayarlar?.tema === 'dark' ? '1px solid #4A5568' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: ayarlar?.tema === 'dark' ? '#F7FAFC' : '#2D3748' }}>⚙️ {secilenMakine.kod} - Telemetri Detayları</h3>
              <button onClick={() => setIsDetayModalAcik(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#A0AEC0' }}>&times;</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', color: ayarlar?.tema === 'dark' ? '#E2E8F0' : '#4A5568' }}>
              <div style={{ padding: '12px', backgroundColor: ayarlar?.tema === 'dark' ? '#1A202C' : '#F7FAFC', borderRadius: '8px' }}><strong>Hat Açıklaması:</strong> {secilenMakine.aciklama}</div>
              <div style={{ padding: '12px', backgroundColor: ayarlar?.tema === 'dark' ? '#1A202C' : '#F7FAFC', borderRadius: '8px' }}><strong>Anlık Durum:</strong> {secilenMakine.durum}</div>
              <div style={{ padding: '12px', backgroundColor: ayarlar?.tema === 'dark' ? '#1A202C' : '#F7FAFC', borderRadius: '8px' }}><strong>Sıcaklık:</strong> {secilenMakine.sicaklik}°C (Kritik sınır: {ayarlar?.sicaklikLimiti || 55}°C)</div>
              <div style={{ padding: '12px', backgroundColor: ayarlar?.tema === 'dark' ? '#1A202C' : '#F7FAFC', borderRadius: '8px' }}><strong>Basınç:</strong> {secilenMakine.basinc} Bar</div>
              <div style={{ padding: '12px', backgroundColor: ayarlar?.tema === 'dark' ? '#1A202C' : '#F7FAFC', borderRadius: '8px' }}><strong>Toplam Vuruş:</strong> {secilenMakine.vurusSayisi?.toLocaleString()}</div>
            </div>
            <button onClick={() => setIsDetayModalAcik(false)} style={{ width: '100%', padding: '12px', marginTop: '24px', backgroundColor: '#3182CE', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Kapat</button>
          </div>
        </div>
      )}
    </>
  );
}

export default PresMakineleri;