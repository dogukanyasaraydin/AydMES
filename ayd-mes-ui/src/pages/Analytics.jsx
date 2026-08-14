import { useState, useEffect, useMemo } from 'react';
import { mockOeeKayitlari, mockDurusKayitlari, mockTrendVerileri } from '../utils/mockData';
import { excelIndir } from '../utils/excel';

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
      <div className="kpi-top"><span className="icon-surface" style={{ fontSize: '12px', fontWeight: 'bold', color: '#4A5568' }}>{icon}</span></div>
      <span>{label}</span>
      <strong className={danger ? 'danger-text' : ''}>{value}</strong>
      <small>{sub}</small>
    </Card>
  ); 
}

function TrendChart({ trendVerileri = [], compact = false, color = '#df0613' }) {
  const safeData = Array.isArray(trendVerileri) && trendVerileri.length > 0
    ? trendVerileri
    : [
        { saat: '08:00', uretim: 0 },
        { saat: '10:00', uretim: 0 },
        { saat: '12:00', uretim: 0 },
        { saat: '14:00', uretim: 0 },
        { saat: '16:00', uretim: 0 }
      ];

  const maxVal = Math.max(...safeData.map(d => (d.uretim !== undefined ? d.uretim : (d.UretilenAdet || 0))), 10);
  const width = compact ? 240 : 525;
  const height = compact ? 100 : 140;

  const points = safeData.map((d, index) => {
    const x = (index / (safeData.length - 1 || 1)) * width;
    const val = d.uretim !== undefined ? d.uretim : (d.UretilenAdet || 0);
    const y = height - (val / maxVal) * (height - 25) - 10;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const labelStep = Math.max(1, Math.floor(safeData.length / 5));
  const labelData = safeData.filter((_, i) => i % labelStep === 0 || i === safeData.length - 1);

  return (
    <div className={`chart chart-${compact ? 'compact' : 'wide'}`} role="img" aria-label="Saatlik üretim trend grafiği">
      <div className="chart-grid">
        <span>{maxVal.toLocaleString()}</span>
        <span>{Math.round(maxVal * 0.75).toLocaleString()}</span>
        <span>{Math.round(maxVal * 0.5).toLocaleString()}</span>
        <span>{Math.round(maxVal * 0.25).toLocaleString()}</span>
        <span>0</span>
      </div>
      <svg viewBox={compact ? '0 0 245 105' : '0 0 530 160'} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={`fill-${color.replace('#', '')}`} x1="0" x2="0" y1="0" y2="1">
            <stop stopColor={color} stopOpacity=".25"/>
            <stop offset="1" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polygon points={`${points} ${width},${height} 0,${height}`} fill={`url(#fill-${color.replace('#', '')})`} style={{ transition: 'all 0.5s ease' }} />
        <polyline points={points} fill="none" stroke={color} strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'all 0.5s ease' }} />
      </svg>
      <div className="chart-x" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
        {labelData.map((d, i) => (
          <span key={i} style={{ fontSize: '11px', color: '#718096' }}>{d.saat || d.Saat}</span>
        ))}
      </div>
    </div>
  );
}

function MiniBars({ oeeKayitlari = [] }) {
  const safeData = Array.isArray(oeeKayitlari) ? oeeKayitlari : [];
  
  const chartData = safeData.length > 0
    ? safeData.map(k => {
        const val = k.performans !== undefined ? k.performans : (k.Performans !== undefined ? k.Performans : (k.oee !== undefined ? k.oee : (k.Oee || 0)));
        return {
          label: k.makineKod || k.MakineKod || k.kod || k.Kod || 'Makine',
          value: typeof val === 'number' && !isNaN(val) ? Math.round(val) : 0
        };
      })
    : [
        { label: 'PRES-01', value: 0 },
        { label: 'PRES-02', value: 0 },
        { label: 'PRES-03', value: 0 },
        { label: 'PRES-04', value: 0 },
      ];

  return (
    <div className="mini-bars" role="img" aria-label="Performans karşılaştırma grafiği" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '180px', paddingTop: '20px' }}>
      {chartData.map((item, index) => (
        <div className="bar" key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <span style={{ 
            width: '32px', 
            height: `${Math.min(100, Math.max(5, item.value))}%`, 
            backgroundColor: item.value > 80 ? '#df0613' : (item.value > 0 ? '#FCA5A5' : '#CBD5E0'), 
            borderRadius: '4px 4px 0 0',
            transition: 'height 0.5s ease-in-out' 
          }} />
          <strong style={{ fontSize: '13px', color: '#2D3748' }}>%{item.value}</strong>
          <small style={{ fontSize: '12px', color: '#718096', fontWeight: 'bold' }}>{item.label}</small>
        </div>
      ))}
    </div>
  );
}

function getOeeValue(item) {
  const candidates = [item.oee, item.Oee, item.genelOee, item.GenelOee, item.value];
  for (const c of candidates) {
    if (typeof c === 'number' && !isNaN(c) && c > 0) return c;
  }
  for (const c of candidates) {
    if (typeof c === 'string') {
      const n = parseFloat(c);
      if (!isNaN(n)) return n;
    }
  }
  return 0;
}

export default function Analytics({ ayarlar, gosterBildirim, tarihFiltresi }) { 
  const [oeeKayitlari, setOeeKayitlari] = useState([]);
  const [duruslar, setDuruslar] = useState([]); 
  const [trendVerileri, setTrendVerileri] = useState([]);
  
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  
  const [filtre, setFiltre] = useState({
    baslangic: new Date().toISOString().split('T')[0],
    bitis: new Date().toISOString().split('T')[0],
    vardiya: 'Tümü'
  });
  const [aktifFiltreMetni, setAktifFiltreMetni] = useState('');

  const [yeniKayit, setYeniKayit] = useState({
    makineKod: 'PRES-01',
    kullanilabilirlik: 90,
    performans: 95,
    kalite: 99,
    tarih: new Date().toISOString().split('T')[0]
  });

  const verileriGetir = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:7193/api";
      
      const oeeRes = await fetch(`${apiUrl}/OeeKayitlari`);
      if (oeeRes.ok) {
        const data = await oeeRes.json();
        setOeeKayitlari(Array.isArray(data) ? data : (data?.$values ? data.$values : []));
      }

      const durusRes = await fetch(`${apiUrl}/DurusKayitlari`);
      if (durusRes.ok) {
        const data = await durusRes.json();
        setDuruslar(Array.isArray(data) ? data : (data?.$values ? data.$values : []));
      }

      const trendRes = await fetch(`${apiUrl}/Analiz/UretimTrendi`);
      if (trendRes.ok) {
        const data = await trendRes.json();
        setTrendVerileri(Array.isArray(data) ? data : (data?.$values ? data.$values : []));
      }
    } catch (error) {
      console.error("Analytics verileri çekilemedi (Offline Moda Geçiliyor):", error);
      setOeeKayitlari(mockOeeKayitlari);
      setDuruslar(mockDurusKayitlari);
      setTrendVerileri(mockTrendVerileri);
    }
  };

  useEffect(() => {
    verileriGetir();
    const interval = setInterval(verileriGetir, ayarlar?.yenilemeHizi || 3000); 
    return () => clearInterval(interval);
  }, [ayarlar?.yenilemeHizi]);

  const yeniOeeKaydet = async (e) => {
    e.preventDefault();
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:7193/api";
      const genelOee = Math.round((yeniKayit.kullanilabilirlik * yeniKayit.performans * yeniKayit.kalite) / 10000 * 10) / 10;
      
      const payload = {
        makineKod: yeniKayit.makineKod,
        kullanilabilirlik: parseFloat(yeniKayit.kullanilabilirlik),
        performans: parseFloat(yeniKayit.performans),
        kalite: parseFloat(yeniKayit.kalite),
        genelOee: genelOee,
        tarih: yeniKayit.tarih
      };

      const res = await fetch(`${apiUrl}/OeeKayitlari`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        if (gosterBildirim) gosterBildirim(`${yeniKayit.makineKod} için OEE Kaydı (%${genelOee}) kaydedildi!`, 'success');
        setIsNewModalOpen(false);
        verileriGetir();
      } else {
        if (gosterBildirim) gosterBildirim('OEE Kaydı eklenirken bir hata oluştu.', 'error');
      }
    } catch {
      if (gosterBildirim) gosterBildirim('Sunucu bağlantı hatası!', 'error');
    }
  };

  const filtreUygula = (e) => {
    e.preventDefault();
    setAktifFiltreMetni(`Vardiya: ${filtre.vardiya} | Tarih: ${filtre.baslangic} - ${filtre.bitis}`);
    setIsFilterModalOpen(false);
    if (gosterBildirim) gosterBildirim('Analiz filtreleri uygulandı.', 'info');
  };

  const filtrelenmisOee = (oeeKayitlari || []).filter(item => {
    if (!tarihFiltresi?.baslangic) return true;
    const t = item.tarih || item.Tarih;
    if (!t) return true;
    const kDate = t.split('T')[0];
    return kDate >= tarihFiltresi.baslangic && kDate <= tarihFiltresi.bitis;
  });

  const filtrelenmisDuruslar = (duruslar || []).filter(item => {
    if (!tarihFiltresi?.baslangic) return true;
    const t = item.tarih || item.Tarih;
    if (!t) return true;
    const kDate = t.split('T')[0];
    return kDate >= tarihFiltresi.baslangic && kDate <= tarihFiltresi.bitis;
  });

  useEffect(() => {
    const handleExcelExport = () => {
      const dataToExport = filtrelenmisOee.map(item => ({
        "Makine Kodu": item.makineKod || item.MakineKod || '-',
        "Kullanılabilirlik (%)": item.kullanilabilirlik || item.Kullanilabilirlik || 0,
        "Performans (%)": item.performans || item.Performans || 0,
        "Kalite (%)": item.kalite || item.Kalite || 0,
        "Genel OEE (%)": item.genelOee || item.GenelOee || 0,
        "Tarih": item.tarih || item.Tarih || '-'
      }));
      excelIndir(dataToExport, 'OEE_Analiz_Raporu', gosterBildirim);
    };
    window.addEventListener('app-excel-export', handleExcelExport);
    return () => window.removeEventListener('app-excel-export', handleExcelExport);
  }, [filtrelenmisOee]);

  const validOeeList = (Array.isArray(filtrelenmisOee) ? filtrelenmisOee : []).map(item => getOeeValue(item));
  const ortOee = validOeeList.length > 0 
    ? (validOeeList.reduce((acc, val) => acc + val, 0) / validOeeList.length).toFixed(1) 
    : '0.0';

  const toplamDurusDakika = (Array.isArray(filtrelenmisDuruslar) ? filtrelenmisDuruslar : []).reduce((acc, item) => {
    const min = item.sureDakika ?? item.SureDakika ?? item.durusSuresi ?? item.DurusSuresi ?? 0;
    return acc + (typeof min === 'number' && !isNaN(min) ? min : 0);
  }, 0);

  const kritikDurusSayisi = (Array.isArray(filtrelenmisDuruslar) ? filtrelenmisDuruslar : []).filter(d => (d.durum || d.Durum) === 'Devam Ediyor').length;

  return (
    <>
      {aktifFiltreMetni && (
        <div style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#df0613', backgroundColor: '#FFF5F5', padding: '6px 12px', borderRadius: '20px', border: '1px solid #FEB2B2' }}>
            {aktifFiltreMetni}
          </span>
        </div>
      )}

      <div className="kpi-grid">
        <Stat label="Ortalama OEE" value={`%${ortOee}`} sub="Tüm Makineler" icon="OEE" />
        <Stat label="Toplam Duruş" value={`${toplamDurusDakika} dk`} sub="Vardiya Geneli" icon="DUR" danger={toplamDurusDakika > 60} />
        <Stat label="Kayıtlı Makine" value={filtrelenmisOee.length || 4} sub="Aktif İzlenen" icon="MAK" />
        <Stat label="Kritik Durum" value={kritikDurusSayisi} sub="Müdahale Bekleyen" icon="KRİ" danger={kritikDurusSayisi > 0} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '24px', marginBottom: '24px' }}>
        <Card title="Canlı Üretim Trend Çizgisi">
          <TrendChart trendVerileri={trendVerileri} color="#df0613" />
        </Card>

        <Card title="Makine Performans Karşılaştırması">
          <MiniBars oeeKayitlari={filtrelenmisOee} />
        </Card>
      </div>

      {/* Tarih / Vardiya Filtre Modalı */}
      {isFilterModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#FAFAFA', padding: '32px', borderRadius: '12px', width: '400px', border: '1px solid #E5E7EB', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#1A202C' }}>Analiz Filtrele</h3>
            <form onSubmit={filtreUygula} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', color: '#4A5568' }}>
                Başlangıç Tarihi
                <input type="date" value={filtre.baslangic} onChange={e => setFiltre({...filtre, baslangic: e.target.value})} style={{ padding: '8px', border: '1px solid #CBD5E0', borderRadius: '6px', outline: 'none' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', color: '#4A5568' }}>
                Bitiş Tarihi
                <input type="date" value={filtre.bitis} onChange={e => setFiltre({...filtre, bitis: e.target.value})} style={{ padding: '8px', border: '1px solid #CBD5E0', borderRadius: '6px', outline: 'none' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', color: '#4A5568' }}>
                Vardiya Seçimi
                <select value={filtre.vardiya} onChange={e => setFiltre({...filtre, vardiya: e.target.value})} style={{ padding: '8px', border: '1px solid #CBD5E0', borderRadius: '6px', backgroundColor: '#FFF' }}>
                  <option value="Tümü">Tüm Vardiyalar</option>
                  <option value="Vardiya A">Vardiya A (08:00 - 16:00)</option>
                  <option value="Vardiya B">Vardiya B (16:00 - 00:00)</option>
                  <option value="Vardiya C">Vardiya C (00:00 - 08:00)</option>
                </select>
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsFilterModalOpen(false)} className="outline-button">İptal</button>
                <button type="submit" className="primary-button">Filtreyi Uygula</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Yeni OEE Kaydı Modalı */}
      {isNewModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#FAFAFA', padding: '32px', borderRadius: '12px', width: '420px', border: '1px solid #E5E7EB', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '8px', color: '#1A202C' }}>Manuel OEE Kaydı Ekle</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#718096' }}>Makine performans metriklerini girerek yeni OEE kaydı oluşturun.</p>
            <form onSubmit={yeniOeeKaydet} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', color: '#4A5568' }}>
                Makine Kodu
                <select value={yeniKayit.makineKod} onChange={e => setYeniKayit({...yeniKayit, makineKod: e.target.value})} style={{ padding: '8px', border: '1px solid #CBD5E0', borderRadius: '6px', backgroundColor: '#FFF' }}>
                  <option value="PRES-01">PRES-01 (Ana Gövde)</option>
                  <option value="PRES-02">PRES-02 (Yan Panel)</option>
                  <option value="PRES-03">PRES-03 (Tavan Grubu)</option>
                  <option value="PRES-04">PRES-04 (Kapak Presi)</option>
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', color: '#4A5568' }}>
                Kullanılabilirlik Oranı (%)
                <input type="number" min="0" max="100" value={yeniKayit.kullanilabilirlik} onChange={e => setYeniKayit({...yeniKayit, kullanilabilirlik: e.target.value})} style={{ padding: '8px', border: '1px solid #CBD5E0', borderRadius: '6px' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', color: '#4A5568' }}>
                Performans Oranı (%)
                <input type="number" min="0" max="100" value={yeniKayit.performans} onChange={e => setYeniKayit({...yeniKayit, performans: e.target.value})} style={{ padding: '8px', border: '1px solid #CBD5E0', borderRadius: '6px' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', color: '#4A5568' }}>
                Kalite Oranı (%)
                <input type="number" min="0" max="100" value={yeniKayit.kalite} onChange={e => setYeniKayit({...yeniKayit, kalite: e.target.value})} style={{ padding: '8px', border: '1px solid #CBD5E0', borderRadius: '6px' }} />
              </label>
              <div style={{ padding: '10px', backgroundColor: '#EDF2F7', borderRadius: '6px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Hesaplanan Genel OEE:</span>
                <strong style={{ color: '#df0613', fontSize: '16px' }}>
                  %{((yeniKayit.kullanilabilirlik * yeniKayit.performans * yeniKayit.kalite) / 10000).toFixed(1)}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsNewModalOpen(false)} className="outline-button">İptal</button>
                <button type="submit" className="primary-button">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}