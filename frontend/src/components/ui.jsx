import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import { fmtDate } from '../utils/format.js';

/* ───────────── Buttons ───────────── */
const SIZES = {
  sm: { padding: '0.375rem 0.75rem', fontSize: '0.8125rem' },
  md: { padding: '0.6rem 1rem', fontSize: '0.875rem' },
  lg: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
};
const VARIANTS = {
  primary: { background: 'var(--primary)', color: '#fff' },
  secondary: { background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text-primary)' },
  ghost: { background: 'transparent', color: 'var(--text-secondary)' },
  danger: { background: 'var(--error)', color: '#fff' },
};
const baseButton = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  borderRadius: '0.65rem', fontWeight: 500, border: 'none', cursor: 'pointer', textDecoration: 'none',
};

// Pass `to` to render a router <Link> that looks like a button.
export function Button({ variant = 'primary', size = 'md', icon, to, style, children, type = 'button', ...rest }) {
  const css = { ...baseButton, ...SIZES[size], ...VARIANTS[variant], ...style };
  const content = (<>{icon && <Icon name={icon} size={16} />}{children}</>);
  if (to) return <Link to={to} className="btn focus-ring" style={css} {...rest}>{content}</Link>;
  return <button type={type} className="btn focus-ring" style={css} {...rest}>{content}</button>;
}

/* ───────────── Form fields ───────────── */
export const inputStyle = {
  width: '100%', padding: '0.65rem 0.9rem', borderRadius: '0.65rem', border: '1px solid var(--border)',
  background: 'var(--card)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none',
};
export const Input = ({ style, ...p }) => <input className="input" style={{ ...inputStyle, ...style }} {...p} />;
export const Select = ({ style, children, ...p }) => <select className="input" style={{ ...inputStyle, ...style }} {...p}>{children}</select>;
export const Textarea = ({ style, ...p }) => <textarea className="input" style={{ ...inputStyle, ...style }} {...p} />;

export function Field({ label, error, hint, children }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem' }}>{label}</label>}
      {children}
      {hint && <p style={{ fontSize: '0.75rem', marginTop: '0.3rem', color: 'var(--muted)' }}>{hint}</p>}
      {error && <p className="field-error" style={{ fontSize: '0.75rem', marginTop: '0.3rem', color: 'var(--error)' }}>{error}</p>}
    </div>
  );
}

/* ───────────── Badges ───────────── */
const badgeBase = {
  display: 'inline-flex', alignItems: 'center', padding: '0.3rem 0.6rem', borderRadius: '0.5rem',
  fontSize: '0.75rem', fontWeight: 500, whiteSpace: 'nowrap',
};
const STATUS_COLORS = {
  Pending: ['var(--warning-bg)', 'var(--warning)'],
  Assigned: ['var(--info-bg)', 'var(--info)'],
  'In Progress': ['var(--info-bg)', 'var(--info)'],
  Resolved: ['var(--success-bg)', 'var(--success)'],
  Closed: ['var(--chip-bg)', 'var(--text-secondary)'],
};
export function StatusBadge({ status }) {
  const [bg, fg] = STATUS_COLORS[status] || STATUS_COLORS.Pending;
  return <span style={{ ...badgeBase, background: bg, color: fg }}>{status}</span>;
}
const PRIORITY_COLORS = {
  Low: ['var(--chip-bg)', 'var(--text-secondary)'],
  Medium: ['var(--info-bg)', 'var(--info)'],
  High: ['var(--warning-bg)', 'var(--warning)'],
  Emergency: ['var(--emergency-bg)', 'var(--emergency)'],
};
export function PriorityBadge({ priority }) {
  const [bg, fg] = PRIORITY_COLORS[priority] || PRIORITY_COLORS.Low;
  return <span style={{ ...badgeBase, gap: 4, background: bg, color: fg }}>{priority === 'Emergency' && '\u26A0 '}{priority}</span>;
}

/* ───────────── Layout bits ───────────── */
export function Card({ children, style }) {
  return <div className="bg-white rounded-xl border" style={{ padding: '1.25rem', ...style }}>{children}</div>;
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
      <div>
        <h1 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: '0.875rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

const TONES = { default: 'var(--text-primary)', success: 'var(--success)', warning: 'var(--warning)', emergency: 'var(--emergency)' };
export function StatCard({ label, value, tone = 'default' }) {
  return (
    <Card>
      <p style={{ fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--muted)' }}>{label}</p>
      <p className="font-display" style={{ fontSize: '1.9rem', fontWeight: 700, marginTop: '0.5rem', color: TONES[tone] }}>{value}</p>
    </Card>
  );
}

export function EmptyState({ title, message, actionLabel, actionTo, icon = 'complaints' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '4rem 1.5rem', borderRadius: '0.85rem', border: '1px dashed var(--border)' }}>
      <div style={{ width: 48, height: 48, borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', background: 'var(--success-bg)', color: 'var(--primary)' }}>
        <Icon name={icon} size={22} />
      </div>
      <h3 className="font-display font-bold text-lg" style={{ marginBottom: '0.25rem' }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', marginBottom: '1.25rem', maxWidth: '24rem', color: 'var(--text-secondary)' }}>{message}</p>
      {actionLabel && <Button to={actionTo}>{actionLabel}</Button>}
    </div>
  );
}

export function UserAvatar({ name, size = 36 }) {
  const initials = (name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#fff', flexShrink: 0, background: 'var(--primary)', fontSize: size * 0.38 }}>
      {initials}
    </div>
  );
}

export function Loading({ label = 'Loading…' }) {
  return <p style={{ padding: '3rem 0', textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted)' }}>{label}</p>;
}

export function ErrorState({ error, onRetry }) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', border: '1px solid var(--error)', borderRadius: '0.85rem', background: 'var(--error-bg)' }}>
      <p style={{ color: 'var(--error)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{error?.message || 'Something went wrong.'}</p>
      {onRetry && <Button variant="secondary" size="sm" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

/* ───────────── Timeline, cards, stars ───────────── */
const STAGES = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
export function Timeline({ status }) {
  const idx = STAGES.indexOf(status);
  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%', overflowX: 'auto', padding: '0.5rem 0' }}>
      {STAGES.map((s, i) => (
        <div key={s} style={{ display: 'contents' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, minWidth: 74 }}>
            <div style={{ width: 28, height: 28, borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, background: i <= idx ? 'var(--primary)' : 'var(--chip-bg)', color: i <= idx ? '#fff' : 'var(--muted)' }}>
              {i < idx ? <Icon name="check" size={13} /> : i + 1}
            </div>
            <p style={{ fontSize: '0.75rem', marginTop: '0.4rem', textAlign: 'center', color: i <= idx ? 'var(--text-primary)' : 'var(--muted)', fontWeight: i === idx ? 600 : 400 }}>{s}</p>
          </div>
          {i < STAGES.length - 1 && <div style={{ height: 2, flex: 1, minWidth: 16, background: i < idx ? 'var(--primary)' : 'var(--chip-bg)' }} />}
        </div>
      ))}
    </div>
  );
}

export function ComplaintCard({ complaint: c, to }) {
  return (
    <Link to={to} className="hover:shadow-sm transition-shadow" style={{ display: 'block', textAlign: 'left', background: 'var(--card)', borderRadius: '0.85rem', border: '1px solid var(--border)', padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ minWidth: 0 }}>
          <p className="font-mono text-xs" style={{ color: 'var(--muted)' }}>{c.id}</p>
          <p className="truncate" style={{ fontWeight: 500, marginTop: '0.15rem' }}>{c.title}</p>
          <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>{c.category} &middot; {c.tower}-{c.flat}</p>
        </div>
        <StatusBadge status={c.status} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
        <PriorityBadge priority={c.priority} />
        <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{fmtDate(c.createdAt)}</span>
      </div>
    </Link>
  );
}

const ANNOUNCEMENT_COLORS = { Normal: 'var(--info)', Important: 'var(--warning)', Emergency: 'var(--emergency)' };
export function AnnouncementCard({ announcement: a, actions }) {
  return (
    <Card>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 500, padding: '0.15rem 0.5rem', borderRadius: '0.5rem', background: 'var(--chip-bg)', color: 'var(--text-secondary)' }}>{a.category}</span>
          {a.priority !== 'Normal' && <span style={{ fontSize: '0.75rem', fontWeight: 500, color: ANNOUNCEMENT_COLORS[a.priority] }}>{a.priority}</span>}
        </div>
        <h3 className="font-display font-bold">{a.title}</h3>
        <p style={{ fontSize: '0.875rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>{a.description}</p>
        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--muted)' }}>{fmtDate(a.createdAt)}</p>
      </div>
      {actions && <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>{actions}</div>}
    </Card>
  );
}

// Read-only stars when `onChange` is omitted, clickable when provided.
export function Stars({ rating, onChange }) {
  return (
    <>
      {[1, 2, 3, 4, 5].map((n) => {
        const color = n <= rating ? 'var(--warning)' : 'var(--star-empty)';
        return onChange ? (
          <button key={n} type="button" className="star-btn" onClick={() => onChange(n)} style={{ color }} aria-label={`${n} star${n > 1 ? 's' : ''}`}>
            <Icon name="star" size={26} />
          </button>
        ) : (
          <span key={n} style={{ color }}><Icon name="star" size={15} /></span>
        );
      })}
    </>
  );
}

/* ───────────── Modal ───────────── */
export function Modal({ title, onClose, maxWidth, footer, children }) {
  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box anim-modal" style={maxWidth ? { maxWidth } : undefined} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h3 className="font-display font-bold text-lg">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
