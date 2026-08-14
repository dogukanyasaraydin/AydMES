import { useState, useEffect, useMemo } from 'react';
import { mockMakineVerileri } from '../utils/mockData';

export default function FactoryMap({ ayarlar, setPage, gosterBildirim }) {
  const [makineler, setMakineler] = useState([]);
  const [secilenMakine, setSecilenMakine] = useState(null);
  const [viewMode, setViewMode] = useState('3D'); // '2D' veya '3D'
  const [isZoomed, setIsZoomed] = useState(false);

  // Canlı telemetri verilerini C# Web API'den çek
  useEffect(() => {
    let isMounted = true;
    const fetchTelemetri = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:7193/api";
        const res = await fetch(`${apiUrl}/MakineVerileri`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setMakineler(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Harita telemetri hatası (Offline Moda Geçiliyor):", err);
        setMakineler(mockMakineVerileri);
      }
    };

    fetchTelemetri();
    const interval = setInterval(fetchTelemetri, ayarlar?.yenilemeHizi || 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [ayarlar?.yenilemeHizi]);

  // Varsayılan 4 Pres Makinesinin Mimari Konumları ve Teknik Özellikleri
  const haritaMakineleri = useMemo(() => {
    const baseCoords = [
      { kod: 'PRES-01', aciklama: 'Ana Gövde Pres Hattı', x: 20, y: 35, bolge: 'Pres Sahası — Hat 1', tonaj: '800 T', oee: 92 },
      { kod: 'PRES-02', aciklama: 'Yan Panel Pres Hattı', x: 44, y: 35, bolge: 'Pres Sahası — Hat 1', tonaj: '600 T', oee: 88 },
      { kod: 'PRES-03', aciklama: 'Kapak Şekillendirme Presi', x: 68, y: 35, bolge: 'Pres Sahası — Hat 2', tonaj: '500 T', oee: 95 },
      { kod: 'PRES-04', aciklama: 'Şase Kaynak ve Pres Hattı', x: 92, y: 35, bolge: 'Pres Sahası — Hat 2', tonaj: '1000 T', oee: 76 },
    ];

    return baseCoords.map(base => {
      const live = makineler.find(m => (m.kod || m.Kod) === base.kod) || {};
      const durum = live.durum || live.Durum || 'Planlı duruş';
      const vurusSayisi = live.vurusSayisi !== undefined ? live.vurusSayisi : (live.VurusSayisi || 0);
      const hedefVurus = live.hedefVurus !== undefined ? live.hedefVurus : (live.HedefVurus || 0);
      const sicaklik = live.sicaklik !== undefined ? live.sicaklik : (live.Sicaklik || 0);
      const basinc = live.basinc || live.Basinc || '0 Bar';
      const yagSeviyesi = live.yagSeviyesi || live.YagSeviyesi || '%0';
      const fireOrani = live.fireOrani !== undefined ? live.fireOrani : (live.FireOrani || 0);
      const hataliAdet = live.hataliAdet !== undefined ? live.hataliAdet : (live.HataliAdet || 0);

      return {
        ...base,
        id: live.id || live.Id || base.kod,
        durum,
        vurusSayisi,
        hedefVurus,
        sicaklik,
        basinc,
        yagSeviyesi,
        fireOrani,
        hataliAdet
      };
    });
  }, [makineler]);

  const makineyeYakinlas = (m) => {
    setSecilenMakine(m);
    setIsZoomed(true);
    if (gosterBildirim) gosterBildirim(`${m.kod} makinesine odaklanıldı.`, 'info');
  };

  const kamerayiSifirla = () => {
    setIsZoomed(false);
    setSecilenMakine(null);
  };

  const isDark = ayarlar?.tema === 'dark';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif" }}>
      {/* ULTRA-MODERN ENDÜSTRİYEL KONTROL BARI */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
        padding: '20px 28px', backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderRadius: '16px',
        border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`, boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            backgroundColor: '#df0613', color: '#FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', fontWeight: '900', letterSpacing: '-1px'
          }}>
            A
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: isDark ? '#F8FAFC' : '#0F172A', letterSpacing: '-0.3px' }}>
                AYD MES PRES FABRİKASI DİJİTAL İKİZ KROKİSİ
              </h2>
              <span style={{ padding: '2px 8px', borderRadius: '6px', backgroundColor: isDark ? '#334155' : '#F1F5F9', color: isDark ? '#94A3B8' : '#475569', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>
                LIVE CAD VIEW
              </span>
            </div>
            <small style={{ color: '#64748B', fontSize: '13px' }}>
              Fabrika mimari yerleşimi, makine durumları ve canlı telemetri takibi.
            </small>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', backgroundColor: isDark ? '#0F172A' : '#F1F5F9', padding: '3px', borderRadius: '8px', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }}>
            <button
              onClick={() => setViewMode('2D')}
              style={{
                padding: '7px 16px', borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                backgroundColor: viewMode === '2D' ? '#df0613' : 'transparent',
                color: viewMode === '2D' ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748B'),
                transition: 'all 0.2s ease'
              }}
            >
              2D KUŞ BAKIŞI
            </button>
            <button
              onClick={() => setViewMode('3D')}
              style={{
                padding: '7px 16px', borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                backgroundColor: viewMode === '3D' ? '#df0613' : 'transparent',
                color: viewMode === '3D' ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748B'),
                transition: 'all 0.2s ease'
              }}
            >
              3D İZOMETRİK
            </button>
          </div>

          {isZoomed && (
            <button
              onClick={kamerayiSifirla}
              style={{
                padding: '8px 16px', borderRadius: '8px', backgroundColor: '#334155', color: 'white', border: 'none',
                fontSize: '12px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.3px'
              }}
            >
              🔍 ODAĞI SIFIRLA
            </button>
          )}
        </div>
      </div>

      {/* FABRİKA KAT MİMARİ HARİTASI VE SAĞ DETAY HUD PANELİ */}
      <div style={{ display: 'grid', gridTemplateColumns: secilenMakine ? 'minmax(0, 1.8fr) minmax(0, 1.1fr)' : '1fr', gap: '20px', transition: 'all 0.4s ease' }}>
        
        {/* MİMARİ SAHA KANVASI */}
        <div style={{
          position: 'relative', height: '600px', borderRadius: '20px', overflow: 'hidden',
          backgroundColor: isDark ? '#0B0F19' : '#0F172A',
          border: `1px solid ${isDark ? '#1E293B' : '#334155'}`,
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          perspective: '1200px'
        }}>
          {/* HASSAS VE İNCE ARCHITECTURAL CAD GRID */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px', pointerEvents: 'none'
          }} />

          {/* ÜST MİMARİ BAŞLIK VE LEJAND */}
          <div style={{ position: 'absolute', top: '20px', left: '24px', color: '#64748B', fontSize: '11px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            AYD MES — PRES FABRİKASI A-1 SAHASI
          </div>

          <div style={{ position: 'absolute', bottom: '20px', left: '24px', display: 'flex', gap: '24px', fontSize: '12px', color: '#94A3B8', fontWeight: '600' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 10px #10B981' }} />
              Çalışıyor
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#64748B' }} />
              Planlı Duruş
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B', boxShadow: '0 0 10px #F59E0B' }} />
              Bakımda
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444', boxShadow: '0 0 10px #EF4444' }} />
              Arıza
            </span>
          </div>

          {/* DİJİTAL TAŞIYICI HAT ÇİZGİLERİ */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <line x1="10%" y1="35%" x2="90%" y2="35%" stroke="rgba(255,255,255,0.08)" strokeWidth="4" strokeDasharray="8 6" />
            <line x1="20%" y1="35%" x2="20%" y2="75%" stroke="rgba(255,255,255,0.08)" strokeWidth="4" strokeDasharray="6 6" />
            <line x1="68%" y1="35%" x2="68%" y2="75%" stroke="rgba(255,255,255,0.08)" strokeWidth="4" strokeDasharray="6 6" />
          </svg>

          {/* DİJİTAL SAHA BÖLGELERİ */}
          <div style={{ position: 'absolute', top: '72%', left: '8%', width: '38%', height: '18%', border: '1px dashed rgba(255, 255, 255, 0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '11px', fontWeight: '700', letterSpacing: '1px' }}>
            SAC HAMMADDE STOK ALANI
          </div>
          <div style={{ position: 'absolute', top: '72%', left: '54%', width: '38%', height: '18%', border: '1px dashed rgba(255, 255, 255, 0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '11px', fontWeight: '700', letterSpacing: '1px' }}>
            KALİTE KONTROL VE KALIPHANE ATÖLYESİ
          </div>

          {/* HARİTA MAKİNE CONTAINER (ZOOM & 3D İZOMETRİK DÖNÜŞÜM) */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: isZoomed && secilenMakine
              ? `scale(1.75) translate(${(50 - secilenMakine.x) * 0.4}%, ${(40 - secilenMakine.y) * 0.4}%) ${viewMode === '3D' ? 'rotateX(38deg) rotateZ(-12deg)' : ''}`
              : (viewMode === '3D' ? 'rotateX(50deg) rotateZ(-22deg) scale(0.9) translateY(-40px)' : 'none')
          }}>
            
            {/* MODERN KURUMSAL MAKİNE BLOKLARI */}
            {haritaMakineleri.map((m) => {
              const isSelected = secilenMakine?.kod === m.kod;
              const isCalisiyor = m.durum === 'Çalışıyor';
              const isAriza = m.durum === 'Arıza';
              const isBakim = m.durum === 'Bakımda';

              const statusColor = isCalisiyor ? '#10B981' : (isAriza ? '#EF4444' : (isBakim ? '#F59E0B' : '#64748B'));

              return (
                <div
                  key={m.kod}
                  onClick={() => makineyeYakinlas(m)}
                  style={{
                    position: 'absolute', top: `${m.y}%`, left: `${m.x}%`,
                    width: '150px', height: '155px', marginLeft: '-75px', marginTop: '-77px',
                    cursor: 'pointer', zIndex: isSelected ? 50 : 10,
                    transition: 'all 0.3s ease',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  {/* MODEREN PREMİUM CAM VE METAL BLOK KUTUSU */}
                  <div style={{
                    position: 'relative', width: '100%', height: '100%',
                    backgroundColor: '#1E293B',
                    borderRadius: '14px', border: `1.5px solid ${isSelected ? '#df0613' : 'rgba(255,255,255,0.1)'}`,
                    boxShadow: isSelected 
                      ? '0 0 25px rgba(223,6,19,0.5), 0 10px 25px rgba(0,0,0,0.6)'
                      : (isCalisiyor ? '0 0 15px rgba(16,185,129,0.25), 0 8px 20px rgba(0,0,0,0.4)' : '0 8px 20px rgba(0,0,0,0.4)'),
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '14px',
                    color: '#FFF'
                  }}>
                    {/* DÜĞÜM BAŞLIK & DURUM ROZETİ */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: statusColor, boxShadow: `0 0 8px ${statusColor}` }} />
                        <strong style={{ fontSize: '14px', fontWeight: '800', color: '#F8FAFC', letterSpacing: '0.5px' }}>{m.kod}</strong>
                      </div>
                      <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '700' }}>{m.tonaj}</span>
                    </div>

                    {/* DÜZÜN GÖSTERGE SİMGE VE DURUM METNİ */}
                    <div style={{ margin: '8px 0', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: statusColor, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {m.durum}
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: '900', color: '#F8FAFC', marginTop: '4px', letterSpacing: '-0.5px' }}>
                        {m.vurusSayisi.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#94A3B8' }}>vuruş</span>
                      </div>
                    </div>

                    {/* ANLIK SICAKLIK & BASINÇ ŞERİDİ */}
                    <div style={{
                      backgroundColor: 'rgba(15, 23, 42, 0.7)', padding: '6px 8px', borderRadius: '6px',
                      fontSize: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: '700',
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}>
                      <span style={{ color: '#94A3B8' }}>Basınç: <strong style={{ color: '#F8FAFC' }}>{m.basinc}</strong></span>
                      <span style={{ color: m.sicaklik >= 50 ? '#EF4444' : '#38BDF8' }}>{m.sicaklik}°C</span>
                    </div>
                  </div>

                  {/* 3D ZEMİN GÖLGESİ */}
                  {viewMode === '3D' && (
                    <div style={{
                      position: 'absolute', top: '100%', left: '10px', width: '130px', height: '25px',
                      backgroundColor: 'rgba(0,0,0,0.5)', filter: 'blur(8px)', borderRadius: '50%',
                      transform: 'rotateX(90deg)', pointerEvents: 'none'
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SAĞ TELEMETRİ DETAY EXECUTIVE PANELİ */}
        {secilenMakine && (
          <div style={{
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderRadius: '16px', padding: '24px',
            border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`, boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    CANLI TELEMETRİ ODAĞI
                  </span>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: '800', color: isDark ? '#F8FAFC' : '#0F172A' }}>
                    {secilenMakine.kod}
                  </h3>
                  <small style={{ color: '#64748B' }}>{secilenMakine.aciklama} • {secilenMakine.bolge}</small>
                </div>
                <button onClick={kamerayiSifirla} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94A3B8' }}>&times;</button>
              </div>

              {/* TELEMETRİ KARTLARI */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div style={{ padding: '14px', backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderRadius: '10px', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }}>
                  <small style={{ color: '#64748B', fontSize: '11px', fontWeight: '800', display: 'block', letterSpacing: '0.5px' }}>ANLIK DURUM</small>
                  <strong style={{ fontSize: '15px', color: secilenMakine.durum === 'Çalışıyor' ? '#10B981' : '#EF4444', textTransform: 'uppercase' }}>
                    {secilenMakine.durum}
                  </strong>
                </div>

                <div style={{ padding: '14px', backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderRadius: '10px', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }}>
                  <small style={{ color: '#64748B', fontSize: '11px', fontWeight: '800', display: 'block', letterSpacing: '0.5px' }}>TOPLAM VURUŞ</small>
                  <strong style={{ fontSize: '18px', color: '#3182CE' }}>{secilenMakine.vurusSayisi.toLocaleString()}</strong>
                </div>

                <div style={{ padding: '14px', backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderRadius: '10px', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }}>
                  <small style={{ color: '#64748B', fontSize: '11px', fontWeight: '800', display: 'block', letterSpacing: '0.5px' }}>SICAKLIK</small>
                  <strong style={{ fontSize: '16px', color: secilenMakine.sicaklik >= 50 ? '#EF4444' : 'inherit' }}>
                    {secilenMakine.sicaklik}°C
                  </strong>
                </div>

                <div style={{ padding: '14px', backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderRadius: '10px', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }}>
                  <small style={{ color: '#64748B', fontSize: '11px', fontWeight: '800', display: 'block', letterSpacing: '0.5px' }}>BASINÇ</small>
                  <strong style={{ fontSize: '16px' }}>{secilenMakine.basinc}</strong>
                </div>

                <div style={{ padding: '14px', backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderRadius: '12px', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }}>
                  <small style={{ color: '#64748B', fontSize: '11px', fontWeight: '800', display: 'block', letterSpacing: '0.5px' }}>YAĞ SEVİYESİ</small>
                  <strong style={{ fontSize: '16px' }}>{secilenMakine.yagSeviyesi}</strong>
                </div>

                <div style={{ padding: '14px', backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderRadius: '12px', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }}>
                  <small style={{ color: '#64748B', fontSize: '11px', fontWeight: '800', display: 'block', letterSpacing: '0.5px' }}>FİRE / HURDA</small>
                  <strong style={{ fontSize: '15px', color: secilenMakine.fireOrani > 0 ? '#EF4444' : '#10B981' }}>
                    {secilenMakine.hataliAdet} Adet (%{secilenMakine.fireOrani})
                  </strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => setPage('machines')}
              style={{
                width: '100%', padding: '12px', backgroundColor: '#df0613', color: 'white', border: 'none',
                borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px',
                boxShadow: '0 4px 12px rgba(223,6,19,0.25)', transition: 'all 0.2s ease'
              }}
            >
              Pres Makineleri Ekranına Git →
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
