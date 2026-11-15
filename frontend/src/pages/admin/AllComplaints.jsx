import { useMemo, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { Button, Card, ComplaintCard, EmptyState, ErrorState, Input, Loading, PageHeader, PriorityBadge, Select, StatusBadge } from '../../components/ui.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { api } from '../../api/client.js';
import { CATEGORIES, PRIORITIES, STATUSES, byNewest, fmtDate } from '../../utils/format.js';

export default function AllComplaints() {
  const { data, loading, error, reload } = useFetch(() => api.complaints.list());
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [category, setCategory] = useState('All');
  const [priority, setPriority] = useState('All');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data || [])
      .filter((c) =>
        (status === 'All' || c.status === status) &&
        (category === 'All' || c.category === category) &&
        (priority === 'All' || c.priority === priority) &&
        (!q || c.id.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.residentName.toLowerCase().includes(q)))
      .sort(byNewest());
  }, [data, search, status, category, priority]);

  return (
    <>
      <PageHeader title="All Complaints" />
      <Card style={{ marginBottom: '1.25rem' }}>
        <div className="grid filter-bar-grid" style={{ gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}><Icon name="search" size={15} /></span>
            <Input style={{ paddingLeft: '2.25rem' }} placeholder="Search ID, title, resident" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>{['All', ...STATUSES].map((s) => <option key={s}>{s}</option>)}</Select>
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>{['All', ...CATEGORIES].map((s) => <option key={s}>{s}</option>)}</Select>
          <Select value={priority} onChange={(e) => setPriority(e.target.value)}>{['All', ...PRIORITIES].map((s) => <option key={s}>{s}</option>)}</Select>
        </div>
      </Card>

      {loading && !data ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : (
        <>
          <p style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>{filtered.length} complaint{filtered.length !== 1 ? 's' : ''} found</p>
          {filtered.length === 0 ? (
            <EmptyState title="No complaints match" message="Try adjusting your filters." />
          ) : (
            <>
              <div className="table-wrap lg-only bg-white rounded-xl border">
                <table className="data-table">
                  <thead><tr>{['ID', 'Issue', 'Resident', 'Category', 'Priority', 'Status', 'Worker', 'Date', ''].map((h) => <th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {filtered.map((c) => (
                      <tr key={c.id}>
                        <td className="font-mono text-xs">{c.id}</td>
                        <td className="truncate" style={{ maxWidth: 220 }}>{c.title}</td>
                        <td>{c.residentName}</td>
                        <td>{c.category}</td>
                        <td><PriorityBadge priority={c.priority} /></td>
                        <td><StatusBadge status={c.status} /></td>
                        <td>{c.assignedWorkerName || '\u2014'}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(c.createdAt)}</td>
                        <td><Button size="sm" variant="secondary" to={`/admin/complaints/${c.id}`}>View</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid lg-hidden" style={{ gap: '0.75rem' }}>
                {filtered.map((c) => <ComplaintCard key={c.id} complaint={c} to={`/admin/complaints/${c.id}`} />)}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
