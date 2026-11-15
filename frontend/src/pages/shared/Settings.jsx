import { Button, Card, PageHeader, Select } from '../../components/ui.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

const rowStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.875rem' };

export default function Settings() {
  const { user, updateProfile, logout } = useAuth();
  const { pref, setTheme } = useTheme();
  const toast = useToast();
  const notif = user.settings || { email: true, sms: false };

  async function toggle(key) {
    try { await updateProfile({ settings: { ...notif, [key]: !notif[key] } }); toast('Preference saved'); }
    catch (err) { toast(err.message, 'error'); }
  }

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your preferences." />
      <div style={{ maxWidth: '32rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Card>
          <h3 className="font-display font-bold text-sm" style={{ marginBottom: '1rem' }}>Notification preferences</h3>
          <label style={rowStyle}>Email notifications<input type="checkbox" checked={!!notif.email} onChange={() => toggle('email')} /></label>
          <label style={rowStyle}>SMS notifications<input type="checkbox" checked={!!notif.sms} onChange={() => toggle('sms')} /></label>
        </Card>
        <Card>
          <h3 className="font-display font-bold text-sm" style={{ marginBottom: '1rem' }}>Appearance</h3>
          <Select value={pref} onChange={(e) => { setTheme(e.target.value); toast('Preference saved'); }}>
            <option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option>
          </Select>
        </Card>
        <Button variant="danger" icon="logout" onClick={logout} style={{ alignSelf: 'flex-start' }}>Logout</Button>
      </div>
    </>
  );
}
