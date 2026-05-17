import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, Users, UserX } from 'lucide-react';
import api from '../utils/api';
import SectionHeader from '../components/SectionHeader';
import StatCard from '../components/StatCard';
import AttendanceChart from '../components/AttendanceChart';
import NotificationPanel from '../components/NotificationPanel';
import { formatDateTime, formatTime } from '../utils/formatters';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPresent: 0,
    totalAbsent: 0,
    attendanceTrend: [],
    divisionSummary: [],
    recentAttendances: [],
    scope: {},
  });
  const [notifications, setNotifications] = useState([]);
  const [activities, setActivities] = useState([]);
  const [reminder, setReminder] = useState(null);

  const fetchDashboard = async () => {
    const [statsRes, notificationRes, activityRes, reminderRes] = await Promise.all([
      api.get('/org/stats'),
      api.get('/notifications'),
      api.get('/activity'),
      api.get('/attendance/reminder'),
    ]);

    setStats(statsRes.data);
    setNotifications(notificationRes.data);
    setActivities(activityRes.data);
    setReminder(reminderRes.data);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const presentRate = useMemo(() => {
    if (!stats.totalUsers) return '0%';
    return `${Math.round((stats.totalPresent / stats.totalUsers) * 100)}%`;
  }, [stats]);

  const handleMarkRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    fetchDashboard();
  };

  return (
    <div>
      <SectionHeader
        title="Dashboard Komdigi"
        subtitle={`Ruang kerja ${stats.scope?.direktorat?.name || 'Komdigi'} dengan tampilan dinamis sesuai direktorat.`}
      />

      {reminder?.shouldRemind ? (
        <div className="card reminder-card">
          <strong>Pengingat absensi</strong>
          <p>{reminder.message}</p>
        </div>
      ) : null}

      <div className="grid grid-4">
        <StatCard icon={<Users />} label="Total Pegawai" value={stats.totalUsers} helper="Semua pegawai dalam scope akses Anda" />
        <StatCard icon={<CheckCircle2 />} label="Hadir Hari Ini" value={stats.totalPresent} tone="success" helper={`Rasio hadir ${presentRate}`} />
        <StatCard icon={<UserX />} label="Belum Hadir" value={stats.totalAbsent} tone="danger" helper="Pegawai yang belum check-in" />
        <StatCard icon={<Clock3 />} label="Kehadiran Valid" value={stats.totalPresent} tone="warning" helper="Mengikuti validasi biometrik" />
      </div>

      <div className="grid dashboard-layout">
        <AttendanceChart rows={stats.attendanceTrend} />
        <NotificationPanel items={notifications} onMarkRead={handleMarkRead} />
      </div>

      <div className="grid dashboard-layout">
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Data Per Divisi</h3>
              <p className="muted-text">Distribusi pegawai menurut unit organisasi.</p>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Divisi</th>
                  <th>Direktorat</th>
                  <th>Total Pegawai</th>
                </tr>
              </thead>
              <tbody>
                {stats.divisionSummary.length ? (
                  stats.divisionSummary.map((item) => (
                    <tr key={item.divisiId}>
                      <td>{item.divisiName}</td>
                      <td>{item.direktoratName}</td>
                      <td>{item.totalUsers}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3">
                      <div className="empty-state compact">Belum ada data divisi.</div>
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
              <h3>Aktivitas Terkini</h3>
              <p className="muted-text">Audit trail perubahan data dan aktivitas absensi.</p>
            </div>
          </div>

          <div className="timeline-list">
            {activities.length ? (
              activities.map((item) => (
                <div key={item.id} className="timeline-item">
                  <div className="timeline-bullet" />
                  <div>
                    <strong>{item.description}</strong>
                    <div className="muted-text">{item.user?.name || 'Sistem'} • {formatDateTime(item.createdAt)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state compact">Belum ada aktivitas.</div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h3>Absensi Terbaru</h3>
            <p className="muted-text">Pantau check-in dan check-out pegawai secara cepat.</p>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pegawai</th>
                <th>Direktorat</th>
                <th>Divisi</th>
                <th>Masuk</th>
                <th>Pulang</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentAttendances.length ? (
                stats.recentAttendances.map((item) => (
                  <tr key={item.id}>
                    <td>{item.user.name}</td>
                    <td>{item.user.direktorat.name}</td>
                    <td>{item.user.divisi.name}</td>
                    <td>{formatTime(item.timeIn)}</td>
                    <td>{formatTime(item.timeOut)}</td>
                    <td><span className={`badge ${item.status.replace(/\s/g, '-')}`}>{item.status}</span></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state compact">Belum ada absensi terbaru.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
