import { Link } from 'react-router-dom';
import { Card, ComplaintCard, ErrorState, Loading, PageHeader, StatCard, StatusBadge } from '../../components/ui.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { api } from '../../api/client.js';
import { byNewest, isDone } from '../../utils/format.js';

export default function AdminDashboard() {
  const { data: c, loading, error, reload } = useFetch(() => api.complaints.list());
  if (loading && !c) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const stats = {
    total: c.length,
    pending: c.filter((x) => x.status === 'Pending').length,
    progress: c.filter((x) => x.status === 'In Progress').length,
    resolved: c.filter((x) => isDone(x.status)).length,
    high: c.filter((x) => x.priority === 'High' || x.priority === 'Emergency').length,
  };
  const emergency = c.filter((x) => x.priority === 'Emergency' && x.status !== 'Closed');
  const recent = [...c].sort(byNewest()).slice(0, 5);

  return (
    <>
      <PageHeader title="Good morning, Admin" subtitle="Here's your society maintenance overview." />
      <div className="grid stat-grid-5" style={{ gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Total Complaints" value={stats.total} />
        <StatCard label="Pending" value={stats.pending} tone="warning" />
        <StatCard label="In Progress" value={stats.progress} />
        <StatCard label="Resolved" value={stats.resolved} tone="success" />
        <StatCard label="High Priority" value={stats.high} tone="emergency" />
      </div>

      {emergency.length > 0 && (
        <Card style={{ borderColor: 'var(--emergency)', background: 'var(--emergency-bg)', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--emergency)' }}>
            &#9888; {emergency.length} emergency complaint{emergency.length > 1 ? 's' : ''} need attention
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {emergency.map((x) => (
              <Link key={x.id} to={`/admin/complaints/${x.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card)', borderRadius: '0.65rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}>
                <span className="truncate">{x.title}</span><StatusBadge status={x.status} />
              </Link>
            ))}
          </div>
        </Card>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <h2 className="font-display font-bold">Recent complaints</h2>
        <Link to="/admin/complaints" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--primary)' }}>View all</Link>
      </div>
      <div className="grid sm-2col" style={{ gap: '0.75rem' }}>
        {recent.map((x) => <ComplaintCard key={x.id} complaint={x} to={`/admin/complaints/${x.id}`} />)}
      </div>
    </>
  );
}
