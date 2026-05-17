import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { Camera, Download, FileSpreadsheet, ScanFace } from 'lucide-react';
import api from '../utils/api';
import { AuthContext } from '../contexts/AuthContext';
import SectionHeader from '../components/SectionHeader';
import { exportAttendanceToExcel, exportAttendanceToPdf } from '../utils/attendanceExport';
import { formatDate, formatTime, getFullImageUrl } from '../utils/formatters';

const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

const Attendance = () => {
  const { user, refreshUser } = useContext(AuthContext);
  const webcamRef = useRef(null);
  const [attendances, setAttendances] = useState([]);
  const [summary, setSummary] = useState({ total: 0, valid: 0, invalid: 0 });
  const [direktorats, setDirektorats] = useState([]);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState('check-in');
  const [loading, setLoading] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState('Menunggu kamera aktif.');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    direktoratId: '',
    divisiId: '',
    status: '',
  });

  const currentDirektorat = useMemo(
    () => direktorats.find((item) => item.id === Number(filters.direktoratId)),
    [direktorats, filters.direktoratId]
  );

  const enrolledDescriptor = useMemo(() => {
    if (!user?.faceDescriptor) return null;
    try {
      return new Float32Array(JSON.parse(user.faceDescriptor));
    } catch {
      return null;
    }
  }, [user]);

  const fetchAttendances = async () => {
    const [attendanceRes, summaryRes, orgRes] = await Promise.all([
      api.get('/attendance', { params: filters }),
      api.get('/attendance/summary', { params: filters }),
      api.get('/org/direktorats'),
    ]);

    setAttendances(attendanceRes.data);
    setSummary(summaryRes.data);
    setDirektorats(orgRes.data);
  };

  useEffect(() => {
    fetchAttendances();
  }, [filters.startDate, filters.endDate, filters.direktoratId, filters.divisiId, filters.status]);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (error) {
        setDetectionStatus('Gagal memuat model face recognition.');
      }
    };

    loadModels();
  }, []);

  const extractFaceDescriptor = async (imageSrc) => {
    const img = new Image();
    img.src = imageSrc;
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const detection = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    return detection;
  };

  const buildPayload = async (imageSrc) => {
    const detection = await extractFaceDescriptor(imageSrc);

    if (!detection) {
      throw new Error('Wajah tidak terdeteksi. Pastikan posisi wajah berada di tengah kamera.');
    }

    const descriptor = detection.descriptor;
    const hasEnrollment = Boolean(enrolledDescriptor);
    let isValid = true;
    let note = 'Validasi wajah berhasil.';

    if (cameraMode !== 'enroll') {
      if (!hasEnrollment) {
        throw new Error('Biometrik wajah belum terdaftar. Silakan lakukan enrollment wajah terlebih dahulu.');
      }

      const distance = faceapi.euclideanDistance(descriptor, enrolledDescriptor);
      isValid = distance <= 0.5;
      note = isValid
        ? `Wajah valid dengan jarak ${distance.toFixed(3)}`
        : `Wajah tidak cocok dengan data pegawai. Jarak ${distance.toFixed(3)}`;
    }

    let lat = null;
    let lng = null;
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000, enableHighAccuracy: true });
      });
      lat = position.coords.latitude;
      lng = position.coords.longitude;
    } catch {
      // ignore geolocation failure
    }

    return {
      imageSrc,
      descriptor: Array.from(descriptor),
      isValid,
      note,
      lat,
      lng,
    };
  };

  const captureAction = useCallback(async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setLoading(true);
    try {
      const payload = await buildPayload(imageSrc);

      if (cameraMode === 'enroll') {
        await api.post('/users/me/enroll-face', { faceDescriptor: payload.descriptor });
        await refreshUser();
        alert('Enrollment wajah berhasil disimpan.');
      } else if (cameraMode === 'check-in') {
        await api.post('/attendance/check-in', {
          photoIn: payload.imageSrc,
          isValid: payload.isValid,
          note: payload.note,
          lat: payload.lat,
          lng: payload.lng,
        });
        alert(payload.isValid ? 'Absen masuk berhasil.' : 'Absen masuk tercatat, tetapi validasi wajah gagal.');
      } else {
        await api.post('/attendance/check-out', {
          photoOut: payload.imageSrc,
          note: payload.note,
          lat: payload.lat,
          lng: payload.lng,
        });
        alert('Absen pulang berhasil.');
      }

      setShowCamera(false);
      fetchAttendances();
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Terjadi kesalahan saat memproses absensi.');
    } finally {
      setLoading(false);
    }
  }, [cameraMode, enrolledDescriptor, refreshUser]);

  const handleExportCsv = async () => {
    const res = await api.get('/attendance/export', {
      params: filters,
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'komdigi-attendance.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div>
      <SectionHeader
        title="Absensi & Face Recognition"
        subtitle="Check-in, check-out, validasi wajah pegawai, dan riwayat absensi terintegrasi."
        actions={
          <div className="section-actions">
            <button className="ghost-btn" onClick={() => exportAttendanceToPdf(attendances)}>
              <Download size={16} />
              Export PDF
            </button>
            <button className="ghost-btn" onClick={() => exportAttendanceToExcel(attendances)}>
              <FileSpreadsheet size={16} />
              Export Excel
            </button>
            <button className="ghost-btn" onClick={handleExportCsv}>
              <Download size={16} />
              Export CSV
            </button>
          </div>
        }
      />

      <div className="grid grid-3">
        <div className="card stat-tile">
          <div className="eyebrow">Total Absensi</div>
          <div className="stat-value">{summary.total}</div>
        </div>
        <div className="card stat-tile">
          <div className="eyebrow">Absensi Valid</div>
          <div className="stat-value">{summary.valid}</div>
        </div>
        <div className="card stat-tile">
          <div className="eyebrow">Absensi Tidak Valid</div>
          <div className="stat-value">{summary.invalid}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h3>Panel Kamera</h3>
            <p className="muted-text">{modelsLoaded ? detectionStatus : 'Memuat model biometrik wajah...'}</p>
          </div>
          <div className="section-actions">
            <button className="btn" disabled={!modelsLoaded} onClick={() => { setCameraMode('enroll'); setShowCamera(true); setDetectionStatus('Siap melakukan enrollment wajah.'); }}>
              <ScanFace size={16} />
              Enroll Wajah
            </button>
            <button className="btn" disabled={!modelsLoaded} onClick={() => { setCameraMode('check-in'); setShowCamera(true); setDetectionStatus('Siap melakukan absen masuk.'); }}>
              <Camera size={16} />
              Absen Masuk
            </button>
            <button className="btn alt" disabled={!modelsLoaded} onClick={() => { setCameraMode('check-out'); setShowCamera(true); setDetectionStatus('Siap melakukan absen pulang.'); }}>
              <Camera size={16} />
              Absen Pulang
            </button>
          </div>
        </div>

        {showCamera ? (
          <div className="camera-grid">
            <div className="camera-frame">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={640}
                videoConstraints={{ facingMode: 'user' }}
              />
            </div>
            <div className="stack-list">
              <div className="inline-note">
                <ScanFace size={18} />
                <span>
                  {cameraMode === 'enroll'
                    ? 'Enrollment akan menyimpan descriptor wajah ke profil pegawai.'
                    : 'Sistem akan membandingkan wajah dengan descriptor yang sudah terdaftar.'}
                </span>
              </div>
              <div className="inline-note">
                <Camera size={18} />
                <span>Pastikan wajah terlihat jelas, satu orang saja di depan kamera, dan pencahayaan cukup.</span>
              </div>
              <div className="form-actions">
                <button className="btn" onClick={captureAction} disabled={loading}>
                  {loading ? 'Memproses...' : 'Capture & Proses'}
                </button>
                <button className="ghost-btn" onClick={() => setShowCamera(false)}>Batal</button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="card filter-card">
        <div className="grid grid-4">
          <div>
            <label>Tanggal Mulai</label>
            <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
          </div>
          <div>
            <label>Tanggal Akhir</label>
            <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
          </div>
          <div>
            <label>Direktorat</label>
            <select value={filters.direktoratId} onChange={(e) => setFilters({ ...filters, direktoratId: e.target.value, divisiId: '' })}>
              <option value="">Semua Direktorat</option>
              {direktorats.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Divisi</label>
            <select value={filters.divisiId} onChange={(e) => setFilters({ ...filters, divisiId: e.target.value })}>
              <option value="">Semua Divisi</option>
              {(currentDirektorat?.divisis || []).map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Status</label>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">Semua Status</option>
              <option value="Hadir">Hadir</option>
              <option value="Terlambat">Terlambat</option>
              <option value="Tidak Valid">Tidak Valid</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Pegawai</th>
                <th>Direktorat</th>
                <th>Divisi</th>
                <th>Masuk</th>
                <th>Pulang</th>
                <th>Status</th>
                <th>Capture</th>
              </tr>
            </thead>
            <tbody>
              {attendances.length ? (
                attendances.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDate(item.timeIn)}</td>
                    <td>{item.user?.name}</td>
                    <td>{item.user?.direktorat?.name}</td>
                    <td>{item.user?.divisi?.name}</td>
                    <td>{formatTime(item.timeIn)}</td>
                    <td>{formatTime(item.timeOut)}</td>
                    <td><span className={`badge ${item.status.replace(/\s/g, '-')}`}>{item.status}</span></td>
                    <td>
                      {item.photoIn ? (
                        <img src={getFullImageUrl(item.photoIn)} alt="capture" className="attendance-thumb" />
                      ) : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">
                    <div className="empty-state compact">Riwayat absensi belum tersedia.</div>
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

export default Attendance;
