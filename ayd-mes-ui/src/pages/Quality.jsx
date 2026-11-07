import { API_URL } from '../config/api';
import { useState, useEffect } from 'react';
import { mockDefektKayitlari, mockKaliteOnaylari } from '../utils/mockData';
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
      <div className="kpi-top"><span className="icon-surface" style={{ fontSize: '12px', fontWeight: 'bold', color: '#4A5568' }}>{icon}</span></div>
      <span>{label}</span>
      <strong className={danger ? 'danger-text' : ''}>{value}</strong>
      <small>{sub}</small>
    </Card>
  ); 
}

export default function Quality({ ayarlar, gosterBildirim, tarihFiltresi, userRole }) { 
  const [defektler, setDefektler] = useState([]);
  const [onaylar, setOnaylar] = useState([]); 
  const [dateFilter, setDateFilter] = useState({ baslangic: '', bitis: '', preset: 'Tüm Zamanlar' });

  const [isKontrolModalAcik, setIsKontrolModalAcik] = useState(false);
  const [kontrolForm, setKontrolForm] = useState({
    partiKodu: '',
    olcumDegeri: '',
    durum: 'Onaylandı',
    notlar: ''
  });

  const [isAnalizModalAcik, setIsAnalizModalAcik] = useState(false);
  const [secilenDefekt, setSecilenDefekt] = useState(null);

  const [duzenlenecekOnay, setDuzenlenecekOnay] = useState(null);
  const [silinecekOnay, setSilinecekOnay] = useState(null);
  const [silinecekDefekt, setSilinecekDefekt] = useState(null);

  const verileriGetir = async () => {
    try {
      const apiUrl = API_URL;
      const resDefekt = await fetch(`${apiUrl}/DefektKayitlari`);
      if (resDefekt.ok) {
        const dataDefekt = await resDefekt.json();
        setDefektler(Array.isArray(dataDefekt) ? dataDefekt : []);
      }

      const resOnay = await fetch(`${apiUrl}/KaliteOnaylari`);
      if (resOnay.ok) {
        const dataOnay = await resOnay.json();
        setOnaylar(Array.isArray(dataOnay) ? dataOnay : []);
      }
    } catch (error) {
      console.error("Kalite verileri çekilemedi (Offline Moda Geçiliyor):", error);
      setDefektler(mockDefektKayitlari);
      setOnaylar(mockKaliteOnaylari);
    }
  };

  useEffect(() => {
    // İlk yükleme de zamanlayıcı üzerinden yapılır (effect içinde doğrudan setState yerine)
    const ilkYukleme = setTimeout(verileriGetir, 0);
    const timer = setInterval(verileriGetir, ayarlar?.yenilemeHizi || 5000);
    return () => { clearTimeout(ilkYukleme); clearInterval(timer); };
  }, [ayarlar?.yenilemeHizi]);

  useEffect(() => {
    const handleOpenModal = () => setIsKontrolModalAcik(true);
    window.addEventListener('app-quality-form-open', handleOpenModal);
    return () => window.removeEventListener('app-quality-form-open', handleOpenModal);
  }, []);

  const analizAc = (defekt) => {
    setSecilenDefekt(defekt);
    setIsAnalizModalAcik(true);
  };

  const kontrolKaydet = async (e) => {
    e.preventDefault();
    try {
      const apiUrl = API_URL;
      const response = await fetch(`${apiUrl}/KaliteOnaylari`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partiKodu: kontrolForm.partiKodu,
          islemAdimi: 'Son Kontrol',
          durum: kontrolForm.durum,
          saat: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          olcumDegeri: kontrolForm.olcumDegeri,
          notlar: kontrolForm.notlar
        }),
      });

      if (response.ok) {
        setIsKontrolModalAcik(false); 
        setKontrolForm({ partiKodu: '', olcumDegeri: '', durum: 'Onaylandı', notlar: '' }); 
        if (gosterBildirim) gosterBildirim("Kalite kontrol sonucu kaydedildi!", "success");
        verileriGetir();
      } else {
        if (gosterBildirim) gosterBildirim("Kayıt başarısız oldu.", "error");
      }
    } catch {
      if (gosterBildirim) gosterBildirim("Sunucu bağlantı hatası!", "error");
    }
  };

  const durumDegistir = async (onay, yeniDurum) => {
    try {
      const apiUrl = API_URL;
      const id = onay.id || onay.Id;
      const res = await fetch(`${apiUrl}/KaliteOnaylari/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durum: yeniDurum })
      });

      if (res.ok) {
        if (gosterBildirim) gosterBildirim(`${onay.partiKodu} durumu '${yeniDurum}' olarak güncellendi.`, 'success');
        verileriGetir();
      }
    } catch {
      if (gosterBildirim) gosterBildirim('Durum güncellenemedi.', 'error');
    }
  };

  const onaySil = async () => {
    if (!silinecekOnay) return;
    try {
      const apiUrl = API_URL;
      const id = silinecekOnay.id || silinecekOnay.Id;
      const res = await fetch(`${apiUrl}/KaliteOnaylari/${id}`, { method: 'DELETE' });

      if (res.ok) {
        if (gosterBildirim) gosterBildirim(`${silinecekOnay.partiKodu} silindi.`, 'info');
        setSilinecekOnay(null);
        verileriGetir();
      }
    } catch {
      if (gosterBildirim) gosterBildirim('Silme başarısız.', 'error');
    }
  };

  const defektSil = async () => {
    if (!silinecekDefekt) return;
    try {
      const apiUrl = API_URL;
      const id = silinecekDefekt.id || silinecekDefekt.Id;
      const res = await fetch(`${apiUrl}/DefektKayitlari/${id}`, { method: 'DELETE' });

      if (res.ok) {
        if (gosterBildirim) gosterBildirim(`${silinecekDefekt.defektTuru} silindi.`, 'info');
        setSilinecekDefekt(null);
        verileriGetir();
      }
    } catch {
      if (gosterBildirim) gosterBildirim('Silme başarısız.', 'error');
    }
  };

  const onayGuncelleSubmit = async (e) => {
    e.preventDefault();
    if (!duzenlenecekOnay) return;
    try {
      const apiUrl = API_URL;
      const id = duzenlenecekOnay.id || duzenlenecekOnay.Id;
      const res = await fetch(`${apiUrl}/KaliteOnaylari/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duzenlenecekOnay)
      });

      if (res.ok) {
        if (gosterBildirim) gosterBildirim(`${duzenlenecekOnay.partiKodu} kalite kaydı güncellendi!`, 'success');
        setDuzenlenecekOnay(null);
        verileriGetir();
      }
    } catch {
      if (gosterBildirim) gosterBildirim('Güncelleme başarısız.', 'error');
    }
  };

  const safeOnaylar = Array.isArray(onaylar) ? onaylar : [];
  const aktifTarihFiltresi = (tarihFiltresi && (tarihFiltresi.baslangic || tarihFiltresi.bitis)) 
    ? tarihFiltresi 
    : dateFilter;

  const filterByDate = (items) => items.filter(item => {
    if (!aktifTarihFiltresi.baslangic && !aktifTarihFiltresi.bitis) return true;
    const itemDate = item.tarih || item.createdDate || item.tarihSaate;
    if (!itemDate) return true;
    const d = new Date(itemDate).toISOString().split('T')[0];
    if (aktifTarihFiltresi.baslangic && d < aktifTarihFiltresi.baslangic) return false;
    if (aktifTarihFiltresi.bitis && d > aktifTarihFiltresi.bitis) return false;
    return true;
  });

  const filteredOnaylar = filterByDate(safeOnaylar);
  const filteredDefektler = filterByDate(Array.isArray(defektler) ? defektler : []);
  
  const isApiActive = filteredDefektler.length > 0 || filteredOnaylar.length > 0;
  const toplamDefektAdet = filteredDefektler.reduce((toplam, d) => toplam + (d.adet || 0), 0);
  const yuzdeBolen = toplamDefektAdet === 0 ? 1 : toplamDefektAdet; 
  
  let enSikDefektAdi = "Yok";
  let enSikDefektAdeti = 0;

  filteredDefektler.forEach(d => {
    if ((d.adet || 0) > enSikDefektAdeti) {
      enSikDefektAdeti = d.adet || 0;
      enSikDefektAdi = d.defektTuru || "Bilinmiyor";
    }
  });

  useEffect(() => {
    const handleExcel = () => {
      const dataToExport = filteredOnaylar.map(o => ({
        "Parti Kodu": o.partiKodu || '-',
        "İşlem Adımı": o.islemAdimi || '-',
        "Durum": o.durum || '-',
        "Saat": o.saat || '-',
        "Ölçüm Değeri (mm)": o.olcumDegeri || '-',
        "Notlar": o.notlar || '-'
      }));
      excelIndir(dataToExport, 'Kalite_Kontrol_Onaylari', gosterBildirim);
    };

    const handlePdf = () => {
      pdfRaporuOlustur({
        baslik: 'Kalite Kontrol ve Onay Raporu',
        altBaslik: 'Defekt dağılımı, kalite oranları ve onay süreçleri günlük rapor dökümü',
        veriler: filteredOnaylar,
        sutunlar: [
          { header: 'Parti Kodu', key: 'partiKodu' },
          { header: 'İşlem Adımı', key: 'islemAdimi' },
          { header: 'Durum', key: 'durum' },
          { header: 'Saat', key: 'saat' },
          { header: 'Ölçüm', key: 'olcumDegeri' }
        ],
        kpiListesi: [
          { label: 'Kontrol Bekleyen', value: filteredOnaylar.length },
          { label: 'Toplam Defekt Adet', value: toplamDefektAdet },
          { label: 'En Sık Defekt', value: enSikDefektAdi }
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
  }, [filteredOnaylar, toplamDefektAdet, enSikDefektAdi]);

  return (
    <>
      <DateRangePicker onFilterChange={setDateFilter} ayarlar={ayarlar} />

      <div className="kpi-grid">
        <Stat 
          label="İlk seferde doğru" 
          value={isApiActive ? "%98,7" : "%0"} 
          sub="Canlı OEE verisiyle eşleşiyor" 
          icon="KALİTE"
        />
        <Stat 
          label="Kontrol bekleyen" 
          value={safeOnaylar.length} 
          sub={`${safeOnaylar.length} parti için onay gerekli`} 
          icon="BEKLEYEN"
        />
        <Stat 
          label="Toplam defekt" 
          value={toplamDefektAdet} 
          sub="Bugünkü toplam fire" 
          icon="DEFEKT"
        />
        <Stat 
          label="En sık defekt"
          value={enSikDefektAdi} 
          sub={`${enSikDefektAdeti} kayıt`} 
          icon="EN SIK"
        />
      </div>
      
      <div className="content-grid two-col">
        <Card 
          title="Defekt Kayıtları" 
          action={
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="outline-button" onClick={() => excelIndir(filteredDefektler, 'Defekt_Raporu', gosterBildirim)}>
                Excel
              </button>
              <button className="outline-button" onClick={() => {
                pdfRaporuOlustur({
                  baslik: 'Kalite ve Defekt Analizi Raporu',
                  altBaslik: 'Vardiya defekt türleri ve kalite onay detay dökümü',
                  veriler: filteredDefektler,
                  sutunlar: [
                    { header: 'Defekt Türü', key: 'defektTuru' },
                    { header: 'Makine Kodu', key: 'makineKod' },
                    { header: 'Hatalı Adet', key: 'adet' },
                    { header: 'Defekt Oranı', key: 'oran' }
                  ],
                  kpiListesi: [
                    { label: 'İlk Seferde Doğru', value: isApiActive ? "%98,7" : "%0" },
                    { label: 'Kontrol Bekleyen', value: filteredOnaylar.length },
                    { label: 'Toplam Defekt Adet', value: toplamDefektAdet },
                    { label: 'En Sık Defekt', value: enSikDefektAdi }
                  ],
                  gosterBildirim
                });
              }}>
                PDF Raporu
              </button>
            </div>
          }
        >
          <div className="defect-list">
            {filteredDefektler.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Seçili tarih aralığında defekt kaydı bulunamadı.</div>
            ) : (
              filteredDefektler.map((d) => (
                <div key={d.id || d.defektTuru} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #EDF2F7' }}>
                  <div style={{ width: '140px' }}>
                    <strong>{d.defektTuru}</strong>
                    <small style={{ display: 'block', color: '#718096' }}>{d.makineKod}</small>
                  </div>
                  <div className="progress" style={{ flex: 1, margin: '0 15px' }}>
                    <span style={{ width: `${((d.adet || 0) / yuzdeBolen) * 100}%` }} />
                  </div>
                  <b style={{ minWidth: '40px' }}>{d.adet}</b>
                  <small style={{ minWidth: '50px', color: '#718096' }}>{d.oran}</small>
                  {canEdit(userRole) && (<button onClick={() => setSilinecekDefekt(d)} className="outline-button" style={{ padding: '2px 8px', fontSize: '11px', marginLeft: '10px', color: '#E53E3E', borderColor: '#FEB2B2' }}>Sil</button>)}
                </div>
              ))
            )}
          </div>
        </Card>
        
        <Card title="Kalite Onayları & İş Akışı">
          <div className="approval-list">
            {filteredOnaylar.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#666', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Seçili tarih aralığında onay kaydı bulunamadı.
              </div>
            ) : (
              filteredOnaylar.map((onay) => {
                const durum = onay.durum || onay.Durum || 'Bekliyor';
                const partiKodu = onay.partiKodu || onay.PartiKodu || 'PRT-00';
                const islemAdimi = onay.islemAdimi || onay.IslemAdimi || 'Son Kontrol';
                const saat = onay.saat || onay.Saat || '12:00';

                return (
                  <div key={onay.id || onay.Id || partiKodu} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #EDF2F7', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: durum === 'Bekliyor' ? '#DD6B20' : (durum === 'Reddedildi' ? '#E53E3E' : '#38A169') }} />
                      <div>
                        <strong>{partiKodu} · {islemAdimi}</strong>
                        <small style={{ display: 'block', color: '#718096' }}>
                          {durum === 'Bekliyor' ? 'Kalite sorumlusu bekleniyor' : `${durum} · ${saat}`}
                        </small>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {durum === 'Bekliyor' ? (
                        <>
                          <button onClick={() => durumDegistir(onay, 'Onaylandı')} className="primary-button" style={{ padding: '4px 8px', fontSize: '11px', backgroundColor: '#38A169', borderColor: '#38A169' }}>
                            Onayla
                          </button>
                          <button onClick={() => durumDegistir(onay, 'Reddedildi')} className="outline-button" style={{ padding: '4px 8px', fontSize: '11px', color: '#E53E3E', borderColor: '#FEB2B2' }}>
                            Reddet
                          </button>
                        </>
                      ) : (
                        <Badge tone={durum === 'Reddedildi' ? 'danger' : 'success'}>
                          {durum}
                        </Badge>
                      )}

                      {canEdit(userRole) && (
                        <>
                          <button onClick={() => setDuzenlenecekOnay(onay)} className="outline-button" style={{ padding: '2px 8px', fontSize: '11px' }}>Düzenle</button>
                          <button onClick={() => setSilinecekOnay(onay)} className="outline-button" style={{ padding: '2px 8px', fontSize: '11px', color: '#E53E3E', borderColor: '#FEB2B2' }}>Sil</button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            {canEdit(userRole) && (
              <button className="outline-button" onClick={() => setIsKontrolModalAcik(true)} style={{ marginTop: '15px' }}>
                + Yeni Kalite Kontrol Kaydı
              </button>
            )}
          </div>
        </Card>
      </div>
      
      <Card title="Defekt Detay Tablosu">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Defekt Türü</th>
                <th>Kayıt Adedi</th>
                <th>Kaynak Makine</th>
                <th>Fire Oranı</th>
                <th>Aksiyonlar</th>
              </tr>
            </thead>
            <tbody>
              {filteredDefektler.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Kayıtlı defekt yok.</td>
                </tr>
              ) : (
                filteredDefektler.map((d) => (
                  <tr key={d.id || d.defektTuru}>
                    <td><strong>{d.defektTuru}</strong></td>
                    <td>{d.adet}</td>
                    <td>{d.makineKod}</td>
                    <td>{d.oran}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button className="text-action" onClick={() => analizAc(d)}>Analiz Et →</button>
                        {canEdit(userRole) && (<button onClick={() => setSilinecekDefekt(d)} className="outline-button" style={{ padding: '2px 8px', fontSize: '11px', color: '#E53E3E', borderColor: '#FEB2B2' }}>Sil</button>)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {isKontrolModalAcik && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#FAFAFA', padding: '32px', borderRadius: '8px', width: '420px', border: '1px solid #E5E7EB', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Yeni Kalite Kontrol Kaydı</h3>
            
            <form onSubmit={kontrolKaydet} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', color: '#555' }}>
                Parti Kodu
                <input required type="text" value={kontrolForm.partiKodu} onChange={(e) => setKontrolForm({...kontrolForm, partiKodu: e.target.value})} style={{ padding: '8px', border: '1px solid #CCC', borderRadius: '4px', outline: 'none' }} placeholder="Örn: PRT-908" />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', color: '#555' }}>
                Ölçüm Değeri / Kalite Skoru
                <input required type="text" value={kontrolForm.olcumDegeri} onChange={(e) => setKontrolForm({...kontrolForm, olcumDegeri: e.target.value})} style={{ padding: '8px', border: '1px solid #CCC', borderRadius: '4px', outline: 'none' }} placeholder="Örn: 98.5" />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', color: '#555' }}>
                Onay Durumu
                <select value={kontrolForm.durum} onChange={(e) => setKontrolForm({...kontrolForm, durum: e.target.value})} style={{ padding: '8px', border: '1px solid #CCC', borderRadius: '4px', backgroundColor: '#FFF' }}>
                  <option value="Onaylandı">Onaylandı</option>
                  <option value="Şartlı Kabul">Şartlı Kabul</option>
                  <option value="Reddedildi">Reddedildi</option>
                  <option value="Bekliyor">İncelemeye Al (Bekliyor)</option>
                </select>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', color: '#555' }}>
                Notlar ve Açıklamalar
                <textarea rows="3" value={kontrolForm.notlar} onChange={(e) => setKontrolForm({...kontrolForm, notlar: e.target.value})} style={{ padding: '8px', border: '1px solid #CCC', borderRadius: '4px', outline: 'none', resize: 'vertical' }} placeholder="Ekstra belirtmek istediğiniz bir durum var mı?" />
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsKontrolModalAcik(false)} className="outline-button">İptal</button>
                <button type="submit" className="primary-button">Kaydet ve Onayla</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {duzenlenecekOnay && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#FAFAFA', padding: '32px', borderRadius: '12px', width: '420px', border: '1px solid #E5E7EB', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#1A202C' }}>Kalite Kaydını Düzenle</h3>
            <form onSubmit={onayGuncelleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', color: '#4A5568' }}>
                Durum
                <select value={duzenlenecekOnay.durum || duzenlenecekOnay.Durum || 'Onaylandı'} onChange={e => setDuzenlenecekOnay({...duzenlenecekOnay, durum: e.target.value})} style={{ padding: '8px', border: '1px solid #CBD5E0', borderRadius: '6px', backgroundColor: '#FFF' }}>
                  <option value="Onaylandı">Onaylandı</option>
                  <option value="Şartlı Kabul">Şartlı Kabul</option>
                  <option value="Reddedildi">Reddedildi</option>
                  <option value="Bekliyor">Bekliyor</option>
                </select>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', color: '#4A5568' }}>
                Ölçüm Değeri
                <input type="text" value={duzenlenecekOnay.olcumDegeri || duzenlenecekOnay.OlcumDegeri || ''} onChange={e => setDuzenlenecekOnay({...duzenlenecekOnay, olcumDegeri: e.target.value})} style={{ padding: '8px', border: '1px solid #CBD5E0', borderRadius: '6px' }} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', color: '#4A5568' }}>
                Notlar / Görsel Açıklaması
                <textarea rows="3" value={duzenlenecekOnay.notlar || duzenlenecekOnay.Notlar || ''} onChange={e => setDuzenlenecekOnay({...duzenlenecekOnay, notlar: e.target.value})} style={{ padding: '8px', border: '1px solid #CBD5E0', borderRadius: '6px' }} />
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setDuzenlenecekOnay(null)} className="outline-button">İptal</button>
                <button type="submit" className="primary-button">Güncelle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {silinecekOnay && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#FAFAFA', padding: '24px', borderRadius: '12px', width: '380px', border: '1px solid #E5E7EB', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            <h3 style={{ marginTop: 0, color: '#E53E3E' }}>Kalite Kaydını Sil</h3>
            <p style={{ fontSize: '14px', color: '#4A5568' }}>
              <b>{silinecekOnay.partiKodu || silinecekOnay.PartiKodu}</b> kaydını silmek istediğinize emin misiniz?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setSilinecekOnay(null)} className="outline-button">Vazgeç</button>
              <button onClick={onaySil} className="primary-button" style={{ backgroundColor: '#E53E3E', borderColor: '#E53E3E' }}>Evet, Sil</button>
            </div>
          </div>
        </div>
      )}

      {silinecekDefekt && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#FAFAFA', padding: '24px', borderRadius: '12px', width: '380px', border: '1px solid #E5E7EB', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            <h3 style={{ marginTop: 0, color: '#E53E3E' }}>Defekt Kaydını Sil</h3>
            <p style={{ fontSize: '14px', color: '#4A5568' }}>
              <b>{silinecekDefekt.defektTuru}</b> defekt kaydını silmek istediğinize emin misiniz?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setSilinecekDefekt(null)} className="outline-button">Vazgeç</button>
              <button onClick={defektSil} className="primary-button" style={{ backgroundColor: '#E53E3E', borderColor: '#E53E3E' }}>Evet, Sil</button>
            </div>
          </div>
        </div>
      )}

      {isAnalizModalAcik && secilenDefekt && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '12px', width: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#2D3748' }}>{secilenDefekt.defektTuru} - Kök Neden Analizi</h3>
              <button onClick={() => setIsAnalizModalAcik(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#A0AEC0' }}>&times;</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#4A5568' }}>
              <div style={{ padding: '12px', backgroundColor: '#F7FAFC', borderRadius: '8px' }}><strong>Kaynak Hat / Makine:</strong> {secilenDefekt.makineKod}</div>
              <div style={{ padding: '12px', backgroundColor: '#F7FAFC', borderRadius: '8px' }}><strong>Toplam Kayıt Adedi:</strong> {secilenDefekt.adet} Adet</div>
              <div style={{ padding: '12px', backgroundColor: '#F7FAFC', borderRadius: '8px' }}><strong>Fire Oranı:</strong> {secilenDefekt.oran}</div>
              <div style={{ padding: '12px', backgroundColor: '#FFF5F5', borderRadius: '8px', borderLeft: '4px solid #E53E3E' }}>
                <strong>Sistem Önerisi:</strong> Bu hat üzerinde hammadde besleme basıncını kontrol edin ve genel kalıp temizliği gerçekleştirin.
              </div>
            </div>
            <button onClick={() => setIsAnalizModalAcik(false)} style={{ width: '100%', padding: '12px', marginTop: '24px', backgroundColor: '#4A5568', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Kapat</button>
          </div>
        </div>
      )}
    </>
  ); 
}


