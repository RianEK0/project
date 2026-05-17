import { Building2, BriefcaseBusiness, ShieldCheck } from 'lucide-react';
import { getFullImageUrl } from '../utils/formatters';

const ProfileSummary = ({ user }) => {
  return (
    <div className="card profile-summary">
      <div className="profile-hero">
        <img
          src={getFullImageUrl(user?.photo) || 'https://ui-avatars.com/api/?name=Komdigi&background=0f172a&color=fff'}
          alt={user?.name}
          className="avatar-xl"
        />
        <div>
          <h3>{user?.name}</h3>
          <p className="muted-text">{user?.email}</p>
        </div>
      </div>

      <div className="info-grid">
        <div className="info-card">
          <BriefcaseBusiness size={18} />
          <div>
            <div className="eyebrow">Jabatan</div>
            <strong>{user?.position || '-'}</strong>
          </div>
        </div>
        <div className="info-card">
          <ShieldCheck size={18} />
          <div>
            <div className="eyebrow">Role</div>
            <strong>{user?.role?.name || user?.role || '-'}</strong>
          </div>
        </div>
        <div className="info-card">
          <Building2 size={18} />
          <div>
            <div className="eyebrow">Organisasi</div>
            <strong>{user?.direktorat?.name || '-'} / {user?.divisi?.name || '-'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSummary;
