import { useContext } from 'react';
import { LogOut } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { getFullImageUrl } from '../utils/formatters';

const Topbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="topbar">
      <div>
        <div className="eyebrow">Role aktif</div>
        <strong>{user?.role?.name || user?.role}</strong>
      </div>

      <div className="topbar-profile">
        <img
          src={getFullImageUrl(user?.photo) || 'https://ui-avatars.com/api/?name=Komdigi&background=0f172a&color=fff'}
          alt={user?.name}
          className="avatar-sm"
        />
        <div>
          <div className="topbar-name">{user?.name}</div>
          <div className="muted-text">{user?.direktorat?.name}</div>
        </div>
        <button onClick={logout} className="ghost-btn danger">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
