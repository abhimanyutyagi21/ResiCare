import { Link } from 'react-router-dom';
import { AnnouncementCard, Button, ComplaintCard, EmptyState, ErrorState, Loading, PageHeader, StatCard } from '../../components/ui.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { api } from '../../api/client.js';
import { byNewest, isDone } from '../../utils/format.js';

export default function ResidentDashboard() {
  const { user } = useAuth();
  const complaints = useFetch(() => api.complaints.list());
  const announcements = useFetch(() => api.announcements.list());

  if (complaints.loading && !complaints.data) return <Loading />;
  if (complaints.error) return <ErrorState error={complaints.error} onRetry={complaints.reload} />;

  const mine = complaints.data;
  const stats = {
    active: mine.filter((c) => !isDone(c.status)).length,
    pending: mine.filter((c) => c.status === 'Pending').length,
    progress: mine.filter((c) => c.status === 'In Progress').length,
    resolved: mine.filter((c) => isDone(c.status)).length,
  };
  const recent = [...mine].sort(byNewest()).slice(0, 4);
  const recentAnn = [...(announcements.data || [])].sort(byNewest()).slice(0, 2);

  return (
    <>
      <PageHeader
        title={`Good morning, ${user.name.split(' ')[0]}`}
        subtitle="Here's what's happening with your complaints and society."
        action={<Button icon="plus" to="/resident/complaints/new">Report an Issue</Button>}
      />
      <div className="grid stat-grid" style={{ gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Active Complaints" value={stats.active} />
        <StatCard label="Pending" value={stats.pending} tone="warning" />
        <StatCard label="In Progress" value={stats.progress} />
        <StatCard label="Resolved" value={stats.resolved} tone="success" />
      </div>
      <div className="dash-grid">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h2 className="font-display font-bold">Recent complaints</h2>
            <Link to="/resident/complaints" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--primary)' }}>View all</Link>
          </div>
          {recent.length === 0 ? (
            <EmptyState title="No complaints yet" message="Report an issue and it will appear here." actionLabel="Report an Issue" actionTo="/resident/complaints/new" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recent.map((c) => <ComplaintCard key={c.id} complaint={c} to={`/resident/complaints/${c.id}`} />)}
            </div>
          )}
        </div>
        <div>
          <h2 className="font-display font-bold" style={{ marginBottom: '0.75rem' }}>Announcements</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentAnn.map((a) => <AnnouncementCard key={a.id} announcement={a} />)}
            <Button variant="secondary" to="/resident/announcements" style={{ width: '100%' }}>View All Announcements</Button>
          </div>
        </div>
      </div>
    </>
  );
}
