import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout.jsx';
import PasswordInput from './PasswordInput.jsx';
import { Button, Field, Input } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const ROLES = ['resident', 'admin', 'worker'];
const DEMO = [
  ['Resident', 'resident@resicare.demo', 'resident123'],
  ['Admin', 'admin@resicare.demo', 'admin123'],
  ['Worker', 'worker@resicare.demo', 'worker123'],
];

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [role, setRole] = useState('resident');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={`/${user.role}/dashboard`} replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) return setError('Please enter your email and password.');
    setBusy(true);
    try {
      const u = await login({ email: email.trim(), password, role, remember });
      toast(`Welcome back, ${u.role}!`);
      navigate(`/${u.role}/dashboard`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Log in to ResiCare</h1>
      <p style={{ fontSize: '0.875rem', marginTop: '0.4rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Enter your details to access your dashboard.</p>

      <form onSubmit={onSubmit} noValidate>
        <Field label="I am a">
          <div className="role-toggle">
            {ROLES.map((r) => (
              <button key={r} type="button" className={`role-btn${role === r ? ' active' : ''}`} onClick={() => setRole(r)}>{r}</button>
            ))}
          </div>
        </Field>
        <Field label="Email">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" autoComplete="email" />
        </Field>
        <Field label="Password">
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" />
        </Field>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me
          </label>
          <a href="#" onClick={(e) => { e.preventDefault(); toast("Password reset isn't available yet.", 'info'); }} style={{ color: 'var(--primary)', fontWeight: 500 }}>Forgot password?</a>
        </div>

        {error && <div style={{ fontSize: '0.875rem', marginBottom: '1rem', padding: '0.6rem 0.9rem', borderRadius: '0.65rem', background: 'var(--error-bg)', color: 'var(--error)' }}>{error}</div>}

        <Button type="submit" size="lg" disabled={busy} style={{ width: '100%' }}>{busy ? 'Logging in…' : 'Login'}</Button>
        <p style={{ fontSize: '0.875rem', textAlign: 'center', marginTop: '1.25rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/signup" style={{ fontWeight: 500, color: 'var(--primary)' }}>Sign up</Link>
        </p>
      </form>

      {import.meta.env.DEV && (
        <div style={{ marginTop: '2rem', padding: '1rem', borderRadius: '0.65rem', border: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <p style={{ fontWeight: 500, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>Demo access (seeded data)</p>
          {DEMO.map(([r, e, p]) => <p key={r}>{r}: {e} / {p}</p>)}
        </div>
      )}
    </AuthLayout>
  );
}
