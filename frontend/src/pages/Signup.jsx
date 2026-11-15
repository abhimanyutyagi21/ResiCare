import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout.jsx';
import PasswordInput from './PasswordInput.jsx';
import { Button, Field, Input, Select } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { SPECIALIZATIONS } from '../utils/format.js';

const empty = { name: '', email: '', phone: '', role: 'resident', tower: '', flat: '', specialization: SPECIALIZATIONS[0], inviteCode: '', password: '', confirm: '' };

export default function Signup() {
  const { user, signup } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={`/${user.role}/dashboard`} replace />;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Please enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = 'Please enter a valid email.';
    if (!/^\d{7,15}$/.test(form.phone.trim())) e.phone = 'Please enter a valid phone number.';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters.';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match.';
    if (form.role === 'admin' && !form.inviteCode.trim()) e.inviteCode = 'An admin invite code is required.';
    return e;
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    const data = { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), password: form.password, role: form.role };
    if (form.role === 'resident') { data.tower = form.tower.trim(); data.flat = form.flat.trim(); }
    if (form.role === 'worker') data.specialization = form.specialization;
    if (form.role === 'admin') data.inviteCode = form.inviteCode.trim();
    setBusy(true);
    try {
      await signup(data);
      toast('Account created. Please log in.');
      navigate('/login');
    } catch (err) {
      setErrors({ [err.fields?.email ? 'email' : err.fields?.inviteCode ? 'inviteCode' : 'form']: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Create your account</h1>
      <p style={{ fontSize: '0.875rem', marginTop: '0.4rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Join ResiCare to get started.</p>

      <form onSubmit={onSubmit} noValidate>
        <Field label="Full Name" error={errors.name}><Input value={form.name} onChange={set('name')} placeholder="e.g. Ananya Verma" /></Field>
        <Field label="Email" error={errors.email}><Input type="email" value={form.email} onChange={set('email')} placeholder="Enter your email" autoComplete="email" /></Field>
        <Field label="Phone Number" error={errors.phone}><Input value={form.phone} onChange={set('phone')} placeholder="10-digit phone number" inputMode="numeric" /></Field>
        <Field label="Role">
          <Select value={form.role} onChange={set('role')}>
            <option value="resident">Resident</option><option value="admin">Admin</option><option value="worker">Worker</option>
          </Select>
        </Field>

        {form.role === 'resident' && (
          <div className="grid grid-cols-2" style={{ gap: 12 }}>
            <Field label="Tower"><Input value={form.tower} onChange={set('tower')} placeholder="A" /></Field>
            <Field label="Flat Number"><Input value={form.flat} onChange={set('flat')} placeholder="304" /></Field>
          </div>
        )}
        {form.role === 'worker' && (
          <Field label="Specialization">
            <Select value={form.specialization} onChange={set('specialization')}>{SPECIALIZATIONS.map((s) => <option key={s}>{s}</option>)}</Select>
          </Field>
        )}
        {form.role === 'admin' && (
          <Field label="Admin invite code" error={errors.inviteCode} hint="Ask your society committee for this code.">
            <Input value={form.inviteCode} onChange={set('inviteCode')} />
          </Field>
        )}

        <Field label="Password" error={errors.password}><PasswordInput value={form.password} onChange={set('password')} placeholder="At least 6 characters" autoComplete="new-password" /></Field>
        <Field label="Confirm Password" error={errors.confirm}><Input type="password" value={form.confirm} onChange={set('confirm')} placeholder="Re-enter your password" autoComplete="new-password" /></Field>

        {errors.form && <div style={{ fontSize: '0.875rem', marginBottom: '1rem', padding: '0.6rem 0.9rem', borderRadius: '0.65rem', background: 'var(--error-bg)', color: 'var(--error)' }}>{errors.form}</div>}

        <Button type="submit" size="lg" disabled={busy} style={{ width: '100%', marginTop: '0.25rem' }}>{busy ? 'Creating account…' : 'Create Account'}</Button>
        <p style={{ fontSize: '0.875rem', textAlign: 'center', marginTop: '1.25rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 500, color: 'var(--primary)' }}>Login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
