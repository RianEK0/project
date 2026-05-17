import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizeUser = (rawUser) => {
    if (!rawUser) return null;

    return {
      ...rawUser,
      roleName: typeof rawUser.role === 'string' ? rawUser.role : rawUser.role?.name,
      roleId: rawUser.roleId || rawUser.role?.id,
      direktoratId: rawUser.direktoratId || rawUser.direktorat?.id,
      divisiId: rawUser.divisiId || rawUser.divisi?.id,
    };
  };

  const refreshUser = async () => {
    const res = await api.get('/auth/me');
    const nextUser = normalizeUser(res.data);
    setUser(nextUser);
    return nextUser;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      refreshUser()
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    let locInterval;
    if (token) {
      locInterval = setInterval(() => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              api.post('/location/update', { lat: pos.coords.latitude, lng: pos.coords.longitude }).catch(()=>{});
            },
            (err) => console.log('Location error', err),
            { enableHighAccuracy: true }
          );
        }
      }, 30000); // Update every 30s
    }

    return () => {
      if (locInterval) clearInterval(locInterval);
    };
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.accessToken);
    await refreshUser();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
