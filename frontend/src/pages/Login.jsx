import { useContext, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('admin@komdigi.go.id');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Email atau password tidak valid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-cover">
        <div className="login-copy">
          <span className="chip">Kementerian Komunikasi dan Digital</span>
          <h1>Portal Manajemen Pegawai Komdigi</h1>
          <p>Login untuk mengakses dashboard direktorat, manajemen pegawai, absensi biometrik, dan monitoring operasional.</p>
        </div>
      </div>

      <div className="login-panel">
        <div className="login-card">
          <div className="login-badge">
            <ShieldCheck size={18} />
            <span>Secure Access</span>
          </div>

          <h2>Masuk ke Sistem</h2>
          <p className="muted-text">Gunakan akun role Komdigi untuk melanjutkan.</p>

          {error ? <div className="alert error">{error}</div> : null}

          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            <button type="submit" className="btn full-width" disabled={loading}>
              {loading ? 'Memproses...' : 'Login'}
            </button>
          </form>

          <div className="login-footnote">
            Demo: `admin@komdigi.go.id` / `admin123`
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
