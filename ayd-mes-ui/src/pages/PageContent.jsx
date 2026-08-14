import Dashboard from './Dashboard';
import Production from './Production';
import Machines from './Machines';
import Analytics from './Analytics';
import Stops from './Stops';
import Molds from './Molds';
import Quality from './Quality';
import FactoryMap from './FactoryMap';
import { rolePermissions } from '../utils/permissions';

export default function PageContent({ page, userRole = 'Yazılım Stajyeri', ayarlar, gosterBildirim, setPage, isBackendOnline, tarihFiltresi }) {
  const allowed = rolePermissions[userRole] || rolePermissions['Yazılım Stajyeri'];

  if (!allowed.includes(page)) {
    return (
      <div className="panel" style={{ padding: '40px', textAlign: 'center', margin: '20px 0' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>Erişim Kısıtlandı (Yetkisiz Sayfa)</h2>
        <p style={{ color: '#718096', fontSize: '14px', maxWidth: '480px', margin: '0 auto 24px auto', lineHeight: '1.6' }}>
          Mevcut rolünüz olan <strong style={{ color: '#E53E3E' }}>{userRole}</strong> bu sayfaya erişim yetkisine sahip değildir.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button className="primary-button" onClick={() => setPage(allowed[0])}>
            İzin Verilen Ana Sayfama Dön →
          </button>
        </div>
      </div>
    );
  }

  if (page === 'map') return <FactoryMap ayarlar={ayarlar} setPage={setPage} gosterBildirim={gosterBildirim} />;
  if (page === 'production') return <Production ayarlar={ayarlar} gosterBildirim={gosterBildirim} />;
  if (page === 'machines') return <Machines ayarlar={ayarlar} />;
  if (page === 'analytics') return <Analytics ayarlar={ayarlar} gosterBildirim={gosterBildirim} tarihFiltresi={tarihFiltresi} />;
  if (page === 'stops') return <Stops ayarlar={ayarlar} gosterBildirim={gosterBildirim} tarihFiltresi={tarihFiltresi} />;
  if (page === 'molds') return <Molds ayarlar={ayarlar} gosterBildirim={gosterBildirim} />;
  if (page === 'quality') return <Quality ayarlar={ayarlar} gosterBildirim={gosterBildirim} tarihFiltresi={tarihFiltresi} />;
  return <Dashboard ayarlar={ayarlar} gosterBildirim={gosterBildirim} setPage={setPage} isBackendOnline={isBackendOnline} tarihFiltresi={tarihFiltresi} />;
}
