import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { Button, Card, EmptyState, ErrorState, Loading, Modal, PriorityBadge, StatusBadge, Stars, Textarea, Timeline, UserAvatar } from '../../components/ui.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { api } from '../../api/client.js';
import { PRIORITIES, STATUSES, fmtDate, fmtDateTime } from '../../utils/format.js';
import { assetUrl } from '../../utils/media.js';

const mediaStyle = { width: 140, height: 140, objectFit: 'cover', borderRadius: '0.65rem', border: '1px solid var(--border)' };
const metaRow = { display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' };

export default function ComplaintDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const role = user.role;
  const toast = useToast();
  const basePath = `/${role}/complaints`;

  const { data: c, loading, error, reload } = useFetch(() => api.complaints.get(id), [id]);
  const workers = useFetch(() => (role === 'admin' ? api.users.workers() : Promise.resolve([])), [role]);
  const [modal, setModal] = useState(null); // 'assign' | 'priority' | 'status' | null
  const [busy, setBusy] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  async function run(fn, message) {
    setBusy(true);
    try {
      await fn();
      toast(message);
      setModal(null);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  if (loading && !c) return <Loading />;
  if (error?.status === 404 || error?.status === 403) {
    return <EmptyState title="Complaint not found" message="This complaint may have been removed." actionLabel="Back to complaints" actionTo={basePath} />;
  }
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (!c) return null;

  const gaveFeedback = !!c.feedback;
  const attachments = c.attachments || [];

  return (
    <>
      <Link to={basePath} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 500, marginBottom: '1.25rem', color: 'var(--text-secondary)' }}>
        <Icon name="chevron" size={15} style={{ transform: 'rotate(180deg)' }} /> Back
      </Link>

      <div className="details-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: '0.25rem' }}>
              <p className="font-mono text-xs" style={{ color: 'var(--muted)' }}>{c.id}</p>
              <StatusBadge status={c.status} />
            </div>
            <h1 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{c.title}</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: '0.75rem' }}>
              <PriorityBadge priority={c.priority} />
              <span style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: '0.5rem', background: 'var(--chip-bg)', color: 'var(--text-secondary)' }}>{c.category}</span>
            </div>
            <div className="grid sm-2col" style={{ gap: '1rem', marginTop: '1.25rem', fontSize: '0.875rem' }}>
              <div style={metaRow}><Icon name="location" size={15} /> {c.tower}-{c.flat}{c.floor ? `, Floor ${c.floor}` : ''}</div>
              <div style={metaRow}><Icon name="calendar" size={15} /> {fmtDate(c.createdAt)}</div>
              <div style={metaRow}><Icon name="user" size={15} /> {c.residentName}</div>
              <div style={metaRow}><Icon name="user" size={15} /> {c.assignedWorkerName ? `Assigned to ${c.assignedWorkerName}` : 'Not yet assigned'}</div>
            </div>
            <p style={{ marginTop: '1.25rem', fontSize: '0.875rem', lineHeight: 1.6 }}>{c.description}</p>
            {attachments.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '1rem' }}>
                {attachments.map((a, i) => a.type === 'video'
                  ? <video key={i} src={assetUrl(a.url)} controls style={mediaStyle} />
                  : <a key={i} href={assetUrl(a.url)} target="_blank" rel="noreferrer"><img src={assetUrl(a.url)} alt="Proof" style={mediaStyle} /></a>)}
              </div>
            )}
          </Card>

          <Card>
            <h3 className="font-display font-bold text-sm" style={{ marginBottom: '0.75rem' }}>Status</h3>
            <Timeline status={c.status} />
          </Card>

          <Card>
            <h3 className="font-display font-bold text-sm" style={{ marginBottom: '1rem' }}>Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {c.activity.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 9999, marginTop: 6, flexShrink: 0, background: 'var(--primary)' }} />
                  <div><p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{fmtDateTime(a.date)}</p><p style={{ fontSize: '0.875rem' }}>{a.text}</p></div>
                </div>
              ))}
            </div>
          </Card>

          {role === 'resident' && c.status === 'Closed' && !gaveFeedback && (
            <Card>
              <h3 className="font-display font-bold" style={{ marginBottom: '0.25rem' }}>How was the service?</h3>
              <p style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Your feedback helps the society improve.</p>
              <form onSubmit={(e) => { e.preventDefault(); run(() => api.complaints.feedback(c.id, { rating, comment: comment.trim() }), 'Feedback submitted'); }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: '1rem' }}><Stars rating={rating} onChange={setRating} /></div>
                <Textarea rows={3} placeholder="Optional comment" value={comment} onChange={(e) => setComment(e.target.value)} />
                <Button type="submit" disabled={busy} style={{ marginTop: '0.75rem' }}>Submit Feedback</Button>
              </form>
            </Card>
          )}
          {role === 'resident' && gaveFeedback && (
            <Card><p style={{ fontSize: '0.875rem', color: 'var(--success)' }}>&#10003; Thanks &mdash; you've already submitted feedback for this complaint.</p></Card>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {role === 'admin' && (
            <Card>
              <h3 className="font-display font-bold text-sm" style={{ marginBottom: '0.75rem' }}>Admin actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Button variant="secondary" style={{ width: '100%' }} onClick={() => setModal('assign')}>{c.assignedWorkerId ? 'Reassign Worker' : 'Assign Worker'}</Button>
                <Button variant="secondary" style={{ width: '100%' }} onClick={() => setModal('priority')}>Change Priority</Button>
                <Button variant="secondary" style={{ width: '100%' }} onClick={() => setModal('status')}>Update Status</Button>
              </div>
            </Card>
          )}
          {role === 'worker' && c.status === 'Assigned' && (
            <Card><Button style={{ width: '100%' }} disabled={busy} onClick={() => run(() => api.complaints.start(c.id), 'Status updated')}>Start Work</Button></Card>
          )}
          {role === 'worker' && c.status === 'In Progress' && (
            <Card><Button style={{ width: '100%' }} disabled={busy} onClick={() => run(() => api.complaints.resolve(c.id), 'Status updated')}>Mark Resolved</Button></Card>
          )}
          {role === 'resident' && c.status === 'Resolved' && (
            <Card>
              <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>The worker has marked this issue as resolved. Please confirm once you've checked it.</p>
              <Button style={{ width: '100%' }} disabled={busy} onClick={() => run(() => api.complaints.confirm(c.id), 'Resolution confirmed')}>Confirm Resolution</Button>
            </Card>
          )}
        </div>
      </div>

      {modal === 'assign' && (
        <Modal title="Assign Worker" onClose={() => setModal(null)}>
          {(workers.data || []).map((w) => (
            <div key={w.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border)', borderRadius: '0.65rem', padding: '0.6rem 0.75rem', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <UserAvatar name={w.name} size={30} />
                <div><p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{w.name}</p><p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{w.specialization || ''}</p></div>
              </div>
              <Button size="sm" disabled={busy} onClick={() => run(() => api.complaints.assign(c.id, w.id), 'Worker assigned successfully')}>Assign</Button>
            </div>
          ))}
        </Modal>
      )}
      {modal === 'priority' && (
        <Modal title="Change Priority" onClose={() => setModal(null)}>
          <div className="grid grid-cols-2" style={{ gap: 8 }}>
            {PRIORITIES.map((p) => (
              <button key={p} type="button" disabled={busy} onClick={() => run(() => api.complaints.setPriority(c.id, p), 'Priority updated')}
                style={{ border: '1px solid var(--border)', borderRadius: '0.65rem', padding: '0.6rem' }}><PriorityBadge priority={p} /></button>
            ))}
          </div>
        </Modal>
      )}
      {modal === 'status' && (
        <Modal title="Update Status" onClose={() => setModal(null)}>
          <div className="grid grid-cols-2" style={{ gap: 8 }}>
            {STATUSES.map((s) => (
              <button key={s} type="button" disabled={busy} onClick={() => run(() => api.complaints.setStatus(c.id, s), 'Status updated')}
                style={{ border: '1px solid var(--border)', borderRadius: '0.65rem', padding: '0.6rem' }}><StatusBadge status={s} /></button>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}
