import { useState } from 'react';
import { AnnouncementCard, Button, EmptyState, ErrorState, Field, Input, Loading, Modal, PageHeader, Select, Textarea } from '../../components/ui.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { api } from '../../api/client.js';
import { byNewest } from '../../utils/format.js';

const CATEGORIES = ['General', 'Maintenance', 'Emergency', 'Security', 'Events'];
const PRIORITIES = ['Normal', 'Important', 'Emergency'];
const blank = { title: '', description: '', category: 'General', priority: 'Normal' };

export default function Announcements() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => api.announcements.list());
  const [editing, setEditing] = useState(null);   // null | { id?: string, ...fields }
  const [deleteId, setDeleteId] = useState(null);
  const [busy, setBusy] = useState(false);

  const items = [...(data || [])].sort(byNewest());

  async function save(e) {
    e.preventDefault();
    const { id, ...body } = editing;
    if (!body.title.trim() || !body.description.trim()) return;
    setBusy(true);
    try {
      if (id) { await api.announcements.update(id, body); toast('Announcement updated'); }
      else { await api.announcements.create(body); toast('Announcement published'); }
      setEditing(null);
      reload();
    } catch (err) { toast(err.message, 'error'); } finally { setBusy(false); }
  }

  async function confirmDelete() {
    setBusy(true);
    try { await api.announcements.remove(deleteId); toast('Announcement deleted'); setDeleteId(null); reload(); }
    catch (err) { toast(err.message, 'error'); } finally { setBusy(false); }
  }

  return (
    <>
      <PageHeader title="Announcements" subtitle={isAdmin ? 'Publish updates for residents.' : 'Stay informed about your society.'}
        action={isAdmin && <Button icon="plus" onClick={() => setEditing({ ...blank })}>Publish Announcement</Button>} />

      {loading && !data ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : items.length === 0 ? (
        <EmptyState title="You're all caught up" message="There are no new society announcements." icon="announcement" />
      ) : (
        <div className="grid sm-2col" style={{ gap: '1rem' }}>
          {items.map((a) => (
            <AnnouncementCard key={a.id} announcement={a} actions={isAdmin && (
              <>
                <Button size="sm" variant="secondary" onClick={() => setEditing({ id: a.id, title: a.title, description: a.description, category: a.category, priority: a.priority })}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => setDeleteId(a.id)}>Delete</Button>
              </>
            )} />
          ))}
        </div>
      )}

      {editing && (
        <Modal title={editing.id ? 'Edit Announcement' : 'Publish Announcement'} onClose={() => setEditing(null)}>
          <form onSubmit={save}>
            <Field label="Title"><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></Field>
            <Field label="Description"><Textarea rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></Field>
            <div className="grid grid-cols-2" style={{ gap: 12 }}>
              <Field label="Category"><Select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
              <Field label="Priority"><Select value={editing.priority} onChange={(e) => setEditing({ ...editing, priority: e.target.value })}>{PRIORITIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit" disabled={busy}>Save</Button>
            </div>
          </form>
        </Modal>
      )}

      {deleteId && (
        <Modal title="Delete this announcement?" maxWidth="26rem" onClose={() => setDeleteId(null)}
          footer={<><Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button><Button variant="danger" disabled={busy} onClick={confirmDelete}>Delete</Button></>}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>This action cannot be undone.</p>
        </Modal>
      )}
    </>
  );
}
