import { ComplaintCard, EmptyState, ErrorState, Loading, PageHeader, StatCard } from '../../components/ui.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { api } from '../../api/client.js';
import { byNewest, isDone } from '../../utils/format.js';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const { data: mine, loading, error, reload } = useFetch(() => api.complaints.list());
  if (loading && !mine) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const stats = {
    assigned: mine.filter((c) => c.status === 'Assigned').length,
    progress: mine.filter((c) => c.status === 'In Progress').length,
    resolved: mine.filter((c) => isDone(c.status)).length,
  };
  const active = mine.filter((c) => c.status !== 'Closed').sort(byNewest('updatedAt'));

  return (
    <>
      <PageHeader title={`Hello, ${user.name.split(' ')[0]}`} subtitle="Here are the complaints assigned to you." />
      <div className="grid grid-cols-3" style={{ gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Assigned" value={stats.assigned} tone="warning" />
        <StatCard label="In Progress" value={stats.progress} />
        <StatCard label="Resolved" value={stats.resolved} tone="success" />
      </div>
      <h2 className="font-display font-bold" style={{ marginBottom: '0.75rem' }}>Your tasks</h2>
      {active.length === 0 ? (
        <EmptyState title="No tasks assigned yet" message="New work will appear here." icon="complaints" />
      ) : (
        <div className="grid sm-2col" style={{ gap: '0.75rem' }}>
          {active.map((c) => <ComplaintCard key={c.id} complaint={c} to={`/worker/complaints/${c.id}`} />)}
        </div>
      )}
    </>
  );
}
