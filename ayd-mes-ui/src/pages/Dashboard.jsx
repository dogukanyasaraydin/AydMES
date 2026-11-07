import { API_URL } from '../config/api';
import { useState, useEffect, useRef } from 'react';
import { mockMakineVerileri, mockOeeKayitlari, mockTrendVerileri, mockOeeDagilimi, mockGorevKayitlari } from '../utils/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { pdfRaporuOlustur } from '../utils/pdf';

function Card({ title, action, children, className = '' }) {
  return (
    <section className={`panel ${className}`}>
      {title && <div className="panel-head"><div><h2>{title}</h2></div>{action}</div>}
      {children}
    </section>
  );
}

function Badge({ children, tone = 'neutral' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function Stat({ label, value, sub, icon, danger, isLive = false, isBackendOnline = true }) { 
  return (
    <Card className="kpi">
      <div className="kpi-top">
        <span className="icon-surface" style={{ fontSize: '14px', fontWeight: 'bold', color: '#4A5568' }}>{icon}</span>
        {isLive && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: isBackendOnline ? '#38A169' : '#E53E3E', fontWeight: '700', letterSpacing: '0.5px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isBackendOnline ? '#38A169' : '#E53E3E', boxShadow: `0 0 6px ${isBackendOnline ? '#38A169' : '#E53E3E'}`, animation: 'pulse 1.5s infinite' }} />
            {isBackendOnline ? 'CANLI' : 'ÇEVRİMDIŞI'}
          </span>
        )}
      </div>
      <span>{label}</span>
      <strong className={danger ? 'danger-text' : ''}>{value}</strong>
      <small>{isBackendOnline ? sub : 'Bağlantı bekleniyor...'}</small>
    </Card>
  ); 
}

function Alerts({ makineVerileri, isBackendOnline = true, ayarlar }) {
  if (!isBackendOnline) {
    return (
      <div className="alert-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className="alert" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '8px', backgroundColor: '#FFF5F5', borderLeft: '4px solid #E53E3E' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#E53E3E' }} />
            <div>
              <strong style={{ fontSize: '13px', display: 'block', color: '#2D3748' }}>C# API Sunucu Bağlantısı Kesildi</strong>
              <small style={{ fontSize: '12px', color: '#718096' }}>Telemetri verisi alınamıyor. Sunucunun (AydMES.Api) açık olduğundan emin olun.</small>
            </div>
          </div>
          <Badge tone="danger">Çevrimdışı</Badge>
        </div>
      </div>
    );
  }

  const dinamikUyarilar = [];
  const safeData = Array.isArray(makineVerileri) ? makineVerileri : [];

  safeData.forEach(makine => {
    const kod = makine.kod || makine.Kod || makine[0];
    const durum = makine.durum || makine.Durum || makine[2];
    const sicaklik = makine.sicaklik !== undefined ? makine.sicaklik : (makine.Sicaklik || 0);
    const hataliAdet = makine.hataliAdet !== undefined ? makine.hataliAdet : (makine.HataliAdet || 0);
    const fireOrani = makine.fireOrani !== undefined ? makine.fireOrani : (makine.FireOrani || 0);

    if (sicaklik >= 55) {
      dinamikUyarilar.push({ title: `${kod} Sıcaklık Limiti Aşıldı`, text: `Sıcaklık ${sicaklik}°C kritik seviyeye ulaştı!`, status: 'Kritik Alarm', tone: 'danger' });
    }
    if (fireOrani > 0) {
      dinamikUyarilar.push({ title: `${kod} Fire/Hurda Üretimi`, text: `${hataliAdet} adet hatalı parça tespit edildi (%${fireOrani} fire).`, status: 'Fire Uyarısı', tone: 'warning' });
    }
    if (durum === 'Planlı duruş') {
      dinamikUyarilar.push({ title: `${kod} Planlı Duruşta`, text: `Makine şu an üretim beklemesinde.`, status: 'Duruş', tone: 'warning' });
    }
    if (durum === 'Bakımda') {
      dinamikUyarilar.push({ title: `${kod} Bakım Modunda`, text: `Makine teknik ekip bakımı altında.`, status: 'Bakım', tone: 'info' });
    }
    if (durum === 'Çalışıyor') {
      dinamikUyarilar.push({ title: `${kod} Aktif Üretimde`, text: `Kesintisiz pres baskısı devam ediyor.`, status: 'Normal', tone: 'success' });
    }
  });

  if (dinamikUyarilar.length === 0) {
    if (safeData.length === 0) {
      dinamikUyarilar.push({ title: 'Saha Verisi Bekleniyor', text: 'Bağlantı kuruldu, veri akışı bekleniyor...', status: 'Bekliyor', tone: 'info' });
    } else {
      dinamikUyarilar.push({ title: 'Tüm Sistemler Normal', text: 'Makineler ideal parametrelerde çalışıyor.', status: 'Stabil', tone: 'success' });
    }
  }

  const oncelikDegerleri = { 'danger': 4, 'warning': 3, 'info': 2, 'success': 1 };
  dinamikUyarilar.sort((a, b) => oncelikDegerleri[b.tone] - oncelikDegerleri[a.tone]);
  const gosterilecekUyarilar = dinamikUyarilar.slice(0, 4);

  const isDark = ayarlar?.tema === 'dark';

  return (
    <div className="alert-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {gosterilecekUyarilar.map((u, i) => (
        <div className="alert" key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '8px', backgroundColor: isDark ? (u.tone === 'danger' ? 'rgba(229, 62, 62, 0.15)' : (u.tone === 'warning' ? 'rgba(221, 107, 32, 0.15)' : '#2D3748')) : (u.tone === 'danger' ? '#FFF5F5' : (u.tone === 'warning' ? '#FEFCBF' : '#F7FAFC')), borderLeft: `4px solid ${u.tone === 'danger' ? '#E53E3E' : (u.tone === 'warning' ? '#DD6B20' : '#38A169')}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: u.tone === 'danger' ? '#E53E3E' : (u.tone === 'warning' ? '#DD6B20' : '#38A169') }} />
            <div>
              <strong style={{ fontSize: '13px', display: 'block', color: isDark ? '#F9FAFB' : '#2D3748' }}>{u.title}</strong>
              <small style={{ fontSize: '12px', color: isDark ? '#CBD5E1' : '#718096' }}>{u.text}</small>
            </div>
          </div>
          <Badge tone={u.tone}>{u.status}</Badge>
        </div>
      ))}
    </div>
  );
}

function LiveFeedStream({ canliMakineler = [], isBackendOnline = true, ayarlar }) {
  const [loglar, setLoglar] = useState([]);
  const oncekiMakinelerRef = useRef({});

  useEffect(() => {
    if (!Array.isArray(canliMakineler) || canliMakineler.length === 0) return;

    const simdikiZaman = new Date().toLocaleTimeString('tr-TR');
    const yeniLoglar = [];

    canliMakineler.forEach(m => {
      const kod = m.kod || m.Kod;
      const vurus = m.vurusSayisi !== undefined ? m.vurusSayisi : (m.VurusSayisi || 0);
      const durum = m.durum || m.Durum || 'Planlı duruş';
      const fire = m.hataliAdet !== undefined ? m.hataliAdet : (m.HataliAdet || 0);
      const prev = oncekiMakinelerRef.current[kod];

      if (prev) {
        if (vurus > prev.vurus) {
          const fark = vurus - prev.vurus;
          yeniLoglar.push({
            id: Math.random(),
            saat: simdikiZaman,
            kod,
            mesaj: `+${fark} vuruş yapıldı. Toplam: ${vurus.toLocaleString()} vuruş`,
            tip: 'vurus',
            tone: 'success'
          });
        }
        if (fire > prev.fire) {
          yeniLoglar.push({
            id: Math.random(),
            saat: simdikiZaman,
            kod,
            mesaj: `Fire tespit edildi! Toplam Fire: ${fire} Adet`,
            tip: 'fire',
            tone: 'danger'
          });
        }
        if (durum !== prev.durum) {
          yeniLoglar.push({
            id: Math.random(),
            saat: simdikiZaman,
            kod,
            mesaj: `Durum değişti: ${prev.durum} ➔ ${durum}`,
            tip: 'durum',
            tone: 'info'
          });
        }
      } else {
        yeniLoglar.push({
          id: Math.random(),
          saat: simdikiZaman,
          kod,
          mesaj: `Saha telemetri bağlantısı aktif. Durum: ${durum} (${vurus} vuruş)`,
          tip: 'sistem',
          tone: 'neutral'
        });
      }

      oncekiMakinelerRef.current[kod] = { vurus, durum, fire };
    });

    if (yeniLoglar.length > 0) {
      setLoglar(prev => [...yeniLoglar, ...prev].slice(0, 4));
    }
  }, [canliMakineler]);

  const isDark = ayarlar?.tema === 'dark';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {!isBackendOnline ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#E53E3E', fontSize: '13px', fontWeight: 'bold' }}>
          C# API sunucusu çevrimdışı. Saha akış verisi alınamıyor.
        </div>
      ) : loglar.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#A0AEC0', fontSize: '13px' }}>
          Canlı fabrika akış verisi bekleniyor...
        </div>
      ) : (
        loglar.map((l) => (
          <div key={l.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', backgroundColor: isDark ? '#2D3748' : '#F8FAFC', border: `1px solid ${isDark ? '#4A5568' : '#E2E8F0'}`, animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: l.tone === 'danger' ? '#E53E3E' : (l.tone === 'success' ? '#38A169' : '#3182CE') }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ fontSize: '13px', color: isDark ? '#F9FAFB' : '#1A202C' }}>{l.kod}</strong>
                  <small style={{ fontSize: '11px', color: '#718096', fontWeight: 'bold' }}>{l.saat}</small>
                </div>
                <span style={{ fontSize: '12px', color: isDark ? '#CBD5E1' : '#4A5568' }}>{l.mesaj}</span>
              </div>
            </div>
            <Badge tone={l.tone}>{l.tip.toUpperCase()}</Badge>
          </div>
        ))
      )}
    </div>
  );
}

function TaskTable({ ayarlar, gosterBildirim }) {
  const [gorevler, setGorevler] = useState([]);
  const [isModalAcik, setIsModalAcik] = useState(false);
  const [yeniGorev, setYeniGorev] = useState({
    gorevAdi: '', atananKisi: '', durum: 'Beklemede', oncelik: 'medium', termin: ''
  });

  useEffect(() => {
    const gorevleriGetir = async () => {
      try {
        const apiUrl = API_URL;
        const response = await fetch(`${apiUrl}/GorevKayitlari`);
        if (response.ok) {
          const data = await response.json();
          setGorevler(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Görevler çekilemedi (Offline Moda Geçiliyor):", error);
        setGorevler(mockGorevKayitlari);
      }
    };
    gorevleriGetir();
    const timer = setInterval(gorevleriGetir, ayarlar?.yenilemeHizi || 3000);
    return () => clearInterval(timer);
  }, [ayarlar?.yenilemeHizi]);

  const gorevKaydet = async (e) => {
    e.preventDefault(); 
    try {
      const apiUrl = API_URL;
      const response = await fetch(`${apiUrl}/GorevKayitlari`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(yeniGorev),
      });

      if (response.ok) {
        setIsModalAcik(false); 
        setYeniGorev({ gorevAdi: '', atananKisi: '', durum: 'Beklemede', oncelik: 'medium', termin: '' }); 
        gosterBildirim("Yeni görev kaydedildi!", "success");
      } else {
        gosterBildirim("Görev eklenirken bir hata oluştu.", "error");
      }
    } catch { 
      gosterBildirim("Sunucu hatası! Lütfen C# API'nin açık olduğundan emin olun.", "error");
    }
  };

  return (
    <Card title="Aksiyon & Görev Takibi" action={<button className="primary-button" onClick={() => setIsModalAcik(true)}>+ Yeni Aksiyon</button>}>
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Görev</th><th>Atanan Operatör</th><th>Durum</th><th>Öncelik</th><th>Termin</th>
            </tr>
          </thead>
          <tbody>
            {gorevler.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', color: '#999' }}>Kayıtlı aksiyon bulunamadı.</td></tr>
            ) : (
              gorevler.map((g) => (
                <tr key={g.id || g.Id}>
                  <td><strong>{g.gorevAdi || g.GorevAdi}</strong></td>
                  <td>{g.atananKisi || g.AtananKisi}</td>
                  <td><Badge tone={g.durum === 'Tamamlandı' ? 'success' : (g.durum === 'Devam ediyor' ? 'warning' : 'neutral')}>{g.durum || g.Durum}</Badge></td>
                  <td>
                    <span style={{ 
                      color: (g.oncelik || g.Oncelik) === 'high' ? '#E53E3E' : ((g.oncelik || g.Oncelik) === 'medium' ? '#DD6B20' : '#38A169'),
                      fontWeight: 'bold', fontSize: '12px' 
                    }}>
                      {(g.oncelik || g.Oncelik) === 'high' ? 'Yüksek' : ((g.oncelik || g.Oncelik) === 'medium' ? 'Orta' : 'Düşük')}
                    </span>
                  </td>
                  <td>{g.termin || g.Termin}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalAcik && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: ayarlar?.tema === 'dark' ? '#1F2937' : '#FAFAFA', padding: '32px', borderRadius: '8px', width: '400px', border: `1px solid ${ayarlar?.tema === 'dark' ? '#374151' : '#E5E7EB'}`, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: ayarlar?.tema === 'dark' ? '#F9FAFB' : '#333' }}>Yeni Görev Ekle</h3>
            <form onSubmit={gorevKaydet} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', color: '#555' }}>
                Görev Adı
                <input required type="text" value={yeniGorev.gorevAdi} onChange={(e) => setYeniGorev({...yeniGorev, gorevAdi: e.target.value})} style={{ padding: '8px', border: '1px solid #CCC', borderRadius: '4px', outline: 'none' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', color: '#555' }}>
                Atanan Kişi
                <input required type="text" value={yeniGorev.atananKisi} onChange={(e) => setYeniGorev({...yeniGorev, atananKisi: e.target.value})} style={{ padding: '8px', border: '1px solid #CCC', borderRadius: '4px', outline: 'none' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', color: '#555' }}>
                Durum
                <select value={yeniGorev.durum} onChange={(e) => setYeniGorev({...yeniGorev, durum: e.target.value})} style={{ padding: '8px', border: '1px solid #CCC', borderRadius: '4px', backgroundColor: '#FFF' }}>
                  <option value="Beklemede">Beklemede</option>
                  <option value="Devam ediyor">Devam ediyor</option>
                  <option value="Planlandı">Planlandı</option>
                  <option value="Tamamlandı">Tamamlandı</option>
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', color: '#555' }}>
                Öncelik
                <select value={yeniGorev.oncelik} onChange={(e) => setYeniGorev({...yeniGorev, oncelik: e.target.value})} style={{ padding: '8px', border: '1px solid #CCC', borderRadius: '4px', backgroundColor: '#FFF' }}>
                  <option value="low">Düşük</option>
                  <option value="medium">Orta</option>
                  <option value="high">Yüksek</option>
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', color: '#555' }}>
                Termin
                <input required type="text" value={yeniGorev.termin} onChange={(e) => setYeniGorev({...yeniGorev, termin: e.target.value})} style={{ padding: '8px', border: '1px solid #CCC', borderRadius: '4px', outline: 'none' }} />
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalAcik(false)} className="outline-button">İptal</button>
                <button type="submit" className="primary-button">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}

// Canlı makine listesinden anlık toplam vuruşu trend geçmişine ekler (son 30 nokta tutulur)
function trendGecmisineEkle(prev, makineler) {
  if (!Array.isArray(makineler) || makineler.length === 0) return prev;
  const saat = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  if (prev.length > 0 && prev[prev.length - 1].saat === saat) return prev;
  const toplamVurus = makineler.reduce((acc, m) => acc + (m.vurusSayisi ?? m.VurusSayisi ?? 0), 0);
  return [...prev, { saat, uretim: toplamVurus }].slice(-30);
}

export default function Dashboard({ ayarlar, gosterBildirim, isBackendOnline = true, tarihFiltresi }) { 
  const [trendVerileri, setTrendVerileri] = useState([]);
  const [oeeVerileri, setOeeVerileri] = useState([]);
  const [canliMakineler, setCanliMakineler] = useState([]);
  const [canliOeeKayitlari, setCanliOeeKayitlari] = useState([]);
  const [canliTrendGecmisi, setCanliTrendGecmisi] = useState([]);

  useEffect(() => {
    const verileriGetir = async () => {
      try {
        const apiUrl = API_URL;
        const resTrend = await fetch(`${apiUrl}/Analiz/UretimTrendi`);
        if (resTrend.ok) setTrendVerileri(await resTrend.json());

        const resOee = await fetch(`${apiUrl}/Analiz/OeeDagilimi`);
        if (resOee.ok) setOeeVerileri(await resOee.json());

        const resMakine = await fetch(`${apiUrl}/MakineVerileri`);
        if (resMakine.ok) {
          const makineler = await resMakine.json();
          setCanliMakineler(makineler);
          setCanliTrendGecmisi(prev => trendGecmisineEkle(prev, makineler));
        }

        const resOeeK = await fetch(`${apiUrl}/OeeKayitlari`);
        if (resOeeK.ok) {
          const oeeData = await resOeeK.json();
          setCanliOeeKayitlari(Array.isArray(oeeData) ? oeeData : []);
        }
      } catch (error) { 
        console.error("Veri çekme hatası (Offline Moda Geçiliyor):", error); 
        setTrendVerileri(mockTrendVerileri);
        setOeeVerileri(mockOeeDagilimi);
        setCanliMakineler(mockMakineVerileri);
        setCanliOeeKayitlari(mockOeeKayitlari);
      }
    };
    // İlk yükleme de zamanlayıcı üzerinden yapılır (effect içinde doğrudan setState yerine)
    const ilkYukleme = setTimeout(verileriGetir, 0);
    const timer = setInterval(verileriGetir, ayarlar?.yenilemeHizi || 3000);
    return () => { clearTimeout(ilkYukleme); clearInterval(timer); };
  }, [ayarlar?.yenilemeHizi]);

  const aktifMakineler = Array.isArray(canliMakineler) ? canliMakineler.filter(m => (m.durum || m.Durum) === 'Çalışıyor') : [];
  const canliToplamVurus = aktifMakineler.reduce((acc, m) => acc + (m.vurusSayisi || m.VurusSayisi || 0), 0);
  const trendToplamUretim = trendVerileri.reduce((t, i) => t + (i.uretim || 0), 0);
  const toplamUretim = canliToplamVurus > 0 ? canliToplamVurus : (aktifMakineler.length > 0 ? 0 : trendToplamUretim);
  const makineKullanimi = oeeVerileri.find(x => x.name === "Kullanılabilirlik")?.value || 0;
  const kalite = oeeVerileri.find(x => x.name === "Kalite")?.value || 0;
  const fireOrani = kalite > 0 ? (100 - kalite).toFixed(1) : "0.0";

  const filtrelenmisOeeKayitlari = canliOeeKayitlari.filter(kayit => {
    if (!tarihFiltresi?.baslangic) return true;
    const kayitTarih = kayit.tarih || kayit.Tarih;
    if (!kayitTarih) return true;
    const kt = kayitTarih.split('T')[0];
    return kt >= tarihFiltresi.baslangic && kt <= tarihFiltresi.bitis;
  });

  const anlikOeeValues = filtrelenmisOeeKayitlari.map(item => {
    const candidates = [item.oee, item.Oee, item.genelOee, item.GenelOee];
    for (const c of candidates) {
      if (typeof c === 'number' && !isNaN(c) && c > 0) return c;
    }
    return 0;
  });
  const anlikOeeOrtalama = anlikOeeValues.length > 0
    ? (anlikOeeValues.reduce((a, b) => a + b, 0) / anlikOeeValues.length).toFixed(1)
    : '0.0';

  useEffect(() => {
    const handlePdfExport = () => {
      pdfRaporuOlustur({
        baslik: 'AYD MES Genel Bakış Raporu',
        altBaslik: 'Tüm pres makineleri anlık OEE, sıcaklık ve üretim durumları dökümü',
        veriler: canliMakineler.map(m => ({
          kod: m.kod || m.Kod || m[0] || '-',
          durum: m.durum || m.Durum || m[2] || '-',
          sicaklik: `${m.sicaklik || m.Sicaklik || 0}°C`,
          oee: `%${m.oee || m.Oee || 0}`,
          hiz: `${m.hiz || m.Hiz || 0} v/dk`,
          hedef: m.hedefVurus || m.HedefVurus || 0,
          uretilen: m.toplamVurus || m.ToplamVurus || 0
        })),
        sutunlar: [
          { header: 'Makine Kodu', key: 'kod' },
          { header: 'Durum', key: 'durum' },
          { header: 'Sıcaklık', key: 'sicaklik' },
          { header: 'Canlı OEE', key: 'oee' },
          { header: 'Hız', key: 'hiz' },
          { header: 'Hedef Vuruş', key: 'hedef' },
          { header: 'Üretilen Vuruş', key: 'uretilen' }
        ],
        kpiListesi: [
          { label: 'Aktif Makine', value: canliMakineler.length },
          { label: 'Ortalama OEE', value: `%${anlikOeeOrtalama}` },
          { label: 'Toplam Hedef', value: canliMakineler.reduce((acc, curr) => acc + (curr.hedefVurus || curr.HedefVurus || 0), 0) },
          { label: 'Toplam Üretilen', value: canliMakineler.reduce((acc, curr) => acc + (curr.toplamVurus || curr.ToplamVurus || 0), 0) }
        ],
        gosterBildirim
      });
    };
    window.addEventListener('app-pdf-export', handlePdfExport);
    return () => window.removeEventListener('app-pdf-export', handlePdfExport);
  }, [canliMakineler, anlikOeeOrtalama, gosterBildirim]);

  const grafikVerisi = canliTrendGecmisi.length >= 2 ? canliTrendGecmisi : trendVerileri;

  return (
    <>
      <div className="kpi-grid">
        <Stat label="Anlık OEE" value={`%${anlikOeeOrtalama}`} sub="Canlı Hesaplama" icon="OEE %" isLive isBackendOnline={isBackendOnline} danger={parseFloat(anlikOeeOrtalama) < 60} />
        <Stat label="Toplam Üretim" value={`${toplamUretim.toLocaleString()} adet`} sub="Bugünkü canlı vuruş" icon="ÜRETİM" isLive isBackendOnline={isBackendOnline} />
        <Stat label="Makine Kullanımı" value={`%${makineKullanimi}`} sub="Canlı Veri" icon="KAPASİTE" isLive isBackendOnline={isBackendOnline} /> 
        <Stat label="Fire Oranı" value={`%${fireOrani}`} sub="Kalite kaybı" icon="FİRE" isLive isBackendOnline={isBackendOnline} />
      </div>
      
      {/* CANLI FABRİKA OLAY AKIŞI VE CANLI UYARILAR */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1.1fr)', gap: '24px', marginBottom: '24px' }}>
        <Card title="CANLI SAHA AKIŞ LOGU (REAL-TIME EVENT STREAM)">
          <LiveFeedStream canliMakineler={canliMakineler} isBackendOnline={isBackendOnline} ayarlar={ayarlar} />
        </Card>

        <Card title="CANLI SİSTEM UYARILARI">
          <Alerts makineVerileri={canliMakineler} isBackendOnline={isBackendOnline} ayarlar={ayarlar} />
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '24px', marginBottom: '24px' }}>
        <Card title="Anlık Üretim Trendi (Canlı)">
          <div style={{ width: '100%', height: 250 }}>
            {grafikVerisi.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={grafikVerisi}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="saat" 
                    tick={{ fontSize: 11 }}
                    interval={Math.max(0, Math.floor(grafikVerisi.length / 6) - 1)}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="uretim" stroke="#df0613" strokeWidth={3} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div style={{padding: '20px', textAlign: 'center'}}>Canlı veri bekleniyor...</div>}
          </div>
        </Card>

        <Card title="OEE Dağılımı">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 250, gap: '20px' }}>
            {oeeVerileri.length === 0 ? (
              <div style={{ color: '#888', display: 'flex', alignItems: 'center', height: '100%' }}>Yükleniyor...</div>
            ) : (
              <>
                <div style={{ width: '50%', height: '100%', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none', zIndex: 0 }}>
                    <span style={{ display: 'block', fontSize: '24px', fontWeight: 'bold', color: '#2D3748' }}>
                      %{anlikOeeOrtalama}
                    </span>
                    <span style={{ fontSize: '12px', color: '#718096' }}>OEE</span>
                  </div>
                  <ResponsiveContainer width="100%" height="100%" style={{ position: 'relative', zIndex: 1 }}>
                    <PieChart>
                      <Pie data={oeeVerileri} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {oeeVerileri.map((entry, index) => {
                          const COLORS = ['#df0613', '#3182CE', '#38A169'];
                          return <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />;
                        })}
                      </Pie>
                      <Tooltip wrapperStyle={{ zIndex: 1000 }} contentStyle={{borderRadius: '4px', border: '1px solid #ddd'}} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ width: '50%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {oeeVerileri.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }}></span>
                        <span style={{ color: '#4A5568' }}>{item.name}</span>
                      </div>
                      <strong style={{ color: '#2D3748' }}>%{item.value}</strong>
                    </div>
                  ))}
                  {/* Anlık OEE satırı */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#df0613', boxShadow: '0 0 6px #df0613', animation: 'pulse 1.5s infinite' }}></span>
                      <span style={{ color: '#2D3748', fontWeight: 'bold' }}>Anlık OEE</span>
                    </div>
                    <strong style={{ color: '#df0613', fontSize: '16px' }}>%{anlikOeeOrtalama}</strong>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      <div className="content-grid plan-layout">
          <TaskTable ayarlar={ayarlar} gosterBildirim={gosterBildirim} />
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}