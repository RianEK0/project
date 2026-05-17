import React, { useEffect, useState, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../contexts/AuthContext';
import { Chart } from 'react-google-charts';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [direktorats, setDirektorats] = useState([]);
  const { user } = useContext(AuthContext);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', startDate: '', endDate: '', status: 'Planning', progress: 0, direktoratId: '', divisiId: '', memberIds: []
  });

  useEffect(() => {
    fetchProjects();
    if (user?.roleName !== 'Pegawai') {
      api.get('/users').then(res => setUsers(res.data));
      api.get('/org/direktorats').then(res => setDirektorats(res.data));
    }
  }, [user]);

  const fetchProjects = () => {
    api.get('/projects').then(res => setProjects(res.data));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/projects', formData);
    setShowForm(false);
    fetchProjects();
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure?')) {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    }
  };

  const handleMemberChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({ ...formData, memberIds: value });
  };

  const currentDir = direktorats.find(d => d.id === parseInt(formData.direktoratId));

  // Prepare data for Google Charts Timeline
  const chartData = [
    [
      { type: 'string', id: 'Project ID' },
      { type: 'string', id: 'Project Name' },
      { type: 'string', id: 'Status' },
      { type: 'date', id: 'Start Date' },
      { type: 'date', id: 'End Date' },
    ]
  ];

  projects.forEach(p => {
    chartData.push([
      p.id.toString(),
      p.name,
      p.status,
      new Date(p.startDate),
      new Date(p.endDate)
    ]);
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Manajemen Proyek</h2>
        {user?.roleName !== 'Pegawai' && (
          <button className="btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Batal' : '+ Tambah Proyek'}
          </button>
        )}
      </div>

      {showForm && user?.roleName !== 'Pegawai' && (
        <div className="card">
          <h3>Tambah Proyek Baru</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            <div className="grid grid-2">
              <div>
                <label>Nama Proyek</label>
                <input type="text" required onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label>Deskripsi</label>
                <input type="text" onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div>
                <label>Tanggal Mulai</label>
                <input type="date" required onChange={e => setFormData({...formData, startDate: e.target.value})} />
              </div>
              <div>
                <label>Tanggal Selesai</label>
                <input type="date" required onChange={e => setFormData({...formData, endDate: e.target.value})} />
              </div>
              <div>
                <label>Status</label>
                <select onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="Planning">Planning</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <div>
                <label>Progress (%)</label>
                <input type="number" min="0" max="100" onChange={e => setFormData({...formData, progress: e.target.value})} />
              </div>
              <div>
                <label>Direktorat</label>
                <select required onChange={e => setFormData({...formData, direktoratId: e.target.value, divisiId: ''})}>
                  <option value="">Pilih Direktorat</option>
                  {direktorats.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              {currentDir && (
                <div>
                  <label>Divisi</label>
                  <select required onChange={e => setFormData({...formData, divisiId: e.target.value})}>
                    <option value="">Pilih Divisi</option>
                    {currentDir.divisis.map(div => <option key={div.id} value={div.id}>{div.name}</option>)}
                  </select>
                </div>
              )}
              <div style={{ gridColumn: 'span 2' }}>
                <label>Anggota Tim (Pegawai)</label>
                <select multiple onChange={handleMemberChange} style={{ height: '100px' }}>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} - {u.role.name}</option>)}
                </select>
                <small style={{ color: 'var(--text-muted)' }}>Tahan CTRL/CMD untuk memilih lebih dari satu</small>
              </div>
            </div>
            <button type="submit" className="btn" style={{ marginTop: '10px' }}>Simpan</button>
          </form>
        </div>
      )}

      {projects.length > 0 ? (
        <div className="card" style={{ overflowX: 'auto' }}>
          <h3>Timeline Proyek</h3>
          <div style={{ marginTop: '20px' }}>
            <Chart
              chartType="Timeline"
              data={chartData}
              width="100%"
              height={`${projects.length * 50 + 100}px`}
              options={{
                colors: ['#3b82f6', '#eab308', '#22c55e']
              }}
            />
          </div>
        </div>
      ) : (
        <div className="card"><p>Belum ada proyek.</p></div>
      )}

      <div className="grid grid-3">
        {projects.map(p => (
          <div key={p.id} className="card">
            <h4>{p.name}</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '10px' }}>{p.description}</p>
            <div style={{ marginBottom: '10px' }}>
              <span className={`badge ${p.status}`}>{p.status}</span>
              <span style={{ float: 'right', fontWeight: 'bold' }}>{p.progress}%</span>
            </div>
            <div style={{ backgroundColor: '#e5e7eb', height: '8px', borderRadius: '4px', marginBottom: '15px' }}>
              <div style={{ width: `${p.progress}%`, backgroundColor: 'var(--primary)', height: '100%', borderRadius: '4px' }}></div>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#4b5563' }}>
              <div><strong>Mulai:</strong> {new Date(p.startDate).toLocaleDateString()}</div>
              <div><strong>Selesai:</strong> {new Date(p.endDate).toLocaleDateString()}</div>
            </div>
            <div style={{ marginTop: '15px' }}>
              <strong style={{ fontSize: '0.8rem' }}>Tim:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                {p.members.map(m => (
                  <span key={m.user.id} className="badge" style={{ backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' }}>
                    {m.user.name}
                  </span>
                ))}
              </div>
            </div>
            {user?.roleName !== 'Pegawai' && (
              <button className="btn btn-danger" onClick={() => handleDelete(p.id)} style={{ marginTop: '15px', width: '100%' }}>Hapus Proyek</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
