import { useContext } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import { getThemeStyles } from './utils/theme';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Employees from './pages/Employees';
import Projects from './pages/Projects';
import MapTracking from './pages/MapTracking';
import Profile from './pages/Profile';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="screen-center">Memuat sesi...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell" style={getThemeStyles(user?.direktorat)}>
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><MapTracking /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
