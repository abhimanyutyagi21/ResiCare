export function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
export function fmtDateTime(iso) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ', ' +
    d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
  );
}
export const byNewest = (field = 'createdAt') => (a, b) => new Date(b[field]) - new Date(a[field]);

export const CATEGORIES = ['Plumbing', 'Electrical', 'Lift', 'Carpentry', 'Cleaning', 'Security', 'Parking', 'Other'];
export const PRIORITIES = ['Low', 'Medium', 'High', 'Emergency'];
export const STATUSES = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
export const SPECIALIZATIONS = ['Electrician', 'Plumber', 'Carpenter', 'Cleaner', 'Lift Technician'];
export const isDone = (status) => status === 'Resolved' || status === 'Closed';
