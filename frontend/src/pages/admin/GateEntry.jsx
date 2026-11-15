import { useState } from 'react';
import { Button, Card, EmptyState, ErrorState, Field, Input, Loading, Modal, PageHeader } from '../../components/ui.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { api } from '../../api/client.js';
import { byNewest, fmtDateTime } from '../../utils/format.js';

const blank = { visitorName: '', contact: '', purpose: '', flat: '', vehicle: '' };

export default function GateEntry() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => api.gate.list());
  const [form, setForm] = useState(null); // null = modal closed
  const [busy, setBusy] = useState(false);

  const entries = data || [];
  const inside = entries.filter((g) => !g.exitTime);
  const history = entries.filter((g) => g.exitTime).sort(byNewest('entryTime'));

  async function save(e) {
    e.preventDefault();
    if (!form.visitorName.trim() || !form.flat.trim()) return;
    setBusy(true);
    try {
      await api.gate.create({ ...form, vehicle: form.vehicle.trim() || '-' });
      toast('Visitor recorded'); setForm(null); reload();
    } catch (err) { toast(err.message, 'error'); } finally { setBusy(false); }
  }
  async function markExit(id) {
    try { await api.gate.markExit(id); toast('Visitor marked as exited'); reload(); }
    catch (err) { toast(err.message, 'error'); }
  }
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (loading && !data) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  return (
    <>
      <PageHeader title="Gate Entry" subtitle="A simple visitor log for the society." action={<Button icon="plus" onClick={() => setForm({ ...blank })}>Record Visitor</Button>} />

      <h2 className="font-display font-bold" style={{ marginBottom: '0.75rem' }}>Currently Inside</h2>
      {inside.length === 0 ? (
        <EmptyState title="No visitors inside" message="Recorded visitors will appear here until they exit." icon="gate" />
      ) : (
        <div className="grid sm-2col" style={{ gap: '0.75rem', marginBottom: '2rem' }}>
          {inside.map((g) => (
            <Card key={g.id}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{g.visitorName}</p>
                  <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>{g.purpose} &middot; Flat {g.flat}</p>
                  <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--muted)' }}>In: {fmtDateTime(g.entryTime)}{g.vehicle && g.vehicle !== '-' ? ` \u00b7 ${g.vehicle}` : ''}</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => markExit(g.id)}>Mark Exit</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <h2 className="font-display font-bold" style={{ margin: '0 0 0.75rem' }}>Recent Entries</h2>
      {history.length === 0 ? <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>No history yet.</p> : (
        <div className="grid sm-2col" style={{ gap: '0.75rem' }}>
          {history.map((g) => (
            <Card key={g.id}>
              <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{g.visitorName}</p>
              <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>{g.purpose} &middot; Flat {g.flat}</p>
              <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--muted)' }}>In: {fmtDateTime(g.entryTime)} &middot; Out: {fmtDateTime(g.exitTime)}</p>
            </Card>
          ))}
        </div>
      )}

      {form && (
        <Modal title="Record Visitor" onClose={() => setForm(null)}>
          <form onSubmit={save}>
            <Field label="Visitor Name"><Input value={form.visitorName} onChange={set('visitorName')} /></Field>
            <Field label="Contact Number"><Input value={form.contact} onChange={set('contact')} /></Field>
            <Field label="Purpose"><Input value={form.purpose} onChange={set('purpose')} placeholder="Guest, delivery, cab, etc." /></Field>
            <Field label="Resident / Flat"><Input value={form.flat} onChange={set('flat')} placeholder="e.g. A-304" /></Field>
            <Field label="Vehicle Number"><Input value={form.vehicle} onChange={set('vehicle')} placeholder="Optional" /></Field>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button variant="secondary" onClick={() => setForm(null)}>Cancel</Button>
              <Button type="submit" disabled={busy}>Save Entry</Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
