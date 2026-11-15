import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const THEME_KEY = 'resicare_theme';
const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

const systemDark = () => !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
const resolve = (pref) => (pref === 'system' ? (systemDark() ? 'dark' : 'light') : pref);

export function ThemeProvider({ children }) {
  const [pref, setPref] = useState(() => localStorage.getItem(THEME_KEY) || 'light');
  const [resolved, setResolved] = useState(() => resolve(pref));

  useEffect(() => {
    const apply = () => {
      const r = resolve(pref);
      setResolved(r);
      document.documentElement.setAttribute('data-theme', r);
    };
    apply();
    if (pref !== 'system' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [pref]);

  const setTheme = useCallback((p) => { localStorage.setItem(THEME_KEY, p); setPref(p); }, []);
  const toggleTheme = useCallback(() => setTheme(resolved === 'dark' ? 'light' : 'dark'), [resolved, setTheme]);

  return <ThemeContext.Provider value={{ pref, resolved, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>;
}
