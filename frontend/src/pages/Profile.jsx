import { useContext, useEffect, useState } from 'react';
import { Camera, Save, ScanFace } from 'lucide-react';
import api from '../utils/api';
import { AuthContext } from '../contexts/AuthContext';
import ProfileSummary from '../components/ProfileSummary';
import SectionHeader from '../components/SectionHeader';

const Profile = () => {
  const { user, refreshUser } = useContext(AuthContext);
  const [form, setForm] = useState({ name: '', position: '', password: '' });
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        position: user.position || '',
        password: '',
      });
    }
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = new FormData();
      payload.append('name', form.name);
      payload.append('position', form.position);
      if (form.password) payload.append('password', form.password);
      if (photo) payload.append('photo', photo);

      await api.put('/users/me/profile', payload);
      await refreshUser();
      alert('Profil berhasil diperbarui.');
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal memperbarui profil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <SectionHeader
        title="Profil Pegawai"
        subtitle="Kelola data pribadi, foto profil, dan status biometrik wajah."
      />

      <div className="grid grid-2 layout-top">
        <ProfileSummary user={user} />

        <div className="card">
          <div className="card-header">
            <div>
              <h3>Keamanan Akun</h3>
              <p className="muted-text">Pastikan foto profil jelas agar proses verifikasi wajah lebih stabil.</p>
            </div>
          </div>
          <div className="stack-list">
            <div className="inline-note">
              <ScanFace size={18} />
              <span>{user?.faceEnrolledAt ? 'Biometrik wajah sudah terdaftar.' : 'Biometrik wajah belum terdaftar.'}</span>
            </div>
            <div className="inline-note">
              <Camera size={18} />
              <span>Gunakan halaman absensi untuk melakukan enrollment wajah dari kamera.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h3>Ubah Profil</h3>
            <p className="muted-text">Perubahan akan langsung memengaruhi data login dan identitas pegawai.</p>
          </div>
        </div>

        <form className="grid grid-2" onSubmit={handleSubmit}>
          <div>
            <label>Nama Lengkap</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label>Jabatan</label>
            <input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} required />
          </div>
          <div>
            <label>Password Baru</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Kosongkan jika tidak diubah"
            />
          </div>
          <div>
            <label>Foto Profil</label>
            <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
          </div>
          <div>
            <button type="submit" className="btn" disabled={saving}>
              <Save size={16} />
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
