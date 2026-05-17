import { useContext, useEffect, useMemo, useState } from 'react';
import { Eye, Pencil, Search, Trash2, UserPlus } from 'lucide-react';
import api from '../utils/api';
import SectionHeader from '../components/SectionHeader';
import { AuthContext } from '../contexts/AuthContext';
import { formatDateTime, getFullImageUrl } from '../utils/formatters';

const initialForm = {
  name: '',
  email: '',
  password: '',
  position: '',
  roleId: '',
  direktoratId: '',
  divisiId: '',
};

const Employees = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [direktorats, setDirektorats] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDirektoratId, setSelectedDirektoratId] = useState('');
  const [selectedDivisiId, setSelectedDivisiId] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [photoFile, setPhotoFile] = useState(null);

  const fetchUsers = async () => {
    const params = {};
    if (search) params.search = search;
    if (selectedDirektoratId) params.direktoratId = selectedDirektoratId;
    if (selectedDivisiId) params.divisiId = selectedDivisiId;
    const res = await api.get('/users', { params });
    setUsers(res.data);
  };

  const fetchReference = async () => {
    const [roleRes, dirRes] = await Promise.all([
      api.get('/org/roles'),
      api.get('/org/direktorats'),
    ]);
    setRoles(roleRes.data);
    setDirektorats(dirRes.data);
  };

  useEffect(() => {
    fetchReference();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [search, selectedDirektoratId, selectedDivisiId]);

  const currentDirektorat = useMemo(() => {
    return direktorats.find((item) => item.id === Number(formData.direktoratId));
  }, [direktorats, formData.direktoratId]);

  const currentFilterDirektorat = useMemo(() => {
    return direktorats.find((item) => item.id === Number(selectedDirektoratId));
  }, [direktorats, selectedDirektoratId]);

  const openCreateForm = () => {
    setEditingId(null);
    setPhotoFile(null);
    setFormData({
      ...initialForm,
      direktoratId: user?.roleName === 'Admin Direktorat' ? String(user?.direktoratId || user?.direktorat?.id) : '',
    });
    setShowForm(true);
  };

  const openEditForm = (employee) => {
    setEditingId(employee.id);
    setPhotoFile(null);
    setFormData({
      name: employee.name,
      email: employee.email,
      password: '',
      position: employee.position,
      roleId: String(employee.roleId || employee.role?.id),
      direktoratId: String(employee.direktoratId || employee.direktorat?.id),
      divisiId: String(employee.divisiId || employee.divisi?.id),
    });
    setShowForm(true);
  };

  const openDetail = async (employeeId) => {
    const res = await api.get(`/users/${employeeId}`);
    setSelectedEmployee(res.data);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus data pegawai ini?')) return;
    await api.delete(`/users/${id}`);
    fetchUsers();
    if (selectedEmployee?.id === id) setSelectedEmployee(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (value) payload.append(key, value);
    });

    if (photoFile) {
      payload.append('photo', photoFile);
    }

    if (editingId) {
      await api.put(`/users/${editingId}`, payload);
    } else {
      await api.post('/users', payload);
    }

    setShowForm(false);
    setEditingId(null);
    setFormData(initialForm);
    fetchUsers();
  };

  return (
    <div>
      <SectionHeader
        title="Manajemen Pegawai"
        subtitle="Kelola profil pegawai, pencarian cepat, struktur organisasi, dan akses per role."
        actions={
          user?.roleName !== 'Pegawai' ? (
            <button className="btn" onClick={openCreateForm}>
              <UserPlus size={16} />
              Tambah Pegawai
            </button>
          ) : null
        }
      />

      <div className="card filter-card">
        <div className="grid grid-4">
          <div>
            <label>Pencarian</label>
            <div className="search-box">
              <Search size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, email, jabatan"
              />
            </div>
          </div>
          <div>
            <label>Direktorat</label>
            <select value={selectedDirektoratId} onChange={(e) => { setSelectedDirektoratId(e.target.value); setSelectedDivisiId(''); }}>
              <option value="">Semua Direktorat</option>
              {direktorats.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Divisi</label>
            <select value={selectedDivisiId} onChange={(e) => setSelectedDivisiId(e.target.value)}>
              <option value="">Semua Divisi</option>
              {(currentFilterDirektorat?.divisis || []).map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>
          <div className="filter-summary">
            <div className="eyebrow">Total hasil</div>
            <strong>{users.length} pegawai</strong>
          </div>
        </div>
      </div>

      {showForm ? (
        <div className="card">
          <div className="card-header">
            <div>
              <h3>{editingId ? 'Edit Pegawai' : 'Tambah Pegawai Baru'}</h3>
              <p className="muted-text">Semua user harus terhubung ke 1 direktorat dan 1 divisi.</p>
            </div>
          </div>

          <form className="grid grid-2" onSubmit={handleSubmit}>
            <div>
              <label>Nama Lengkap</label>
              <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div>
              <label>Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div>
              <label>Password {editingId ? '(Opsional)' : ''}</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingId}
              />
            </div>
            <div>
              <label>Jabatan</label>
              <input value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} required />
            </div>
            <div>
              <label>Role</label>
              <select value={formData.roleId} onChange={(e) => setFormData({ ...formData, roleId: e.target.value })} required>
                <option value="">Pilih Role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Direktorat</label>
              <select
                value={formData.direktoratId}
                onChange={(e) => setFormData({ ...formData, direktoratId: e.target.value, divisiId: '' })}
                required
                disabled={user?.roleName === 'Admin Direktorat'}
              >
                <option value="">Pilih Direktorat</option>
                {direktorats.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Divisi</label>
              <select value={formData.divisiId} onChange={(e) => setFormData({ ...formData, divisiId: e.target.value })} required>
                <option value="">Pilih Divisi</option>
                {(currentDirektorat?.divisis || []).map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Foto Profil</label>
              <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn">{editingId ? 'Simpan Perubahan' : 'Simpan Pegawai'}</button>
              <button type="button" className="ghost-btn" onClick={() => setShowForm(false)}>Batal</button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="employee-layout">
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Jabatan</th>
                  <th>Direktorat</th>
                  <th>Divisi</th>
                  <th>Role</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.length ? (
                  users.map((employee) => (
                    <tr key={employee.id}>
                      <td>
                        <div className="table-person">
                          <img
                            src={getFullImageUrl(employee.photo) || 'https://ui-avatars.com/api/?name=Komdigi&background=0f172a&color=fff'}
                            alt={employee.name}
                            className="avatar-sm"
                          />
                          <div>
                            <strong>{employee.name}</strong>
                            <div className="muted-text">{employee.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{employee.position}</td>
                      <td>{employee.direktorat?.name}</td>
                      <td>{employee.divisi?.name}</td>
                      <td>{employee.role?.name}</td>
                      <td>
                        <div className="table-actions">
                          <button className="ghost-btn" onClick={() => openDetail(employee.id)}><Eye size={16} /></button>
                          {user?.roleName !== 'Pegawai' ? (
                            <>
                              <button className="ghost-btn" onClick={() => openEditForm(employee)}><Pencil size={16} /></button>
                              <button className="ghost-btn danger" onClick={() => handleDelete(employee.id)}><Trash2 size={16} /></button>
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">
                      <div className="empty-state compact">Data pegawai belum tersedia.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3>Detail Pegawai</h3>
              <p className="muted-text">Klik ikon lihat untuk membuka detail lengkap dan riwayat absensi terakhir.</p>
            </div>
          </div>

          {selectedEmployee ? (
            <div className="detail-panel">
              <div className="profile-hero">
                <img
                  src={getFullImageUrl(selectedEmployee.photo) || 'https://ui-avatars.com/api/?name=Komdigi&background=0f172a&color=fff'}
                  alt={selectedEmployee.name}
                  className="avatar-xl"
                />
                <div>
                  <h3>{selectedEmployee.name}</h3>
                  <p className="muted-text">{selectedEmployee.email}</p>
                </div>
              </div>

              <div className="stack-list">
                <div><strong>Jabatan:</strong> {selectedEmployee.position}</div>
                <div><strong>Role:</strong> {selectedEmployee.role?.name}</div>
                <div><strong>Direktorat:</strong> {selectedEmployee.direktorat?.name}</div>
                <div><strong>Divisi:</strong> {selectedEmployee.divisi?.name}</div>
                <div><strong>Biometrik:</strong> {selectedEmployee.faceEnrolledAt ? `Terdaftar pada ${formatDateTime(selectedEmployee.faceEnrolledAt)}` : 'Belum terdaftar'}</div>
              </div>

              <div>
                <h4>Riwayat Absensi Terakhir</h4>
                <div className="timeline-list">
                  {selectedEmployee.attendances?.length ? (
                    selectedEmployee.attendances.map((item) => (
                      <div key={item.id} className="timeline-item">
                        <div className="timeline-bullet" />
                        <div>
                          <strong>{item.status}</strong>
                          <div className="muted-text">{formatDateTime(item.timeIn)}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state compact">Belum ada riwayat absensi.</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">Pilih salah satu pegawai untuk melihat detail lengkap.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Employees;
