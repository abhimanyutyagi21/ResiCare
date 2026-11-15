import { useState } from 'react';
import { ComplaintCard, EmptyState, ErrorState, Loading, PageHeader } from '../../components/ui.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { api } from '../../api/client.js';
import { byNewest } from '../../utils/format.js';

const FILTERS = ['All', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

export default function AssignedComplaints() {
  const [filter, setFilter] = useState('All');
  const { data, loading, error, reload } = useFetch(() => api.complaints.list());
  const items = (data || []).filter((c) => filter === 'All' || c.status === filter).sort(byNewest('updatedAt'));

  return (
    <>
      <PageHeader title="Assigned Complaints" subtitle="Everything assigned to you." />
      <div className="filter-pills">
        {FILTERS.map((s) => <button key={s} type="button" className={`pill${s === filter ? ' active' : ''}`} onClick={() => setFilter(s)}>{s}</button>)}
      </div>
      {loading && !data ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : items.length === 0 ? (
        <EmptyState title="No tasks assigned yet" message="New work will appear here." icon="complaints" />
      ) : (
        <div className="grid sm-2col" style={{ gap: '0.75rem' }}>
          {items.map((c) => <ComplaintCard key={c.id} complaint={c} to={`/worker/complaints/${c.id}`} />)}
        </div>
      )}
    </>
  );
}
