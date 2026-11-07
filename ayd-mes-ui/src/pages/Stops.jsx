import { API_URL } from '../config/api';
import { useState, useEffect } from 'react';
import { mockDurusKayitlari } from '../utils/mockData';
import { excelIndir } from '../utils/excel';
import { pdfRaporuOlustur } from '../utils/pdf';
import DateRangePicker from '../components/DateRangePicker';
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

export default function Stops({ ayarlar, gosterBildirim, tarihFiltresi, userRole }) {
  const [kayitlar, setKayitlar] = useState([]);
  const [seciliZaman, setSeciliZaman] = useState('Bugün');
  const [zamanMenuAcik, setZamanMenuAcik] = useState(false);
  const [dateFilter, setDateFilter] = useState({ baslangic: '', bitis: '', preset: 'Tüm Zamanlar' });
  const zamanSecenekleri = ['Bugün', 'Dün', 'Bu Hafta', 'Bu Ay'];

  const [isDurusModalAcik, setIsDurusModalAcik] = useState(false);
  const [yeniDurus, setYeniDurus] = useState({
    makineKod: '',
    neden: '',
    sure: '',
    durum: 'Açık'
  });

  const [isInceleModalAcik, setIsInceleModalAcik] = useState(false);
  const [secilenDurus, setSecilenDurus] = useState(null);

  const inceleAc = (kayit) => {
    setSecilenDurus(kayit);
    setIsInceleModalAcik(true);
  };

  useEffect(() => {
    const duruslariGetir = async () => {
      try {
        const apiUrl = API_URL;
        const response = await fetch(`${apiUrl}/DurusKayitlari`);
        if (response.ok) {
          const data = await response.json();
          setKayitlar(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Duruş kayıtları çekilemedi (Offline Moda Geçiliyor):", error);
        setKayitlar(mockDurusKayitlari);
      }
    };

    duruslariGetir();
    const interval = setInterval(duruslariGetir, ayarlar?.yenilemeHizi || 5000);
    return () => clearInterval(interval);
  }, [ayarlar?.yenilemeHizi]);

  const durusKaydet = async (e) => {
    e.preventDefault();
    try {
      const apiUrl = API_URL;
      const response = await fetch(`${apiUrl}/DurusKayitlari`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          saat: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), 
          makineKod: yeniDurus.makineKod,
          neden: yeniDurus.neden,
          sure: parseInt(yeniDurus.sure),
          durum: yeniDurus.durum
        }),
      });

      if (response.ok) {
        setIsDurusModalAcik(false); 
        setYeniDurus({ makineKod: '', neden: '', sure: '', durum: 'Açık' }); 
        gosterBildirim("Yeni duruş kaydı başarıyla bildirildi!", "success");
      } else {
        gosterBildirim("Duruş kaydı eklenemedi.", "error");
      }
    } catch {
      gosterBildirim("Sunucu bağlantı hatası!", "error");
    }
  };

  const safeKayitlar = Array.isArray(kayitlar) ? kayitlar : [];
  
  const aktifTarihFiltresi = (tarihFiltresi && (tarihFiltresi.baslangic || tarihFiltresi.bitis)) 
    ? tarihFiltresi 
    : dateFilter;

  const filteredKayitlar = safeKayitlar.filter(item => {
    if (!aktifTarihFiltresi.baslangic && !aktifTarihFiltresi.bitis) return true;
    const itemDate = item.tarih || item.createdDate || item.tarihSaate;
    if (!itemDate) return true;
    const d = new Date(itemDate).toISOString().split('T')[0];
    if (aktifTarihFiltresi.baslangic && d < aktifTarihFiltresi.baslangic) return false;
    if (aktifTarihFiltresi.bitis && d > aktifTarihFiltresi.bitis) return false;
    return true;
  });

  const toplamDurus = filteredKayitlar.reduce((toplam, kayit) => toplam + (kayit.sure || 0), 0);
  const acikKayitSayisi = filteredKayitlar.filter(k => k.durum === 'Açık' || k.durum === 'Devam ediyor').length;

  const nedenSureleri = {};
  filteredKayitlar.forEach(k => {
    if(k.neden) {
      nedenSureleri[k.neden] = (nedenSureleri[k.neden] || 0) + (k.sure || 0);
    }
  });
  
  let enYuksekNeden = "Yok";
  let enYuksekSure = 0;
  Object.entries(nedenSureleri).forEach(([neden, sure]) => {
    if (sure > enYuksekSure) {
      enYuksekSure = sure;
      enYuksekNeden = neden;
    }
  });

  const mttr = filteredKayitlar.length > 0 ? Math.round(toplamDurus / filteredKayitlar.length) : 0;

  useEffect(() => {
    const handleExcel = () => {
      const dataToExport = filteredKayitlar.map(k => ({
        "Saat": k.saat || '-',
        "Makine Kodu": k.makineKod || '-',
        "Neden": k.neden || '-',
        "Duruş Süresi (dk)": k.sure || 0,
        "Durum": k.durum || '-'
      }));
      excelIndir(dataToExport, 'Durus_Kayitlari', gosterBildirim);
    };

    const handlePdf = () => {
      pdfRaporuOlustur({
        baslik: 'Duruş ve Andon Kayıtları Raporu',
        altBaslik: 'Makinelerin duruş nedenleri, süreleri ve aktif/çözülmüş durum kırılımı',
        veriler: filteredKayitlar,
        sutunlar: [
          { header: 'Saat', key: 'saat' },
          { header: 'Makine Kodu', key: 'makineKod' },
          { header: 'Duruş Nedeni', key: 'neden' },
          { header: 'Duruş Süresi (dk)', key: 'sure' },
          { header: 'Durum', key: 'durum' }
        ],
        kpiListesi: [
          { label: 'Toplam Duruş Süresi', value: `${toplamDurus} dk` },
          { label: 'Aktif Duruş Sayısı', value: acikKayitSayisi },
          { label: 'Ortalama Duruş (MTTR)', value: `${mttr} dk` }
        ],
        gosterBildirim
      });
    };

    window.addEventListener('app-excel-export', handleExcel);
    window.addEventListener('app-pdf-export', handlePdf);

    return () => {
      window.removeEventListener('app-excel-export', handleExcel);
      window.removeEventListener('app-pdf-export', handlePdf);
    };
  }, [filteredKayitlar, toplamDurus, acikKayitSayisi, mttr]);

  return (
    <>
      <DateRangePicker onFilterChange={setDateFilter} ayarlar={ayarlar} />

      <div className="kpi-grid">
        <Stat label="Toplam duruş" value={`${toplamDurus} dk`} sub="bugünkü toplam" icon="📋" />
        <Stat label="Açık kayıt" value={acikKayitSayisi} sub="aksiyon bekliyor" icon="⚠️" danger={acikKayitSayisi > 0} />
        <Stat label="En yüksek neden" value={enYuksekNeden} sub={`${enYuksekSure} dk`} icon="🔴" />
        <Stat label="MTTR" value={`${mttr} dk`} sub="ortalama müdahale" icon="⏱️" />
      </div>

      <Card 
        title="Duruş ve Andon Kayıtları" 
        action={
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="outline-button" onClick={() => excelIndir(filteredKayitlar, 'Durus_Kayitlari', gosterBildirim)}>
              📊 Excel
            </button>
            <button className="outline-button" onClick={() => {
              pdfRaporuOlustur({
                baslik: 'Duruş ve Andon Kayıtları Raporu',
                altBaslik: 'Vardiya duruş analizleri ve kök neden detay dökümü',
                veriler: filteredKayitlar,
                sutunlar: [
                  { header: 'Saat', key: 'saat' },
                  { header: 'Makine Kodu', key: 'makineKod' },
                  { header: 'Duruş Nedeni', key: 'neden' },
                  { header: 'Duruş Süresi (dk)', key: 'sure' },
                  { header: 'Durum', key: 'durum' }
                ],
                kpiListesi: [
                  { label: 'Toplam Duruş', value: `${toplamDurus} dk` },
                  { label: 'Açık Kayıt Sayısı', value: acikKayitSayisi },
                  { label: 'En Yüksek Neden', value: enYuksekNeden },
                  { label: 'MTTR', value: `${mttr} dk` }
                ],
                gosterBildirim
              });
            }}>
              📄 PDF Raporu
            </button>
            
            <div style={{ position: 'relative' }}>
              <button 
                className="select-like" 
                onClick={() => setZamanMenuAcik(!zamanMenuAcik)}
                style={{ minWidth: '120px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                {seciliZaman} <span style={{ fontSize: '10px', marginLeft: '8px' }}>{zamanMenuAcik ? '▲' : '▼'}</span>
              </button>
              
              {zamanMenuAcik && (
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, width: '100%', backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '6px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden' }}>
                  {zamanSecenekleri.map(zaman => (
                    <div 
                      key={zaman} 
                      onClick={() => { setSeciliZaman(zaman); setZamanMenuAcik(false); }}
                      style={{ padding: '10px 12px', fontSize: '13px', cursor: 'pointer', borderBottom: '1px solid #F7FAFC', backgroundColor: seciliZaman === zaman ? '#EBF8FF' : '#fff', color: seciliZaman === zaman ? '#2B6CB0' : '#4A5568' }}
                    >
                      {zaman}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {canEdit(userRole) && (<button className="primary-button" onClick={() => setIsDurusModalAcik(true)}>+ Duruş bildir</button>)}
          </div>
        }
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Saat</th>
                <th>Makine</th>
                <th>Duruş nedeni</th>
                <th>Süre</th>
                <th>Durum</th>
                <th />
              </tr>
          </thead>
          <tbody>
            {filteredKayitlar.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Seçili tarih aralığında kayıt bulunamadı...</td>
              </tr>
            ) : (
              [...filteredKayitlar]
                .sort((a, b) => (b.saat || '').localeCompare(a.saat || '')) 
                .map((kayit) => (
                  <tr key={kayit.id}>
                    <td>{kayit.saat}</td>
                    <td><strong>{kayit.makineKod}</strong></td>
                    <td>{kayit.neden}</td>
                    <td>{kayit.sure} dk</td>
                    <td>
                      <Badge tone={kayit.durum === 'Açık' ? 'warning' : 'success'}>
                        {kayit.durum}
                      </Badge>
                    </td>
                    <td>
                      <button className="text-action" onClick={() => inceleAc(kayit)}>İncele →</button>
                    </td>
                  </tr>
                ))
            )}
        </tbody>
          </table>
        </div>
      </Card>

      {isDurusModalAcik && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#FAFAFA', padding: '32px', borderRadius: '8px', width: '400px', border: '1px solid #E5E7EB', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Yeni Duruş Bildir</h3>
            
            <form onSubmit={durusKaydet} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', color: '#555' }}>
                Makine Kodu
                <input required type="text" value={yeniDurus.makineKod} onChange={(e) => setYeniDurus({...yeniDurus, makineKod: e.target.value})} style={{ padding: '8px', border: '1px solid #CCC', borderRadius: '4px', outline: 'none' }} placeholder="Örn: PRES-03" />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', color: '#555' }}>
                Duruş Nedeni
                <input required type="text" value={yeniDurus.neden} onChange={(e) => setYeniDurus({...yeniDurus, neden: e.target.value})} style={{ padding: '8px', border: '1px solid #CCC', borderRadius: '4px', outline: 'none' }} placeholder="Örn: Malzeme Bekleme" />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', color: '#555' }}>
                Tahmini Süre (Dakika)
                <input required type="number" value={yeniDurus.sure} onChange={(e) => setYeniDurus({...yeniDurus, sure: e.target.value})} style={{ padding: '8px', border: '1px solid #CCC', borderRadius: '4px', outline: 'none' }} placeholder="Örn: 15" />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', color: '#555' }}>
                Durum
                <select value={yeniDurus.durum} onChange={(e) => setYeniDurus({...yeniDurus, durum: e.target.value})} style={{ padding: '8px', border: '1px solid #CCC', borderRadius: '4px', backgroundColor: '#FFF' }}>
                  <option value="Açık">Açık</option>
                  <option value="Devam ediyor">Devam Ediyor</option>
                  <option value="Kapalı">Kapalı</option>
                </select>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsDurusModalAcik(false)} className="outline-button">İptal</button>
                <button type="submit" className="primary-button">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isInceleModalAcik && secilenDurus && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '12px', width: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#2D3748' }}>🔍 {secilenDurus.makineKod} Duruş İncelemesi</h3>
              <button onClick={() => setIsInceleModalAcik(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#A0AEC0' }}>&times;</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#4A5568' }}>
              <div style={{ padding: '12px', backgroundColor: '#F7FAFC', borderRadius: '8px' }}><strong>Bildirim Saati:</strong> {secilenDurus.saat}</div>
              <div style={{ padding: '12px', backgroundColor: '#F7FAFC', borderRadius: '8px' }}><strong>Duruş Nedeni:</strong> {secilenDurus.neden}</div>
              <div style={{ padding: '12px', backgroundColor: '#F7FAFC', borderRadius: '8px' }}><strong>Toplam Süre:</strong> {secilenDurus.sure} Dakika</div>
              <div style={{ padding: '12px', backgroundColor: '#F7FAFC', borderRadius: '8px' }}><strong>Mevcut Durum:</strong> {secilenDurus.durum}</div>
            </div>
            <button onClick={() => setIsInceleModalAcik(false)} style={{ width: '100%', padding: '12px', marginTop: '24px', backgroundColor: '#4A5568', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Kapat</button>
          </div>
        </div>
      )}
    </>
  );
}
