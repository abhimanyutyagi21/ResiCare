import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, clearToken, getToken, setToken } from '../api/client.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  // Restore the session from a saved token.
  useEffect(() => {
    if (!getToken()) return;
    api.auth.me()
      .then(({ user }) => setUser(user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  // Any 401 from the API (expired token) logs the user out everywhere.
  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener('resicare:unauthorized', onUnauthorized);
    return () => window.removeEventListener('resicare:unauthorized', onUnauthorized);
  }, []);

  const login = useCallback(async ({ email, password, role, remember = true }) => {
    const { token, user } = await api.auth.login({ email, password, role });
    setToken(token, remember);
    setUser(user);
    return user;
  }, []);

  const signup = useCallback((data) => api.auth.signup(data), []);

  const logout = useCallback(() => { clearToken(); setUser(null); }, []);

  const updateProfile = useCallback(async (patch) => {
    const { user } = await api.auth.updateMe(patch);
    setUser(user);
    return user;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
