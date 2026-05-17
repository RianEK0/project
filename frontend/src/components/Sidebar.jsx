import { useContext, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { Building2, CheckSquare, Home, MapPinned, ScrollText, UserRound, Users } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  const items = useMemo(() => {
    const menu = [
      { to: '/', icon: <Home size={18} />, label: 'Dashboard' },
      { to: '/attendance', icon: <CheckSquare size={18} />, label: 'Absensi' },
      { to: '/profile', icon: <UserRound size={18} />, label: 'Profil' },
    ];

    if (user?.roleName === 'Super Admin' || user?.roleName === 'Admin Direktorat') {
      menu.push({ to: '/employees', icon: <Users size={18} />, label: 'Pegawai' });
      menu.push({ to: '/projects', icon: <ScrollText size={18} />, label: 'Proyek' });
    }

    if (user?.roleName !== 'Pegawai') {
      menu.push({ to: '/map', icon: <MapPinned size={18} />, label: 'Peta Lokasi' });
    }

    return menu;
  }, [user]);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-icon"><Building2 size={20} /></div>
        <div>
          <div>Komdigi HRIS</div>
          <small>{user?.divisi?.name || 'Sistem Manajemen Pegawai'}</small>
        </div>
      </div>

      <div className="sidebar-nav">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end={item.to === '/'}>
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="eyebrow">Tema Direktorat</div>
        <strong>{user?.direktorat?.name || 'Komdigi'}</strong>
      </div>
    </aside>
  );
};

export default Sidebar;
