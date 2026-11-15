import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Icon from './Icon.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { UserAvatar } from './ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_ITEMS = {
  resident: [
    ['Dashboard', 'dashboard', '/resident/dashboard'],
    ['My Complaints', 'complaints', '/resident/complaints'],
    ['Report Issue', 'plus', '/resident/complaints/new'],
    ['Announcements', 'announcement', '/resident/announcements'],
    ['Feedback', 'feedback', '/resident/feedback'],
    ['Profile', 'profile', '/profile'],
    ['Settings', 'settings', '/settings'],
  ],
  admin: [
    ['Dashboard', 'dashboard', '/admin/dashboard'],
    ['Complaints', 'complaints', '/admin/complaints'],
    ['Announcements', 'announcement', '/admin/announcements'],
    ['Gate Entry', 'gate', '/admin/gate-entry'],
    ['Feedback', 'feedback', '/admin/feedback'],
    ['Profile', 'profile', '/profile'],
    ['Settings', 'settings', '/settings'],
  ],
  worker: [
    ['Dashboard', 'dashboard', '/worker/dashboard'],
    ['Assigned Complaints', 'complaints', '/worker/complaints'],
    ['Profile', 'profile', '/profile'],
    ['Settings', 'settings', '/settings'],
  ],
};

// The nav item with the longest matching path is the active one, so
// /resident/complaints/new highlights "Report Issue" and
// /resident/complaints/RC-2026-001 highlights "My Complaints".
function activePathFor(items, pathname) {
  const matches = items.map((i) => i[2]).filter((p) => pathname === p || pathname.startsWith(p + '/'));
  return matches.sort((a, b) => b.length - a.length)[0];
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const items = NAV_ITEMS[user.role];
  const active = activePathFor(items, pathname);

  useEffect(() => { setMenuOpen(false); window.scrollTo(0, 0); }, [pathname]);

  const sidebar = (
    <>
      <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="brand-mark">R</div><span className="font-display font-extrabold text-lg">ResiCare</span>
      </div>
      <nav className="sidebar-nav">
        {items.map(([label, icon, path]) => (
          <Link key={path} to={path} className={`sidebar-link${active === path ? ' active' : ''}`}>
            <Icon name={icon} size={17} /><span>{label}</span>
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.5rem', marginBottom: '0.25rem' }}>
          <UserAvatar name={user.name} size={32} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <p className="truncate" style={{ fontSize: '0.875rem', fontWeight: 500 }}>{user.name}</p>
            <p className="capitalize" style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{user.role}</p>
          </div>
          <ThemeToggle />
        </div>
        <button type="button" onClick={logout} className="sidebar-link" style={{ width: '100%', textAlign: 'left', color: 'var(--error)' }}>
          <Icon name="logout" size={17} /><span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>
      <aside className="app-sidebar lg-only">{sidebar}</aside>

      {menuOpen && (
        <div className="mobile-overlay">
          <div className="mobile-overlay-bg" onClick={() => setMenuOpen(false)} />
          <div className="app-sidebar anim-fade" style={{ position: 'relative', width: 280 }}>{sidebar}</div>
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header className="mobile-topbar">
          <button type="button" onClick={() => setMenuOpen(true)} className="focus-ring" style={{ padding: 6, borderRadius: '0.5rem' }} aria-label="Open menu">
            <Icon name="menu" size={20} />
          </button>
          <span className="font-display font-bold">ResiCare</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ThemeToggle /><UserAvatar name={user.name} size={28} /></div>
        </header>
        <main className="app-main anim-page"><Outlet /></main>
      </div>
    </div>
  );
}
