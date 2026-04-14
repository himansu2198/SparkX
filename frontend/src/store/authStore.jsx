import { createContext, useContext, useState } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); }
    catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  // ── Login: get token → fetch profile → store both ─────────────────────────
  const login = async (email, password) => {
    // Step 1: get JWT
    const { data: tokenData } = await authAPI.login({ email, password });
    localStorage.setItem('token', tokenData.access_token);

    // Step 2: fetch user profile with new token
    const { data: me } = await authAPI.me();
    localStorage.setItem('user', JSON.stringify(me));
    setUser(me);
    return me;
  };

  // ── Signup: create account ONLY — NO auto-login ───────────────────────────
  const signup = async (name, email, password, college_name) => {
    const { data } = await authAPI.signup({ name, email, password, college_name });
    // Just return the created user data — caller decides what to do
    return data;
  };

  // ── Logout: clear EVERYTHING ──────────────────────────────────────────────
  const logout = () => {
    // Clear all auth data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Clear any other cached data that might exist
    localStorage.clear();

    // Reset user state
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const { data } = await authAPI.me();
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);