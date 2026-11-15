import { Card, EmptyState, ErrorState, Loading, PageHeader, Stars } from '../../components/ui.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { api } from '../../api/client.js';
import { byNewest, fmtDate } from '../../utils/format.js';

export default function ResidentFeedback() {
  const { data, loading, error, reload } = useFetch(() => api.feedback.list());
  const items = [...(data || [])].sort(byNewest('date'));

  return (
    <>
      <PageHeader title="Feedback" subtitle="Feedback you've submitted for resolved complaints." />
      {loading && !data ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : items.length === 0 ? (
        <EmptyState title="No feedback yet" message="Once a complaint is closed, you can rate the service here." icon="feedback" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map((f) => (
            <Card key={f.id}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{f.complaintTitle || f.complaintId}</p>
                <div style={{ display: 'flex' }}><Stars rating={f.rating} /></div>
              </div>
              {f.comment && <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>{f.comment}</p>}
              <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--muted)' }}>{fmtDate(f.date)}</p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
