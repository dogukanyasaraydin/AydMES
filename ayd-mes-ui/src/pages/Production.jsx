import { API_URL } from '../config/api';
import { useState, useEffect } from 'react';
import { mockUretimPlanlari } from '../utils/mockData';
import { excelIndir } from '../utils/excel';
import { pdfRaporuOlustur } from '../utils/pdf';
import { canEdit } from '../utils/permissions';

function Badge({ children, tone = 'neutral', onClick, style = {}, title }) {
  return (
    <span 
      className={`badge badge-${tone}`} 
      onClick={onClick} 
      title={title}
      style={{ cursor: onClick ? 'pointer' : 'default', ...style }}
    >
      {children}
    </span>
  );
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

function ResourceList({ isApiActive, gosterBildirim, userRole }) { 
  const [isOptimizeModalAcik, setIsOptimizeModalAcik] = useState(false);
  const [optimizasyonHedefi, setOptimizasyonHedefi] = useState('OEE Maksimum');
  const [islemDurumu, setIslemDurumu] = useState('');

  const planiOptimizeEt = async (e) => {
    e.preventDefault();
    setIslemDurumu('Yükleniyor');
    
    try {
      const apiUrl = API_URL;
      const response = await fetch(`${apiUrl}/UretimPlanlari/Optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hedef: optimizasyonHedefi }),
      });

      if (response.ok) {
        setIslemDurumu('Tamamlandı');
        gosterBildirim("Üretim planı başarıyla optimize edildi!", "success");
        setTimeout(() => {
          setIsOptimizeModalAcik(false);
          setIslemDurumu('');
        }, 1500);
      } else {
        setIslemDurumu('Hata');
        gosterBildirim("Optimizasyon başarısız oldu.", "error");
      }
    } catch {
      setIslemDurumu('Hata');
      gosterBildirim("Sunucu bağlantı hatası!", "error");
    }
  };

  const resources = isApiActive 
    ? [
        ['Progresif Makineleri', '3/4', 75], 
        ['Pres Makineleri', '2/3', 66], 
        ['Küvet Makineleri', '2/4', 50], 
        ['Operatörler (Vardiya A)', '12/15', 80]
      ]
    : [
        ['Progresif Makineleri', '0/4', 0], 
        ['Pres Makineleri', '0/3', 0], 
        ['Küvet Makineleri', '0/4', 0], 
        ['Operatörler (Vardiya A)', '0/15', 0]
      ];

  return (
    <>
      <div className="resource-list">
        {resources.map(([name, value, percent]) => (
          <div className="resource" key={name}>
            <div><strong>{name}</strong><b>{value}</b></div>
            <div className="progress">
              <span style={{ width: `${percent}%`, transition: 'width 0.5s ease-in-out' }} />
            </div>
            <small>%{percent} kullanım</small>
          </div>
        ))}
        {canEdit(userRole) && <button className="primary-button full" onClick={() => setIsOptimizeModalAcik(true)}>Planı optimize et</button>}
      </div>

      {isOptimizeModalAcik && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#FAFAFA', padding: '32px', borderRadius: '8px', width: '420px', border: '1px solid #E5E7EB', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#333' }}>Üretim Planını Optimize Et</h3>
            
            <form onSubmit={planiOptimizeEt} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <p style={{ fontSize: '13px', color: '#4A5568', margin: '0 0 10px 0', lineHeight: '1.5' }}>
                Akıllı optimizasyon algoritması, seçtiğiniz önceliğe göre mevcut iş emirlerini boşta olan makinelere ve uygun operatörlere yeniden dağıtacaktır.
              </p>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', color: '#555', fontWeight: 'bold' }}>
                Optimizasyon Hedefi
                <select value={optimizasyonHedefi} onChange={(e) => setOptimizasyonHedefi(e.target.value)} style={{ padding: '10px', border: '1px solid #CCC', borderRadius: '4px', backgroundColor: '#FFF', fontWeight: 'normal' }}>
                  <option value="OEE Maksimum">Genel OEE'yi Maksimize Et</option>
                  <option value="Çevrim Süresi Minimum">Ortalama Çevrim Süresini Düşür</option>
                  <option value="Enerji Tasarrufu">Enerji Tüketimini Minimize Et</option>
                  <option value="Acil İşlere Öncelik">Sadece Acil Planlara Odaklan</option>
                </select>
              </label>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', alignItems: 'center' }}>
                <div>
                  {islemDurumu === 'Yükleniyor' && <span style={{ color: '#3182CE', fontSize: '13px', fontWeight: 'bold' }}>Algoritma çalışıyor...</span>}
                  {islemDurumu === 'Tamamlandı' && <span style={{ color: '#38B2AC', fontSize: '13px', fontWeight: 'bold' }}>✔️ Başarıyla Optimize Edildi</span>}
                  {islemDurumu === 'Hata' && <span style={{ color: '#E53E3E', fontSize: '13px', fontWeight: 'bold' }}>Bağlantı Hatası!</span>}
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setIsOptimizeModalAcik(false)} className="outline-button" disabled={islemDurumu === 'Yükleniyor'}>İptal</button>
                  <button type="submit" className="primary-button" disabled={islemDurumu === 'Yükleniyor'}>
                    {islemDurumu === 'Yükleniyor' ? 'Lütfen bekleyin...' : 'Çalıştır'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  ); 
}

export default function Production({ ayarlar, gosterBildirim, userRole }) {
  const [planlar, setPlanlar] = useState([]);
  const [aktifTab, setAktifTab] = useState('Gün');
  
  const [duzenlenecekPlan, setDuzenlenecekPlan] = useState(null);
  const [silinecekPlan, setSilinecekPlan] = useState(null);

  const planlariGetir = async () => {
    try {
      const apiUrl = API_URL;
      const response = await fetch(`${apiUrl}/UretimPlanlari`);
      if (response.ok) {
        const data = await response.json();
        setPlanlar(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Üretim planları çekilemedi (Offline Moda Geçiliyor):", error);
      setPlanlar(mockUretimPlanlari);
    }
  };

  useEffect(() => {
    // İlk yükleme de zamanlayıcı üzerinden yapılır (effect içinde doğrudan setState yerine)
    const ilkYukleme = setTimeout(planlariGetir, 0);
    const timer = setInterval(planlariGetir, ayarlar?.yenilemeHizi || 5000);
    return () => { clearTimeout(ilkYukleme); clearInterval(timer); };
  }, [ayarlar?.yenilemeHizi]);

  const durumGuncelle = async (plan) => {
    const durumSirasi = ['Planlandı', 'Üretimde', 'Tamamlandı'];
    const mevcutDurum = plan.durum || plan.Durum || 'Planlandı';
    const sonrakiIndex = (durumSirasi.indexOf(mevcutDurum) + 1) % durumSirasi.length;
    const yeniDurum = durumSirasi[sonrakiIndex];

    try {
      const apiUrl = API_URL;
      const id = plan.id || plan.Id;
      const res = await fetch(`${apiUrl}/UretimPlanlari/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...plan, durum: yeniDurum })
      });

      if (res.ok) {
        if (gosterBildirim) gosterBildirim(`${plan.isEmri || plan.IsEmri} durumu '${yeniDurum}' olarak güncellendi!`, 'info');
        planlariGetir();
      }
    } catch {
      if (gosterBildirim) gosterBildirim('Durum güncellenirken hata oluştu.', 'error');
    }
  };

  const planSil = async () => {
    if (!silinecekPlan) return;
    try {
      const apiUrl = API_URL;
      const id = silinecekPlan.id || silinecekPlan.Id;
      const res = await fetch(`${apiUrl}/UretimPlanlari/${id}`, { method: 'DELETE' });

      if (res.ok) {
        if (gosterBildirim) gosterBildirim(`${silinecekPlan.isEmri || silinecekPlan.IsEmri} silindi.`, 'success');
        setSilinecekPlan(null);
        planlariGetir();
      } else {
        if (gosterBildirim) gosterBildirim('Silme işlemi başarısız.', 'error');
      }
    } catch {
      if (gosterBildirim) gosterBildirim('Sunucu hatası!', 'error');
    }
  };

  const planGuncelleSubmit = async (e) => {
    e.preventDefault();
    if (!duzenlenecekPlan) return;
    try {
      const apiUrl = API_URL;
      const id = duzenlenecekPlan.id || duzenlenecekPlan.Id;
      const res = await fetch(`${apiUrl}/UretimPlanlari/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duzenlenecekPlan)
      });

      if (res.ok) {
        if (gosterBildirim) gosterBildirim(`${duzenlenecekPlan.isEmri} planı başarıyla güncellendi!`, 'success');
        setDuzenlenecekPlan(null);
        planlariGetir();
      } else {
        if (gosterBildirim) gosterBildirim('Güncelleme başarısız.', 'error');
      }
    } catch {
      if (gosterBildirim) gosterBildirim('Sunucu hatası!', 'error');
    }
  };

  const bugunkuIsEmri = planlar.length;
  const acilPlanlar = planlar.filter(p => (p.oncelik || p.Oncelik) === 'Yüksek').length;
  const uretimdekiler = planlar.filter(p => (p.durum || p.Durum) === 'Üretimde').length;
  const kapasite = planlar.length > 0 ? 87 : 0; 

  return (
    <>
      <div className="kpi-grid planning-kpis">
        <Stat label="Bugünkü iş emri" value={bugunkuIsEmri} sub="canlı günlük plan" icon="İŞ EMRİ"/>
        <Stat label="Kapasite kullanımı" value={`%${kapasite}`} sub="aktif kaynak verimliliği" icon="KAPASİTE"/>
        <Stat label="Aktif Üretim" value={uretimdekiler} sub="şu an işlenen" icon="ÜRETİM"/>
        <Stat label="Acil Planlar" value={acilPlanlar} sub="yüksek öncelikli" icon="ACİL" danger={acilPlanlar > 0}/>
      </div>
      
      <div className="content-grid plan-layout">
        <Card 
          title="Üretim Takvimi" 
          action={
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button className="outline-button" onClick={() => excelIndir(planlar, 'Uretim_Planlari', gosterBildirim)}>
                Excel
              </button>
              <button className="outline-button" onClick={() => {
                pdfRaporuOlustur({
                  baslik: 'Üretim Planlama ve Vardiya Takvimi Raporu',
                  altBaslik: 'Günlük ve haftalık iş emirleri, hedef vs üretilen durum dökümü',
                  veriler: planlar,
                  sutunlar: [
                    { header: 'Saat Aralığı', key: 'saatAraligi' },
                    { header: 'İş Emri Kodu', key: 'isEmri' },
                    { header: 'Ürün Adı', key: 'urun' },
                    { header: 'Makine Kodu', key: 'hat' },
                    { header: 'Hedef Adet', key: 'hedef' },
                    { header: 'Üretilen Adet', key: 'uretilen' },
                    { header: 'Durum', key: 'durum' }
                  ],
                  kpiListesi: [
                    { label: 'Bugünkü İş Emri', value: bugunkuIsEmri },
                    { label: 'Kapasite Kullanımı', value: `%${kapasite}` },
                    { label: 'Aktif Üretim', value: uretimdekiler },
                    { label: 'Acil Plan Sayısı', value: acilPlanlar }
                  ],
                  gosterBildirim
                });
              }}>
                PDF Raporu
              </button>
              <div className="tabs">
                <button className={aktifTab === 'Gün' ? 'selected' : ''} onClick={() => setAktifTab('Gün')}>Gün</button>
                <button className={aktifTab === 'Hafta' ? 'selected' : ''} onClick={() => setAktifTab('Hafta')}>Hafta</button>
                <button className={aktifTab === 'Ay' ? 'selected' : ''} onClick={() => setAktifTab('Ay')}>Ay</button>
              </div>
            </div>
          }
        >
          <div className="schedule">
            {planlar.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                {aktifTab} bazında planlı iş emri bulunamadı...
              </div>
            ) : (
              planlar.map((plan) => {
                const durum = plan.durum || plan.Durum || 'Planlandı';
                const oncelik = plan.oncelik || plan.Oncelik || 'Normal';
                const isEmri = plan.isEmri || plan.IsEmri || 'İş Emri';
                const makine = plan.hat || plan.Hat || plan.makine || plan.Makine || 'PRES-01';
                const saatAraligi = plan.saatAraligi || plan.SaatAraligi || '08:00 - 16:00';

                const ilerlemeYuzdesi = durum === 'Tamamlandı' ? 100 : (durum === 'Üretimde' ? 65 : 10);

                return (
                  <div className="schedule-row" key={plan.id || plan.Id || isEmri} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', borderBottom: '1px solid #EDF2F7', gap: '15px' }}>
                    <div style={{ width: '120px' }}>
                      <small style={{ color: '#718096', display: 'block', fontSize: '11px' }}>Saat aralığı</small>
                      <strong style={{ fontSize: '13px', color: '#2D3748' }}>{saatAraligi}</strong>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <strong style={{ fontSize: '14px', color: '#1A202C' }}>{isEmri}</strong>
                        <small style={{ color: '#718096' }}>Makine: <b>{makine}</b></small>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                        <div style={{ flex: 1, height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${ilerlemeYuzdesi}%`, height: '100%', backgroundColor: durum === 'Tamamlandı' ? '#38A169' : (durum === 'Üretimde' ? '#df0613' : '#CBD5E0'), transition: 'width 0.4s ease' }} />
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#718096' }}>%{ilerlemeYuzdesi}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <Badge tone={oncelik === 'Yüksek' ? 'danger' : (oncelik === 'Orta' ? 'warning' : 'info')}>
                        {oncelik}
                      </Badge> 
                      
                      <Badge 
                        tone={durum === 'Tamamlandı' ? 'success' : (durum === 'Üretimde' ? 'warning' : 'info')}
                        onClick={() => durumGuncelle(plan)}
                        title="Durumu değiştirmek için tıklayın"
                      >
                        {durum}
                      </Badge>
                    </div>

                    {canEdit(userRole) && (<div style={{ display: 'flex', gap: '6px' }}>
                      <button className="outline-button" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => setDuzenlenecekPlan(plan)}>Düzenle</button>
                      <button className="outline-button" style={{ padding: '4px 10px', fontSize: '12px', color: '#E53E3E', borderColor: '#FEB2B2' }} onClick={() => setSilinecekPlan(plan)}>Sil</button>
                    </div>)}
                  </div>
                );
              })
            )}
          </div>
        </Card>
        
        <Card title="Kaynak Uygunluğu">
          <ResourceList isApiActive={planlar.length > 0} gosterBildirim={gosterBildirim} userRole={userRole} />
        </Card>
      </div>

      {duzenlenecekPlan && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#FAFAFA', padding: '32px', borderRadius: '12px', width: '420px', border: '1px solid #E5E7EB', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#1A202C' }}>Üretim Planını Düzenle</h3>
            <form onSubmit={planGuncelleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', color: '#4A5568' }}>
                İş Emri Kodu
                <input type="text" value={duzenlenecekPlan.isEmri || duzenlenecekPlan.IsEmri || ''} onChange={e => setDuzenlenecekPlan({...duzenlenecekPlan, isEmri: e.target.value})} style={{ padding: '8px', border: '1px solid #CBD5E0', borderRadius: '6px' }} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', color: '#4A5568' }}>
                Makine
                <select value={duzenlenecekPlan.makine || duzenlenecekPlan.Makine || 'PRES-01'} onChange={e => setDuzenlenecekPlan({...duzenlenecekPlan, makine: e.target.value})} style={{ padding: '8px', border: '1px solid #CBD5E0', borderRadius: '6px', backgroundColor: '#FFF' }}>
                  <option value="PRES-01">PRES-01 (Ana Gövde)</option>
                  <option value="PRES-02">PRES-02 (Yan Panel)</option>
                  <option value="PRES-03">PRES-03 (Tavan Grubu)</option>
                  <option value="PRES-04">PRES-04 (Kapak Presi)</option>
                </select>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', color: '#4A5568' }}>
                Öncelik
                <select value={duzenlenecekPlan.oncelik || duzenlenecekPlan.Oncelik || 'Normal'} onChange={e => setDuzenlenecekPlan({...duzenlenecekPlan, oncelik: e.target.value})} style={{ padding: '8px', border: '1px solid #CBD5E0', borderRadius: '6px', backgroundColor: '#FFF' }}>
                  <option value="Düşük">Düşük</option>
                  <option value="Normal">Normal</option>
                  <option value="Orta">Orta</option>
                  <option value="Yüksek">Yüksek (Acil)</option>
                </select>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', color: '#4A5568' }}>
                Durum
                <select value={duzenlenecekPlan.durum || duzenlenecekPlan.Durum || 'Planlandı'} onChange={e => setDuzenlenecekPlan({...duzenlenecekPlan, durum: e.target.value})} style={{ padding: '8px', border: '1px solid #CBD5E0', borderRadius: '6px', backgroundColor: '#FFF' }}>
                  <option value="Planlandı">Planlandı</option>
                  <option value="Üretimde">Üretimde</option>
                  <option value="Tamamlandı">Tamamlandı</option>
                </select>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setDuzenlenecekPlan(null)} className="outline-button">İptal</button>
                <button type="submit" className="primary-button">Güncelle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {silinecekPlan && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#FAFAFA', padding: '24px', borderRadius: '12px', width: '380px', border: '1px solid #E5E7EB', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            <h3 style={{ marginTop: 0, color: '#E53E3E' }}>Planı Sil</h3>
            <p style={{ fontSize: '14px', color: '#4A5568' }}>
              <b>{silinecekPlan.isEmri || silinecekPlan.IsEmri}</b> kodlu üretim planını silmek istediğinize emin misiniz?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setSilinecekPlan(null)} className="outline-button">Vazgeç</button>
              <button onClick={planSil} className="primary-button" style={{ backgroundColor: '#E53E3E', borderColor: '#E53E3E' }}>Evet, Sil</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
