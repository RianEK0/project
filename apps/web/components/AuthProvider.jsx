"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const completeLogin = useCallback((result) => {
    sessionStorage.setItem("sipadi_user", JSON.stringify(result.user));
    localStorage.removeItem("sipadi_user");
    setUser(result.user);
    return result.user;
  }, []);

  const bootstrap = useCallback(async (active = true) => {
      sessionStorage.removeItem("sipadi_token");
      localStorage.removeItem("sipadi_token");
      const cachedUser = sessionStorage.getItem("sipadi_user") || localStorage.getItem("sipadi_user");

      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch {
          sessionStorage.removeItem("sipadi_user");
          localStorage.removeItem("sipadi_user");
        }
      }

      try {
        const result = await apiFetch("/auth/me");
        if (!active) return;
        setUser(result.user);
        sessionStorage.setItem("sipadi_user", JSON.stringify(result.user));
        localStorage.removeItem("sipadi_user");
      } catch (error) {
        sessionStorage.removeItem("sipadi_user");
        localStorage.removeItem("sipadi_user");
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
  }, []);

  useEffect(() => {
    let active = true;
    bootstrap(active);
    return () => {
      active = false;
    };
  }, [bootstrap]);

  const login = useCallback(async (identifier, password) => {
    const result = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password })
    });
    if (result.mfaRequired) return result;
    return { ...result, user: completeLogin(result) };
  }, [completeLogin]);

  const verifyMfa = useCallback(async (challengeToken, code) => {
    const result = await apiFetch("/auth/mfa/verify", {
      method: "POST",
      body: JSON.stringify({ challengeToken, code })
    });
    return { ...result, user: completeLogin(result) };
  }, [completeLogin]);

  const verifyPasskey = useCallback(async (challengeToken, ceremonyToken, response) => {
    const result = await apiFetch("/auth/passkeys/authentication/verify", {
      method: "POST",
      body: JSON.stringify({ challengeToken, ceremonyToken, response })
    });
    return { ...result, user: completeLogin(result) };
  }, [completeLogin]);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      // State lokal tetap dibersihkan; cookie kedaluwarsa/invalid tidak boleh mengunci UI.
    }
    sessionStorage.removeItem("sipadi_user");
    localStorage.removeItem("sipadi_user");
    setUser(null);
  }, []);

  const updateUser = useCallback((nextUser) => {
    sessionStorage.setItem("sipadi_user", JSON.stringify(nextUser));
    localStorage.removeItem("sipadi_user");
    setUser(nextUser);
  }, []);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    await bootstrap(true);
  }, [bootstrap]);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      verifyMfa,
      verifyPasskey,
      logout,
      updateUser,
      refreshUser,
      hasRole: (...roles) => Boolean(user && roles.includes(user.role))
    }),
    [user, loading, login, verifyMfa, verifyPasskey, logout, updateUser, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return value;
}
