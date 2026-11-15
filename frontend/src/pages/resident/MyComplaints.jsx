import { useState } from 'react';
import { Button, ComplaintCard, EmptyState, ErrorState, Loading, PageHeader } from '../../components/ui.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { api } from '../../api/client.js';
import { byNewest } from '../../utils/format.js';

const FILTERS = ['All', 'Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

export default function MyComplaints() {
  const [filter, setFilter] = useState('All');
  const { data, loading, error, reload } = useFetch(() => api.complaints.list());

  const filtered = (data || []).filter((c) => filter === 'All' || c.status === filter).sort(byNewest());

  return (
    <>
      <PageHeader title="My Complaints" subtitle="All the issues you've reported."
        action={<Button icon="plus" to="/resident/complaints/new">Report an Issue</Button>} />
      <div className="filter-pills">
        {FILTERS.map((s) => <button key={s} type="button" className={`pill${s === filter ? ' active' : ''}`} onClick={() => setFilter(s)}>{s}</button>)}
      </div>
      {loading && !data ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : filtered.length === 0 ? (
        <EmptyState title="Nothing to show yet" message="Report your first issue and track it here." actionLabel="Report an Issue" actionTo="/resident/complaints/new" />
      ) : (
        <div className="grid sm-2col" style={{ gap: '0.75rem' }}>
          {filtered.map((c) => <ComplaintCard key={c.id} complaint={c} to={`/resident/complaints/${c.id}`} />)}
        </div>
      )}
    </>
  );
}
