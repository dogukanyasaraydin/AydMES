import { useState } from 'react';

export default function DateRangePicker({ onFilterChange, ayarlar }) {
  const bugunStr = new Date().toISOString().split('T')[0];
  const [baslangic, setBaslangic] = useState('');
  const [bitis, setBitis] = useState('');
  const [seciliPreset, setSeciliPreset] = useState('Tüm Zamanlar');

  const presetUygula = (preset) => {
    setSeciliPreset(preset);
    const d = new Date();
    
    if (preset === 'Bugün') {
      const today = d.toISOString().split('T')[0];
      setBaslangic(today);
      setBitis(today);
      onFilterChange({ baslangic: today, bitis: today, preset });
    } else if (preset === 'Son 7 Gün') {
      const end = d.toISOString().split('T')[0];
      d.setDate(d.getDate() - 7);
      const start = d.toISOString().split('T')[0];
      setBaslangic(start);
      setBitis(end);
      onFilterChange({ baslangic: start, bitis: end, preset });
    } else if (preset === 'Bu Ay') {
      const firstDay = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
      const today = d.toISOString().split('T')[0];
      setBaslangic(firstDay);
      setBitis(today);
      onFilterChange({ baslangic: firstDay, bitis: today, preset });
    } else {
      setBaslangic('');
      setBitis('');
      onFilterChange({ baslangic: '', bitis: '', preset: 'Tüm Zamanlar' });
    }
  };

  const handleCustomChange = (newStart, newEnd) => {
    setSeciliPreset('Özel');
    onFilterChange({ baslangic: newStart, bitis: newEnd, preset: 'Özel' });
  };

  const isDark = ayarlar?.tema === 'dark';

  return (
    <div style={{ 
      display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', padding: '12px 16px', 
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderRadius: '10px', 
      border: `1px solid ${isDark ? '#374151' : '#E2E8F0'}`, marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold', color: isDark ? '#F9FAFB' : '#2D3748' }}>
        <span>📅</span>
        <span>Tarih Aralığı:</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <input 
          type="date" 
          value={baslangic} 
          max={bitis || bugunStr}
          onChange={(e) => {
            const val = e.target.value;
            setBaslangic(val);
            handleCustomChange(val, bitis);
          }}
          style={{ 
            padding: '6px 10px', borderRadius: '6px', border: `1px solid ${isDark ? '#4A5568' : '#CBD5E0'}`,
            backgroundColor: isDark ? '#111827' : '#F7FAFC', color: isDark ? '#F9FAFB' : '#2D3748',
            fontSize: '12px', outline: 'none'
          }}
        />
        <span style={{ color: '#A0AEC0', fontSize: '12px' }}>—</span>
        <input 
          type="date" 
          value={bitis} 
          min={baslangic}
          onChange={(e) => {
            const val = e.target.value;
            setBitis(val);
            handleCustomChange(baslangic, val);
          }}
          style={{ 
            padding: '6px 10px', borderRadius: '6px', border: `1px solid ${isDark ? '#4A5568' : '#CBD5E0'}`,
            backgroundColor: isDark ? '#111827' : '#F7FAFC', color: isDark ? '#F9FAFB' : '#2D3748',
            fontSize: '12px', outline: 'none'
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
        {['Bugün', 'Son 7 Gün', 'Bu Ay', 'Tüm Zamanlar'].map((preset) => (
          <button 
            key={preset}
            type="button"
            onClick={() => presetUygula(preset)}
            style={{ 
              padding: '6px 12px', borderRadius: '6px', border: 'none', fontSize: '11px', fontWeight: 'bold',
              cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: seciliPreset === preset ? '#d40511' : (isDark ? '#374151' : '#EDF2F7'),
              color: seciliPreset === preset ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#4A5568')
            }}
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
}
