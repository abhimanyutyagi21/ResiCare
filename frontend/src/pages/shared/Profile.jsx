import { useState } from 'react';
import { Button, Card, Field, Input, PageHeader, Select, UserAvatar } from '../../components/ui.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { SPECIALIZATIONS } from '../../utils/format.js';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: user.name || '', phone: user.phone || '', tower: user.tower || '', flat: user.flat || '', specialization: user.specialization || SPECIALIZATIONS[0] });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    const patch = { name: form.name.trim(), phone: form.phone.trim() };
    if (user.role === 'resident') { patch.tower = form.tower.trim(); patch.flat = form.flat.trim(); }
    if (user.role === 'worker') patch.specialization = form.specialization;
    setBusy(true);
    try { await updateProfile(patch); toast('Profile updated'); }
    catch (err) { toast(err.message, 'error'); }
    finally { setBusy(false); }
  }

  return (
    <>
      <PageHeader title="Profile" subtitle="Your account details." />
      <Card style={{ maxWidth: '32rem', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
          <UserAvatar name={user.name} size={52} />
          <div><p className="font-display font-bold">{user.name}</p><p className="capitalize" style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>{user.role}</p></div>
        </div>
        <form onSubmit={onSubmit}>
          <Field label="Full Name"><Input value={form.name} onChange={set('name')} /></Field>
          <Field label="Email"><Input value={user.email} disabled style={{ opacity: 0.6 }} /></Field>
          <Field label="Phone"><Input value={form.phone} onChange={set('phone')} /></Field>
          {user.role === 'resident' && (
            <div className="grid grid-cols-2" style={{ gap: 12 }}>
              <Field label="Tower"><Input value={form.tower} onChange={set('tower')} /></Field>
              <Field label="Flat"><Input value={form.flat} onChange={set('flat')} /></Field>
            </div>
          )}
          {user.role === 'worker' && (
            <Field label="Specialization"><Select value={form.specialization} onChange={set('specialization')}>{SPECIALIZATIONS.map((s) => <option key={s}>{s}</option>)}</Select></Field>
          )}
          <Button type="submit" disabled={busy} style={{ marginTop: '0.25rem' }}>Save Changes</Button>
        </form>
      </Card>
    </>
  );
}
