import { Link } from 'react-router-dom';

// Two-column auth screen shared by Login and Signup.
export default function AuthLayout({ children }) {
  return (
    <div className="auth-grid">
      <div className="auth-side">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/images/9.jpg" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div className="brand-mark" style={{ background: 'rgba(255,255,255,0.15)' }}>R</div>
            <span className="font-display font-extrabold text-lg" style={{ color: '#fff' }}>ResiCare</span>
          </Link>
        </div>
        <div>
          <h2 className="font-display" style={{ fontSize: '1.875rem', fontWeight: 700, color: '#fff', maxWidth: '22rem' }}>Report an issue. Track the repair. Stay updated.</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '0.75rem', maxWidth: '22rem', fontSize: '0.875rem' }}>One place for residents, admins and workers to manage everyday society maintenance.</p>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>&copy; 2026 ResiCare</p>
      </div>
      <div className="auth-form-col">
        <div className="auth-form-wrap anim-page">
          <div className="lg-hidden" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '2rem' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'inherit' }}>
              <div className="brand-mark">R</div><span className="font-display font-extrabold text-lg">ResiCare</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
