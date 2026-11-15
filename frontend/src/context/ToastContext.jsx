import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

const ICONS = { success: '\u2713', error: '\u00d7', info: '\u{1F4E3}' };
const COLORS = { success: 'var(--success)', error: 'var(--error)', info: 'var(--info)' };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 100, maxWidth: '90vw' }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            className="anim-toast"
            style={{
              display: 'flex', alignItems: 'center', gap: 8, background: 'var(--card)',
              border: '1px solid var(--border)', borderRadius: '0.65rem', padding: '0.75rem 1rem',
              boxShadow: '0 10px 25px -8px rgba(20,20,18,0.18)', fontSize: '0.875rem', fontWeight: 500, marginTop: 8,
            }}
          >
            <span style={{ color: COLORS[t.type] || COLORS.success, fontWeight: 700 }}>{ICONS[t.type] || ICONS.success}</span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
