export const mockMakineVerileri = [
  { kod: 'PRES-01', durum: 'Çalışıyor', sicaklik: 45, oee: 85, hiz: 60, hedefVurus: 5000, vurusSayisi: 4250, operator: 'Ahmet Y.' },
  { kod: 'PRES-02', durum: 'Duruş', sicaklik: 38, oee: 45, hiz: 0, hedefVurus: 3000, vurusSayisi: 1200, operator: 'Mehmet K.' },
  { kod: 'PRES-03', durum: 'Çalışıyor', sicaklik: 52, oee: 92, hiz: 75, hedefVurus: 8000, vurusSayisi: 7800, operator: 'Ayşe D.' },
  { kod: 'PRES-04', durum: 'Bakım', sicaklik: 25, oee: 0, hiz: 0, hedefVurus: 0, vurusSayisi: 0, operator: 'Ali S.' }
];

export const mockUretimPlanlari = [
  { id: 1, isEmri: 'IE-1001', urun: 'Ana Gövde Sacı', hat: 'PRES-01', hedef: 5000, uretilen: 4250, durum: 'Üretimde', oncelik: 'Normal', saatAraligi: '08:00-16:00' },
  { id: 2, isEmri: 'IE-1002', urun: 'Yan Panel', hat: 'PRES-02', hedef: 3000, uretilen: 1200, durum: 'Duruşta', oncelik: 'Yüksek', saatAraligi: '08:00-16:00' },
  { id: 3, isEmri: 'IE-1003', urun: 'Destek Braketi', hat: 'PRES-03', hedef: 8000, uretilen: 7800, durum: 'Üretimde', oncelik: 'Normal', saatAraligi: '16:00-00:00' }
];

export const mockOeeKayitlari = [
  { id: 1, makineKod: 'PRES-01', kullanilabilirlik: 90, performans: 85, kalite: 98, genelOee: 75, tarih: new Date().toISOString() },
  { id: 2, makineKod: 'PRES-02', kullanilabilirlik: 60, performans: 50, kalite: 100, genelOee: 30, tarih: new Date().toISOString() },
  { id: 3, makineKod: 'PRES-03', kullanilabilirlik: 95, performans: 95, kalite: 99, genelOee: 89, tarih: new Date().toISOString() }
];

export const mockDurusKayitlari = [
  { id: 1, makineKod: 'PRES-02', neden: 'Malzeme Bekleme', sure: 45, durum: 'Açık', saat: '10:15', tarih: new Date().toISOString() },
  { id: 2, makineKod: 'PRES-04', neden: 'Periyodik Bakım', sure: 120, durum: 'Devam ediyor', saat: '08:00', tarih: new Date().toISOString() },
  { id: 3, makineKod: 'PRES-01', neden: 'Kalıp Ayarı', sure: 15, durum: 'Çözüldü', saat: '09:30', tarih: new Date().toISOString() }
];

export const mockKalipKayitlari = [
  { id: 1, kalipKodu: 'KLP-001', kalipAdi: 'Gövde Kalıbı', aktifMakine: 'PRES-01', parca: 'Ana Gövde Sacı', vurusSayaci: 145000, bakimLimiti: 150000 },
  { id: 2, kalipKodu: 'KLP-002', kalipAdi: 'Panel Kalıbı', aktifMakine: 'PRES-02', parca: 'Yan Panel', vurusSayaci: 80000, bakimLimiti: 100000 },
  { id: 3, kalipKodu: 'KLP-003', kalipAdi: 'Braket Kalıbı', aktifMakine: 'PRES-03', parca: 'Destek Braketi', vurusSayaci: 12000, bakimLimiti: 50000 }
];

export const mockDefektKayitlari = [
  { id: 1, defektTuru: 'Çizik', adet: 12, makineKod: 'PRES-01', oran: '%1.2', tarih: new Date().toISOString() },
  { id: 2, defektTuru: 'Çapak', adet: 5, makineKod: 'PRES-03', oran: '%0.1', tarih: new Date().toISOString() },
  { id: 3, defektTuru: 'Ezik', adet: 2, makineKod: 'PRES-02', oran: '%0.5', tarih: new Date().toISOString() }
];

export const mockKaliteOnaylari = [
  { id: 1, partiKodu: 'PRT-901', islemAdimi: 'İlk Numune', durum: 'Bekliyor', saat: '09:00', olcumDegeri: '0.00', notlar: 'Üretim başı numune onayı', tarih: new Date().toISOString() },
  { id: 2, partiKodu: 'PRT-902', islemAdimi: 'Ara Kontrol', durum: 'Onaylandı', saat: '11:30', olcumDegeri: '1.25', notlar: 'Tolerans dahilinde', tarih: new Date().toISOString() },
  { id: 3, partiKodu: 'PRT-903', islemAdimi: 'Son Kontrol', durum: 'Reddedildi', saat: '14:45', olcumDegeri: '1.45', notlar: 'Kalınlık sınır dışı', tarih: new Date().toISOString() }
];

export const mockGorevKayitlari = [
  { id: 1, baslik: 'PRES-02 Malzeme İkmali', atanan: 'Ahmet Y.', durum: 'Bekliyor', oncelik: 'Yüksek', bitisTarihi: new Date().toISOString() },
  { id: 2, baslik: 'KLP-001 Yağlama Bakımı', atanan: 'Bakım Ekibi', durum: 'Devam Ediyor', oncelik: 'Kritik', bitisTarihi: new Date().toISOString() },
  { id: 3, baslik: 'PRT-901 Kalite Onayı', atanan: 'Ayşe D.', durum: 'Bekliyor', oncelik: 'Normal', bitisTarihi: new Date().toISOString() }
];

export const mockTrendVerileri = [
  { saat: '08:00', uretim: 1200 },
  { saat: '09:00', uretim: 2500 },
  { saat: '10:00', uretim: 4000 },
  { saat: '11:00', uretim: 5100 },
  { saat: '12:00', uretim: 5800 },
  { saat: '13:00', uretim: 7200 },
  { saat: '14:00', uretim: 8900 }
];

export const mockOeeDagilimi = [
  { name: 'Kullanılabilirlik', value: 85 },
  { name: 'Performans', value: 92 },
  { name: 'Kalite', value: 98 }
];
