import { Card, EmptyState, ErrorState, Loading, PageHeader, StatCard, Stars } from '../../components/ui.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { api } from '../../api/client.js';
import { byNewest, fmtDate } from '../../utils/format.js';

export default function AdminFeedback() {
  const { data, loading, error, reload } = useFetch(() => api.feedback.list());
  if (loading && !data) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const sorted = [...data].sort(byNewest('date'));
  const avg = data.length ? (data.reduce((s, f) => s + f.rating, 0) / data.length).toFixed(1) : '\u2014';

  return (
    <>
      <PageHeader title="Feedback" subtitle="What residents are saying about resolved complaints." />
      <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '1.5rem', maxWidth: '28rem' }}>
        <StatCard label="Total Feedback" value={data.length} />
        <StatCard label="Average Rating" value={avg} tone="success" />
      </div>
      {sorted.length === 0 ? (
        <EmptyState title="No feedback yet" message="Feedback submitted by residents will appear here." icon="feedback" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sorted.map((f) => (
            <Card key={f.id}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{f.complaintTitle || f.complaintId}</p>
                <div style={{ display: 'flex' }}><Stars rating={f.rating} /></div>
              </div>
              <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--muted)' }}>{f.residentName || ''} &middot; {fmtDate(f.date)}</p>
              {f.comment && <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>{f.comment}</p>}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
