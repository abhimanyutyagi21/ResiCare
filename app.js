
/* APP SHELL */
const NAV_ITEMS = {
  resident: [
    ['Dashboard', 'dashboard', '#/resident/dashboard'],
    ['My Complaints', 'complaints', '#/resident/complaints'],
    ['Report Issue', 'plus', '#/resident/complaints/new'],
    ['Announcements', 'announcement', '#/resident/announcements'],
    ['Feedback', 'feedback', '#/resident/feedback'],
    ['Profile', 'profile', '#/profile'],
    ['Settings', 'settings', '#/settings'],
  ],
  admin: [
    ['Dashboard', 'dashboard', '#/admin/dashboard'],
    ['Complaints', 'complaints', '#/admin/complaints'],
    ['Announcements', 'announcement', '#/admin/announcements'],
    ['Gate Entry', 'gate', '#/admin/gate-entry'],
    ['Feedback', 'feedback', '#/admin/feedback'],
    ['Profile', 'profile', '#/profile'],
    ['Settings', 'settings', '#/settings'],
  ],
  worker: [
    ['Dashboard', 'dashboard', '#/worker/dashboard'],
    ['Assigned Complaints', 'complaints', '#/worker/complaints'],
    ['Profile', 'profile', '#/profile'],
    ['Settings', 'settings', '#/settings'],
  ],
};
function AppShell(role, activePath, contentHtml) {
  const items = NAV_ITEMS[role];
  const navLinks = items.map(([label, icon, path]) => {
    const active = activePath === path;
    return `<a data-nav="${path}" class="sidebar-link${active ? ' active' : ''}">${Icon(icon, 17)}<span>${label}</span></a>`;
  }).join('');
  const sidebarInner = `
    <div style="padding:1.25rem;display:flex;align-items:center;gap:8px;">
      <div class="brand-mark">R</div><span class="font-display font-extrabold text-lg">ResiCare</span>
    </div>
    <nav class="sidebar-nav">${navLinks}</nav>
    <div class="sidebar-footer">
      <div style="display:flex;align-items:center;gap:10px;padding:0.5rem;margin-bottom:0.25rem;">
        ${UserAvatar(Store.session.name, 32)}
        <div style="min-width:0;flex:1;">
          <p class="truncate" style="font-size:0.875rem;font-weight:500;">${esc(Store.session.name)}</p>
          <p class="capitalize" style="font-size:0.75rem;color:var(--muted);">${esc(Store.session.role)}</p>
        </div>
        ${themeToggleButton()}
      </div>
      <button data-action="logout" class="sidebar-link" style="width:100%;text-align:left;color:var(--error);">${Icon('logout', 17)}<span>Logout</span></button>
    </div>`;
  return `<div style="min-height:100vh;display:flex;background:var(--bg);">
    <aside class="app-sidebar lg-only">${sidebarInner}</aside>
    <div id="mobile-sidebar-overlay" class="mobile-overlay hidden">
      <div class="mobile-overlay-bg" data-action="close-mobile-menu"></div>
      <div class="app-sidebar anim-fade" style="position:relative;width:280px;">${sidebarInner}</div>
    </div>
    <div style="flex:1;min-width:0;display:flex;flex-direction:column;">
      <header class="mobile-topbar">
        <button data-action="open-mobile-menu" class="focus-ring" style="padding:6px;border-radius:0.5rem;">${Icon('menu', 20)}</button>
        <span class="font-display font-bold">ResiCare</span>
        <div style="display:flex;align-items:center;gap:8px;">${themeToggleButton()}${UserAvatar(Store.session.name, 28)}</div>
      </header>
      <main class="app-main anim-page">${contentHtml}</main>
    </div>
  </div>`;
}

/* LANDING PAGE */
let newComplaintAttachments = [];
function newComplaintPage() {
  newComplaintAttachments = [];
  const me = Store.users.find((u) => u.id === Store.session.userId) || {};
  const categories = ['Plumbing', 'Electrical', 'Lift', 'Carpentry', 'Cleaning', 'Security', 'Parking', 'Other'];
  const content = `${PageHeader('Report an Issue', 'Tell us what needs attention.')}
  ${Card(`<form id="complaint-form">
    ${fieldWrap('Issue Title', `<input class="input" style="${inputStyle()}" id="c-title" placeholder="e.g. Kitchen tap leaking">`, 'err-c-title')}
    <div class="grid sm-2col" style="gap:1rem;">
      ${fieldWrap('Category', `<select class="input" style="${inputStyle()}" id="c-category">${categories.map((c) => `<option>${c}</option>`).join('')}</select>`)}
      ${fieldWrap('Priority', `<select class="input" style="${inputStyle()}" id="c-priority">${['Low', 'Medium', 'High', 'Emergency'].map((p) => `<option>${p}</option>`).join('')}</select>`)}
    </div>
    ${fieldWrap('Description', `<textarea class="input" style="${inputStyle()}" id="c-description" rows="4" placeholder="Describe the issue in detail"></textarea>`, 'err-c-description')}
    ${fieldWrap('Location', `<div class="grid" style="grid-template-columns:repeat(3,1fr);gap:12px;">
      <input class="input" style="${inputStyle()}" id="c-tower" placeholder="Tower" value="${esc(me.tower || '')}">
      <input class="input" style="${inputStyle()}" id="c-floor" placeholder="Floor">
      <input class="input" style="${inputStyle()}" id="c-flat" placeholder="Flat" value="${esc(me.flat || '')}">
    </div>`, 'err-c-location')}
    ${fieldWrap('Proof (photo or video) — required', `<label class="upload-box">${Icon('image', 17)} Upload photo(s) or video(s) of the issue<input type="file" accept="image/*,video/*" multiple id="c-attachments" class="hidden"></label>
      <div id="c-attachments-preview" style="display:flex;flex-wrap:wrap;gap:0.6rem;margin-top:0.75rem;"></div>`, 'err-c-attachments')}
    <div style="display:flex;gap:12px;margin-top:0.5rem;">
      ${Button({ label: 'Submit Complaint', extraAttrs: 'type="submit"' })}
      ${Button({ label: 'Cancel', variant: 'secondary', extraAttrs: 'type="button" data-nav="#/resident/dashboard"' })}
    </div>
  </form>`, 'max-width:42rem;margin:0 auto;')}`;
  return AppShell('resident', '#/resident/complaints/new', content);
}
function mountNewComplaint() {
  const preview = document.getElementById('c-attachments-preview');
  const renderPreview = () => {
    preview.innerHTML = newComplaintAttachments.map((a, i) => `
      <div style="position:relative;width:88px;height:88px;">
        ${a.type === 'video'
          ? `<video src="${a.url}" style="width:100%;height:100%;object-fit:cover;border-radius:0.6rem;border:1px solid var(--border);"></video>`
          : `<img src="${a.url}" style="width:100%;height:100%;object-fit:cover;border-radius:0.6rem;border:1px solid var(--border);">`}
        <button type="button" data-remove-attachment="${i}" style="position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:9999px;border:none;background:var(--error);color:#fff;font-size:0.7rem;line-height:1;cursor:pointer;">&times;</button>
      </div>`).join('');
  };
  document.getElementById('c-attachments').addEventListener('change', async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      const isVideo = file.type.startsWith('video/');
      const url = isVideo ? await readFileAsDataURL(file) : await resizeImage(file);
      newComplaintAttachments.push({ type: isVideo ? 'video' : 'image', url });
    }
    e.target.value = '';
    const errEl = document.getElementById('err-c-attachments');
    if (newComplaintAttachments.length) errEl.style.display = 'none';
    renderPreview();
  });
  preview.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-remove-attachment]');
    if (!btn) return;
    newComplaintAttachments.splice(parseInt(btn.dataset.removeAttachment, 10), 1);
    renderPreview();
  });
  document.getElementById('complaint-form').addEventListener('submit', (e) => {
    e.preventDefault();
    ['err-c-title', 'err-c-description', 'err-c-location', 'err-c-attachments'].forEach((id) => { const el = document.getElementById(id); el.style.display = 'none'; });
    const title = document.getElementById('c-title').value.trim();
    const description = document.getElementById('c-description').value.trim();
    const tower = document.getElementById('c-tower').value.trim();
    const flat = document.getElementById('c-flat').value.trim();
    let hasError = false;
    if (!title) { const el = document.getElementById('err-c-title'); el.textContent = 'Please enter a title for the issue.'; el.style.display = 'block'; hasError = true; }
    if (!description) { const el = document.getElementById('err-c-description'); el.textContent = 'Please enter a description.'; el.style.display = 'block'; hasError = true; }
    if (!tower || !flat) { const el = document.getElementById('err-c-location'); el.textContent = 'Please enter tower and flat.'; el.style.display = 'block'; hasError = true; }
    if (!newComplaintAttachments.length) { const el = document.getElementById('err-c-attachments'); el.textContent = 'Please attach at least one photo or video as proof — this helps us verify genuine complaints.'; el.style.display = 'block'; hasError = true; }
    if (hasError) return;
    const c = Store.addComplaint({
      title, description, tower, flat,
      floor: document.getElementById('c-floor').value.trim(),
      category: document.getElementById('c-category').value,
      priority: document.getElementById('c-priority').value,
      attachments: newComplaintAttachments,
      residentId: Store.session.userId, residentName: Store.session.name,
    });
    showToast(`Complaint submitted successfully \u2014 ${c.id}`);
    navigate(`#/resident/complaints/${c.id}`);
  });
}

/* ============================= COMPLAINT DETAILS (shared) ============================= */
function complaintDetailsPage(role, id) {
  const c = Store.complaints.find((x) => x.id === id);
  const basePath = role === 'resident' ? '#/resident/complaints' : role === 'admin' ? '#/admin/complaints' : '#/worker/complaints';
  if (!c) return AppShell(role, basePath, EmptyState({ title: 'Complaint not found', message: 'This complaint may have been removed.', actionLabel: 'Back to complaints', actionNav: basePath }));
  const alreadyGaveFeedback = Store.feedbacks.some((f) => f.complaintId === c.id);

  const activityHtml = c.activity.map((a) => `<div style="display:flex;gap:12px;">
    <div style="width:6px;height:6px;border-radius:9999px;margin-top:6px;flex-shrink:0;background:var(--primary);"></div>
    <div><p style="font-size:0.75rem;color:var(--muted);">${fmtDateTime(a.date)}</p><p style="font-size:0.875rem;">${esc(a.text)}</p></div>
  </div>`).join('<div style="height:1rem;"></div>');

  let feedbackBlock = '';
  if (role === 'resident' && c.status === 'Closed' && !alreadyGaveFeedback) {
    feedbackBlock = Card(`<h3 class="font-display font-bold" style="margin-bottom:0.25rem;">How was the service?</h3>
      <p style="font-size:0.875rem;margin-bottom:1rem;color:var(--text-secondary);">Your feedback helps the society improve.</p>
      <form id="feedback-form">
        <div style="display:flex;gap:4px;margin-bottom:1rem;" id="rating-stars">${starsHtml(5, true)}</div>
        <input type="hidden" id="fb-rating" value="5">
        <textarea class="input" style="${inputStyle()}" id="fb-comment" rows="3" placeholder="Optional comment"></textarea>
        ${Button({ label: 'Submit Feedback', extraAttrs: 'type="submit" style="margin-top:0.75rem;"' })}
      </form>`);
  } else if (role === 'resident' && alreadyGaveFeedback) {
    feedbackBlock = Card(`<p style="font-size:0.875rem;color:var(--success);">&#10003; Thanks &mdash; you've already submitted feedback for this complaint.</p>`);
  }

  let sideActions = '';
  if (role === 'admin') {
    sideActions = Card(`<h3 class="font-display font-bold text-sm" style="margin-bottom:0.75rem;">Admin actions</h3>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${Button({ label: c.assignedWorkerId ? 'Reassign Worker' : 'Assign Worker', variant: 'secondary', extraAttrs: 'style="width:100%" data-action="open-modal" data-modal="assign-modal"' })}
        ${Button({ label: 'Change Priority', variant: 'secondary', extraAttrs: 'style="width:100%" data-action="open-modal" data-modal="priority-modal"' })}
        ${Button({ label: 'Update Status', variant: 'secondary', extraAttrs: 'style="width:100%" data-action="open-modal" data-modal="status-modal"' })}
      </div>`);
  } else if (role === 'worker' && c.status === 'Assigned') {
    sideActions = Card(Button({ label: 'Start Work', extraAttrs: `style="width:100%" data-action="start-work" data-id="${c.id}"` }));
  } else if (role === 'worker' && c.status === 'In Progress') {
    sideActions = Card(Button({ label: 'Mark Resolved', extraAttrs: `style="width:100%" data-action="mark-resolved" data-id="${c.id}"` }));
  } else if (role === 'resident' && c.status === 'Resolved') {
    sideActions = Card(`<p style="font-size:0.875rem;margin-bottom:0.75rem;color:var(--text-secondary);">The worker has marked this issue as resolved. Please confirm once you've checked it.</p>
      ${Button({ label: 'Confirm Resolution', extraAttrs: `style="width:100%" data-action="confirm-resolution" data-id="${c.id}"` })}`);
  }

  const workerOptions = Store.workers().map((w) => `<div style="display:flex;align-items:center;justify-content:space-between;border:1px solid var(--border);border-radius:0.65rem;padding:0.6rem 0.75rem;margin-bottom:8px;">
    <div style="display:flex;align-items:center;gap:10px;">${UserAvatar(w.name, 30)}<div><p style="font-size:0.875rem;font-weight:500;">${esc(w.name)}</p><p style="font-size:0.75rem;color:var(--muted);">${esc(w.specialization || '')}</p></div></div>
    ${Button({ label: 'Assign', size: 'sm', extraAttrs: `data-action="assign-worker" data-id="${c.id}" data-worker-id="${w.id}" data-worker-name="${esc(w.name)}"` })}
  </div>`).join('');
  const priorityOptions = ['Low', 'Medium', 'High', 'Emergency'].map((p) => `<button data-action="change-priority" data-id="${c.id}" data-value="${p}" style="border:1px solid var(--border);border-radius:0.65rem;padding:0.6rem;">${PriorityBadge(p)}</button>`).join('');
  const statusOptions = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'].map((s) => `<button data-action="change-status" data-id="${c.id}" data-value="${s}" style="border:1px solid var(--border);border-radius:0.65rem;padding:0.6rem;">${StatusBadge(s)}</button>`).join('');

  const content = `
  <a data-nav="${basePath}" style="display:inline-flex;align-items:center;gap:6px;font-size:0.875rem;font-weight:500;margin-bottom:1.25rem;color:var(--text-secondary);">${Icon('chevron', 15, 'transform:rotate(180deg);')} Back</a>
  <div class="details-grid">
    <div style="display:flex;flex-direction:column;gap:1.5rem;">
      ${Card(`<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:0.25rem;">
          <p class="font-mono text-xs" style="color:var(--muted);">${esc(c.id)}</p>${StatusBadge(c.status)}
        </div>
        <h1 class="font-display" style="font-size:1.25rem;font-weight:700;">${esc(c.title)}</h1>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:0.75rem;">${PriorityBadge(c.priority)}<span style="font-size:0.75rem;padding:0.3rem 0.6rem;border-radius:0.5rem;background:var(--chip-bg);color:var(--text-secondary);">${esc(c.category)}</span></div>
        <div class="grid sm-2col" style="gap:1rem;margin-top:1.25rem;font-size:0.875rem;">
          <div style="display:flex;align-items:center;gap:8px;color:var(--text-secondary);">${Icon('location', 15)} ${esc(c.tower)}-${esc(c.flat)}${c.floor ? `, Floor ${esc(c.floor)}` : ''}</div>
          <div style="display:flex;align-items:center;gap:8px;color:var(--text-secondary);">${Icon('calendar', 15)} ${fmtDate(c.createdAt)}</div>
          <div style="display:flex;align-items:center;gap:8px;color:var(--text-secondary);">${Icon('user', 15)} ${esc(c.residentName)}</div>
          <div style="display:flex;align-items:center;gap:8px;color:var(--text-secondary);">${Icon('user', 15)} ${c.assignedWorkerName ? `Assigned to ${esc(c.assignedWorkerName)}` : 'Not yet assigned'}</div>
        </div>
        <p style="margin-top:1.25rem;font-size:0.875rem;line-height:1.6;">${esc(c.description)}</p>
        ${c.attachments && c.attachments.length ? `<div style="display:flex;flex-wrap:wrap;gap:0.6rem;margin-top:1rem;">${c.attachments.map((a) => a.type === 'video'
          ? `<video src="${a.url}" controls style="width:140px;height:140px;object-fit:cover;border-radius:0.65rem;border:1px solid var(--border);"></video>`
          : `<img src="${a.url}" style="width:140px;height:140px;object-fit:cover;border-radius:0.65rem;border:1px solid var(--border);">`).join('')}</div>`
          : c.image ? `<img src="${c.image}" style="margin-top:1rem;border-radius:0.65rem;max-height:16rem;border:1px solid var(--border);">` : ''}`)}
      ${Card(`<h3 class="font-display font-bold text-sm" style="margin-bottom:0.75rem;">Status</h3>${Timeline(c.status)}`)}
      ${Card(`<h3 class="font-display font-bold text-sm" style="margin-bottom:1rem;">Activity</h3>${activityHtml}`)}
      ${feedbackBlock}
    </div>
    <div style="display:flex;flex-direction:column;gap:1rem;">${sideActions}</div>
  </div>

  <div class="modal-overlay hidden" id="assign-modal" data-modal-root>
    <div class="modal-box anim-modal"><div class="modal-head"><h3 class="font-display font-bold text-lg">Assign Worker</h3><button data-action="close-modal" data-modal="assign-modal">${Icon('x', 18)}</button></div><div class="modal-body">${workerOptions}</div></div>
  </div>
  <div class="modal-overlay hidden" id="priority-modal" data-modal-root>
    <div class="modal-box anim-modal"><div class="modal-head"><h3 class="font-display font-bold text-lg">Change Priority</h3><button data-action="close-modal" data-modal="priority-modal">${Icon('x', 18)}</button></div><div class="modal-body"><div class="grid grid-cols-2" style="gap:8px;">${priorityOptions}</div></div></div>
  </div>
  <div class="modal-overlay hidden" id="status-modal" data-modal-root>
    <div class="modal-box anim-modal"><div class="modal-head"><h3 class="font-display font-bold text-lg">Update Status</h3><button data-action="close-modal" data-modal="status-modal">${Icon('x', 18)}</button></div><div class="modal-body"><div class="grid grid-cols-2" style="gap:8px;">${statusOptions}</div></div></div>
  </div>`;

  return AppShell(role, basePath, content);
}
function mountComplaintDetails(role, id) {
  const fbForm = document.getElementById('feedback-form');
  if (fbForm) {
    const starsBox = document.getElementById('rating-stars');
    const ratingInput = document.getElementById('fb-rating');
    starsBox.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-star]');
      if (!btn) return;
      const value = parseInt(btn.dataset.star, 10);
      ratingInput.value = value;
      starsBox.querySelectorAll('.star-btn').forEach((b) => {
        b.style.color = parseInt(b.dataset.star, 10) <= value ? 'var(--warning)' : 'var(--star-empty)';
      });
    });
    fbForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const c = Store.complaints.find((x) => x.id === id);
      const rating = parseInt(ratingInput.value, 10) || 5;
      Store.addFeedback({ complaintId: c.id, residentId: c.residentId, rating, comment: document.getElementById('fb-comment').value.trim() });
      showToast('Feedback submitted');
      renderApp();
    });
  }
}

/* RESIDENT PAGES*/
function residentDashboardPage() {
  const mine = Store.complaints.filter((c) => c.residentId === Store.session.userId);
  const stats = {
    active: mine.filter((c) => !['Resolved', 'Closed'].includes(c.status)).length,
    pending: mine.filter((c) => c.status === 'Pending').length,
    progress: mine.filter((c) => c.status === 'In Progress').length,
    resolved: mine.filter((c) => ['Resolved', 'Closed'].includes(c.status)).length,
  };
  const recent = [...mine].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
  const recentAnn = [...Store.announcements].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 2);
  const content = `${PageHeader(`Good morning, ${Store.session.name.split(' ')[0]}`, "Here's what's happening with your complaints and society.",
    Button({ label: 'Report an Issue', icon: 'plus', extraAttrs: 'data-nav="#/resident/complaints/new"' }))}
    <div class="grid stat-grid" style="gap:1rem;margin-bottom:2rem;">
      ${StatCard('Active Complaints', stats.active)}${StatCard('Pending', stats.pending, 'warning')}${StatCard('In Progress', stats.progress)}${StatCard('Resolved', stats.resolved, 'success')}
    </div>
    <div class="dash-grid">
      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem;">
          <h2 class="font-display font-bold">Recent complaints</h2><a data-nav="#/resident/complaints" style="font-size:0.875rem;font-weight:500;color:var(--primary);">View all</a>
        </div>
        ${recent.length === 0 ? EmptyState({ title: 'No complaints yet', message: 'Report an issue and it will appear here.', actionLabel: 'Report an Issue', actionNav: '#/resident/complaints/new' })
      : `<div style="display:flex;flex-direction:column;gap:0.75rem;">${recent.map((c) => ComplaintCard(c, `#/resident/complaints/${c.id}`)).join('')}</div>`}
      </div>
      <div>
        <h2 class="font-display font-bold" style="margin-bottom:0.75rem;">Announcements</h2>
        <div style="display:flex;flex-direction:column;gap:0.75rem;">${recentAnn.map((a) => AnnouncementCard(a)).join('')}
          ${Button({ label: 'View All Announcements', variant: 'secondary', extraAttrs: 'style="width:100%" data-nav="#/resident/announcements"' })}
        </div>
      </div>
    </div>`;
  return AppShell('resident', '#/resident/dashboard', content);
}
function myComplaintsPage(filter) {
  filter = filter || 'All';
  const mine = Store.complaints.filter((c) => c.residentId === Store.session.userId);
  const statuses = ['All', 'Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
  const content = `${PageHeader('My Complaints', "All the issues you've reported.", Button({ label: 'Report an Issue', icon: 'plus', extraAttrs: 'data-nav="#/resident/complaints/new"' }))}
    <div class="filter-pills" id="my-complaints-filters">${statuses.map((s) => `<button data-action="mc-filter" data-value="${s}" class="pill${s === filter ? ' active' : ''}">${s}</button>`).join('')}</div>
    <div id="my-complaints-results"></div>`;
  return AppShell('resident', '#/resident/complaints', content);
}
function renderMyComplaintsResults(filter) {
  const mine = Store.complaints.filter((c) => c.residentId === Store.session.userId);
  const filtered = filter === 'All' ? mine : mine.filter((c) => c.status === filter);
  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const el = document.getElementById('my-complaints-results');
  el.innerHTML = sorted.length === 0
    ? EmptyState({ title: 'Nothing to show yet', message: 'Report your first issue and track it here.', actionLabel: 'Report an Issue', actionNav: '#/resident/complaints/new' })
    : `<div class="grid sm-2col" style="gap:0.75rem;">${sorted.map((c) => ComplaintCard(c, `#/resident/complaints/${c.id}`)).join('')}</div>`;
}
function mountMyComplaints() {
  let filter = 'All';
  renderMyComplaintsResults(filter);
  document.getElementById('my-complaints-filters').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="mc-filter"]');
    if (!btn) return;
    filter = btn.dataset.value;
    document.querySelectorAll('#my-complaints-filters .pill').forEach((p) => p.classList.toggle('active', p === btn));
    renderMyComplaintsResults(filter);
  });
}

/* ============================= ANNOUNCEMENTS (shared) ============================= */
function announcementsPage(role) {
  const isAdmin = role === 'admin';
  const sorted = [...Store.announcements].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const content = `${PageHeader('Announcements', isAdmin ? 'Publish updates for residents.' : 'Stay informed about your society.',
    isAdmin ? Button({ label: 'Publish Announcement', icon: 'plus', extraAttrs: 'data-action="open-modal" data-modal="announcement-modal"' }) : '')}
    ${sorted.length === 0 ? EmptyState({ title: "You're all caught up", message: 'There are no new society announcements.', icon: 'announcement' })
      : `<div class="grid sm-2col" style="gap:1rem;">${sorted.map((a) => AnnouncementCard(a, isAdmin ? `
        ${Button({ label: 'Edit', size: 'sm', variant: 'secondary', extraAttrs: `data-action="edit-announcement" data-id="${a.id}"` })}
        ${Button({ label: 'Delete', size: 'sm', variant: 'danger', extraAttrs: `data-action="ask-delete-announcement" data-id="${a.id}"` })}
      ` : '')).join('')}</div>`}
    <div class="modal-overlay hidden" id="announcement-modal" data-modal-root>
      <div class="modal-box anim-modal">
        <div class="modal-head"><h3 class="font-display font-bold text-lg" id="announcement-modal-title">Publish Announcement</h3><button data-action="close-modal" data-modal="announcement-modal">${Icon('x', 18)}</button></div>
        <div class="modal-body">
          <form id="announcement-form">
            <input type="hidden" id="an-id">
            ${fieldWrap('Title', `<input class="input" style="${inputStyle()}" id="an-title">`)}
            ${fieldWrap('Description', `<textarea class="input" style="${inputStyle()}" id="an-description" rows="3"></textarea>`)}
            <div class="grid grid-cols-2" style="gap:12px;">
              ${fieldWrap('Category', `<select class="input" style="${inputStyle()}" id="an-category">${['General', 'Maintenance', 'Emergency', 'Security', 'Events'].map((c) => `<option>${c}</option>`).join('')}</select>`)}
              ${fieldWrap('Priority', `<select class="input" style="${inputStyle()}" id="an-priority">${['Normal', 'Important', 'Emergency'].map((c) => `<option>${c}</option>`).join('')}</select>`)}
            </div>
            <div style="display:flex;justify-content:flex-end;gap:12px;">
              ${Button({ label: 'Cancel', variant: 'secondary', extraAttrs: 'type="button" data-action="close-modal" data-modal="announcement-modal"' })}
              ${Button({ label: 'Save', extraAttrs: 'type="submit" id="announcement-submit-btn"' })}
            </div>
          </form>
        </div>
      </div>
    </div>
    <div class="modal-overlay hidden" id="delete-announcement-modal" data-modal-root>
      <div class="modal-box anim-modal" style="max-width:26rem;">
        <div class="modal-head"><h3 class="font-display font-bold text-lg">Delete this announcement?</h3><button data-action="close-modal" data-modal="delete-announcement-modal">${Icon('x', 18)}</button></div>
        <div class="modal-body"><p style="font-size:0.875rem;color:var(--text-secondary);">This action cannot be undone.</p></div>
        <div class="modal-foot">
          ${Button({ label: 'Cancel', variant: 'secondary', extraAttrs: 'data-action="close-modal" data-modal="delete-announcement-modal"' })}
          ${Button({ label: 'Delete', variant: 'danger', extraAttrs: 'id="confirm-delete-announcement-btn"' })}
        </div>
      </div>
    </div>`;
  return AppShell(role, isAdmin ? '#/admin/announcements' : '#/resident/announcements', content);
}
let pendingDeleteAnnouncementId = null;
function mountAnnouncements() {
  const form = document.getElementById('announcement-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('an-id').value;
    const data = {
      title: document.getElementById('an-title').value.trim(),
      description: document.getElementById('an-description').value.trim(),
      category: document.getElementById('an-category').value,
      priority: document.getElementById('an-priority').value,
    };
    if (!data.title || !data.description) return;
    if (id) { Store.updateAnnouncement(id, data); showToast('Announcement updated'); }
    else { Store.addAnnouncement(data); showToast('Announcement published'); }
    renderApp();
  });
  const confirmBtn = document.getElementById('confirm-delete-announcement-btn');
  if (confirmBtn) confirmBtn.addEventListener('click', () => {
    if (pendingDeleteAnnouncementId) { Store.deleteAnnouncement(pendingDeleteAnnouncementId); showToast('Announcement deleted'); }
    renderApp();
  });
}

/* RESIDENT FEEDBACK PAGE */
function residentFeedbackPage() {
  const mine = Store.feedbacks.filter((f) => f.residentId === Store.session.userId).sort((a, b) => new Date(b.date) - new Date(a.date));
  const content = `${PageHeader('Feedback', "Feedback you've submitted for resolved complaints.")}
    ${mine.length === 0 ? EmptyState({ title: 'No feedback yet', message: 'Once a complaint is closed, you can rate the service here.', icon: 'feedback' })
      : `<div style="display:flex;flex-direction:column;gap:0.75rem;">${mine.map((f) => {
        const c = Store.complaints.find((x) => x.id === f.complaintId);
        return Card(`<div style="display:flex;align-items:center;justify-content:space-between;">
          <p style="font-weight:500;font-size:0.875rem;">${esc(c ? c.title : f.complaintId)}</p>
          <div style="display:flex;">${starsHtml(f.rating, false)}</div>
        </div>${f.comment ? `<p style="font-size:0.875rem;margin-top:0.5rem;color:var(--text-secondary);">${esc(f.comment)}</p>` : ''}
        <p style="font-size:0.75rem;margin-top:0.5rem;color:var(--muted);">${fmtDate(f.date)}</p>`);
      }).join('')}</div>`}`;
  return AppShell('resident', '#/resident/feedback', content);
}

/* ADMIN PAGES */
function adminDashboardPage() {
  const c = Store.complaints;
  const stats = {
    total: c.length, pending: c.filter((x) => x.status === 'Pending').length,
    progress: c.filter((x) => x.status === 'In Progress').length,
    resolved: c.filter((x) => ['Resolved', 'Closed'].includes(x.status)).length,
    high: c.filter((x) => x.priority === 'High' || x.priority === 'Emergency').length,
  };
  const emergency = c.filter((x) => x.priority === 'Emergency' && x.status !== 'Closed');
  const recent = [...c].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const content = `${PageHeader('Good morning, Admin', "Here's your society maintenance overview.")}
    <div class="grid stat-grid-5" style="gap:1rem;margin-bottom:2rem;">
      ${StatCard('Total Complaints', stats.total)}${StatCard('Pending', stats.pending, 'warning')}${StatCard('In Progress', stats.progress)}${StatCard('Resolved', stats.resolved, 'success')}${StatCard('High Priority', stats.high, 'emergency')}
    </div>
    ${emergency.length > 0 ? Card(`<p style="font-size:0.875rem;font-weight:600;margin-bottom:0.5rem;color:var(--emergency);">&#9888; ${emergency.length} emergency complaint${emergency.length > 1 ? 's' : ''} need attention</p>
      <div style="display:flex;flex-direction:column;gap:8px;">${emergency.map((x) => `<a data-nav="#/admin/complaints/${x.id}" style="display:flex;align-items:center;justify-content:space-between;background:var(--card);border-radius:0.65rem;padding:0.5rem 0.75rem;font-size:0.875rem;">
        <span class="truncate">${esc(x.title)}</span>${StatusBadge(x.status)}</a>`).join('')}</div>`, 'border-color:var(--emergency);background:var(--emergency-bg);margin-bottom:1.5rem;') : ''}
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem;">
      <h2 class="font-display font-bold">Recent complaints</h2><a data-nav="#/admin/complaints" style="font-size:0.875rem;font-weight:500;color:var(--primary);">View all</a>
    </div>
    <div class="grid sm-2col" style="gap:0.75rem;">${recent.map((x) => ComplaintCard(x, `#/admin/complaints/${x.id}`)).join('')}</div>`;
  return AppShell('admin', '#/admin/dashboard', content);
}
function allComplaintsPage() {
  const content = `${PageHeader('All Complaints', '')}
    ${Card(`<div class="grid filter-bar-grid" style="gap:12px;">
      <div style="position:relative;"><span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--muted);">${Icon('search', 15)}</span>
        <input id="ac-search" class="input" style="${inputStyle()}padding-left:2.25rem;" placeholder="Search ID, title, resident">
      </div>
      <select id="ac-status" class="input" style="${inputStyle()}">${['All', 'Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'].map((s) => `<option>${s}</option>`).join('')}</select>
      <select id="ac-category" class="input" style="${inputStyle()}">${['All', 'Plumbing', 'Electrical', 'Lift', 'Carpentry', 'Cleaning', 'Security', 'Parking', 'Other'].map((s) => `<option>${s}</option>`).join('')}</select>
      <select id="ac-priority" class="input" style="${inputStyle()}">${['All', 'Low', 'Medium', 'High', 'Emergency'].map((s) => `<option>${s}</option>`).join('')}</select>
    </div>`, 'margin-bottom:1.25rem;')}
    <div id="ac-results"></div>`;
  return AppShell('admin', '#/admin/complaints', content);
}
function renderAllComplaintsResults() {
  const search = document.getElementById('ac-search').value.toLowerCase();
  const status = document.getElementById('ac-status').value;
  const category = document.getElementById('ac-category').value;
  const priority = document.getElementById('ac-priority').value;
  const filtered = Store.complaints.filter((c) =>
    (status === 'All' || c.status === status) && (category === 'All' || c.category === category) && (priority === 'All' || c.priority === priority) &&
    (search === '' || c.id.toLowerCase().includes(search) || c.title.toLowerCase().includes(search) || c.residentName.toLowerCase().includes(search))
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const el = document.getElementById('ac-results');
  const heading = `<p style="font-size:0.875rem;margin-bottom:1rem;color:var(--text-secondary);">${filtered.length} complaint${filtered.length !== 1 ? 's' : ''} found</p>`;
  if (filtered.length === 0) { el.innerHTML = heading + EmptyState({ title: 'No complaints match', message: 'Try adjusting your filters.' }); return; }
  const rows = filtered.map((c) => `<tr>
    <td class="font-mono text-xs">${esc(c.id)}</td><td class="truncate" style="max-width:220px;">${esc(c.title)}</td><td>${esc(c.residentName)}</td>
    <td>${esc(c.category)}</td><td>${PriorityBadge(c.priority)}</td><td>${StatusBadge(c.status)}</td><td>${esc(c.assignedWorkerName || '\u2014')}</td>
    <td style="white-space:nowrap;">${fmtDate(c.createdAt)}</td><td>${Button({ label: 'View', size: 'sm', variant: 'secondary', extraAttrs: `data-nav="#/admin/complaints/${c.id}"` })}</td>
  </tr>`).join('');
  el.innerHTML = heading + `<div class="table-wrap lg-only bg-white rounded-xl border"><table class="data-table">
      <thead><tr>${['ID', 'Issue', 'Resident', 'Category', 'Priority', 'Status', 'Worker', 'Date', ''].map((h) => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${rows}</tbody></table></div>
    <div class="grid lg-hidden" style="gap:0.75rem;">${filtered.map((c) => ComplaintCard(c, `#/admin/complaints/${c.id}`)).join('')}</div>`;
}
function mountAllComplaints() {
  renderAllComplaintsResults();
  ['ac-search', 'ac-status', 'ac-category', 'ac-priority'].forEach((id) => {
    document.getElementById(id).addEventListener('input', renderAllComplaintsResults);
    document.getElementById(id).addEventListener('change', renderAllComplaintsResults);
  });
}
function gateEntryPage() {
  const inside = Store.gateEntries.filter((g) => !g.exitTime);
  const history = Store.gateEntries.filter((g) => g.exitTime).sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime));
  const content = `${PageHeader('Gate Entry', 'A simple visitor log for the society.', Button({ label: 'Record Visitor', icon: 'plus', extraAttrs: 'data-action="open-modal" data-modal="gate-modal"' }))}
    <h2 class="font-display font-bold" style="margin-bottom:0.75rem;">Currently Inside</h2>
    ${inside.length === 0 ? EmptyState({ title: 'No visitors inside', message: 'Recorded visitors will appear here until they exit.', icon: 'gate' })
      : `<div class="grid sm-2col" style="gap:0.75rem;margin-bottom:2rem;">${inside.map((g) => Card(`<div style="display:flex;align-items:flex-start;justify-content:space-between;">
        <div><p style="font-weight:500;font-size:0.875rem;">${esc(g.visitorName)}</p>
          <p style="font-size:0.75rem;margin-top:0.25rem;color:var(--text-secondary);">${esc(g.purpose)} &middot; Flat ${esc(g.flat)}</p>
          <p style="font-size:0.75rem;margin-top:0.25rem;color:var(--muted);">In: ${fmtDateTime(g.entryTime)}${g.vehicle && g.vehicle !== '-' ? ` &middot; ${esc(g.vehicle)}` : ''}</p></div>
        ${Button({ label: 'Mark Exit', size: 'sm', variant: 'secondary', extraAttrs: `data-action="mark-exit" data-id="${g.id}"` })}
      </div>`)).join('')}</div>`}
    <h2 class="font-display font-bold" style="margin-bottom:0.75rem;">Recent Entries</h2>
    ${history.length === 0 ? `<p style="font-size:0.875rem;color:var(--muted);">No history yet.</p>` : `<div class="grid sm-2col" style="gap:0.75rem;">${history.map((g) => Card(`
        <p style="font-weight:500;font-size:0.875rem;">${esc(g.visitorName)}</p>
        <p style="font-size:0.75rem;margin-top:0.25rem;color:var(--text-secondary);">${esc(g.purpose)} &middot; Flat ${esc(g.flat)}</p>
        <p style="font-size:0.75rem;margin-top:0.25rem;color:var(--muted);">In: ${fmtDateTime(g.entryTime)} &middot; Out: ${fmtDateTime(g.exitTime)}</p>`)).join('')}</div>`}
    <div class="modal-overlay hidden" id="gate-modal" data-modal-root>
      <div class="modal-box anim-modal">
        <div class="modal-head"><h3 class="font-display font-bold text-lg">Record Visitor</h3><button data-action="close-modal" data-modal="gate-modal">${Icon('x', 18)}</button></div>
        <div class="modal-body"><form id="gate-form">
          ${fieldWrap('Visitor Name', `<input class="input" style="${inputStyle()}" id="ge-name">`)}
          ${fieldWrap('Contact Number', `<input class="input" style="${inputStyle()}" id="ge-contact">`)}
          ${fieldWrap('Purpose', `<input class="input" style="${inputStyle()}" id="ge-purpose" placeholder="Guest, delivery, cab, etc.">`)}
          ${fieldWrap('Resident / Flat', `<input class="input" style="${inputStyle()}" id="ge-flat" placeholder="e.g. A-304">`)}
          ${fieldWrap('Vehicle Number', `<input class="input" style="${inputStyle()}" id="ge-vehicle" placeholder="Optional">`)}
          <div style="display:flex;justify-content:flex-end;gap:12px;">
            ${Button({ label: 'Cancel', variant: 'secondary', extraAttrs: 'type="button" data-action="close-modal" data-modal="gate-modal"' })}
            ${Button({ label: 'Save Entry', extraAttrs: 'type="submit"' })}
          </div>
        </form></div>
      </div>
    </div>`;
  return AppShell('admin', '#/admin/gate-entry', content);
}
function mountGateEntry() {
  const form = document.getElementById('gate-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('ge-name').value.trim();
    const flat = document.getElementById('ge-flat').value.trim();
    if (!name || !flat) return;
    Store.addGateEntry({
      visitorName: name, flat, contact: document.getElementById('ge-contact').value.trim(),
      purpose: document.getElementById('ge-purpose').value.trim(), vehicle: document.getElementById('ge-vehicle').value.trim() || '-',
    });
    showToast('Visitor recorded');
    renderApp();
  });
}
function adminFeedbackPage() {
  const sorted = [...Store.feedbacks].sort((a, b) => new Date(b.date) - new Date(a.date));
  const avg = Store.feedbacks.length ? (Store.feedbacks.reduce((s, f) => s + f.rating, 0) / Store.feedbacks.length).toFixed(1) : '\u2014';
  const content = `${PageHeader('Feedback', 'What residents are saying about resolved complaints.')}
    <div class="grid grid-cols-2" style="gap:1rem;margin-bottom:1.5rem;max-width:28rem;">${StatCard('Total Feedback', Store.feedbacks.length)}${StatCard('Average Rating', avg, 'success')}</div>
    ${sorted.length === 0 ? EmptyState({ title: 'No feedback yet', message: 'Feedback submitted by residents will appear here.', icon: 'feedback' })
      : `<div style="display:flex;flex-direction:column;gap:0.75rem;">${sorted.map((f) => {
        const c = Store.complaints.find((x) => x.id === f.complaintId);
        return Card(`<div style="display:flex;align-items:center;justify-content:space-between;"><p style="font-weight:500;font-size:0.875rem;">${esc(c ? c.title : f.complaintId)}</p><div style="display:flex;">${starsHtml(f.rating, false)}</div></div>
        <p style="font-size:0.75rem;margin-top:0.25rem;color:var(--muted);">${esc(c ? c.residentName : '')} &middot; ${fmtDate(f.date)}</p>
        ${f.comment ? `<p style="font-size:0.875rem;margin-top:0.5rem;color:var(--text-secondary);">${esc(f.comment)}</p>` : ''}`);
      }).join('')}</div>`}`;
  return AppShell('admin', '#/admin/feedback', content);
}

/* WORKER PAGES */
function workerDashboardPage() {
  const mine = Store.complaints.filter((c) => c.assignedWorkerId === Store.session.userId);
  const stats = { assigned: mine.filter((c) => c.status === 'Assigned').length, progress: mine.filter((c) => c.status === 'In Progress').length, resolved: mine.filter((c) => ['Resolved', 'Closed'].includes(c.status)).length };
  const active = mine.filter((c) => c.status !== 'Closed').sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  const content = `${PageHeader(`Hello, ${Store.session.name.split(' ')[0]}`, 'Here are the complaints assigned to you.')}
    <div class="grid grid-cols-3" style="gap:1rem;margin-bottom:2rem;">${StatCard('Assigned', stats.assigned, 'warning')}${StatCard('In Progress', stats.progress)}${StatCard('Resolved', stats.resolved, 'success')}</div>
    <h2 class="font-display font-bold" style="margin-bottom:0.75rem;">Your tasks</h2>
    ${active.length === 0 ? EmptyState({ title: 'No tasks assigned yet', message: 'New work will appear here.', icon: 'complaints' })
      : `<div class="grid sm-2col" style="gap:0.75rem;">${active.map((c) => ComplaintCard(c, `#/worker/complaints/${c.id}`)).join('')}</div>`}`;
  return AppShell('worker', '#/worker/dashboard', content);
}
function assignedComplaintsPage(filter) {
  filter = filter || 'All';
  const statuses = ['All', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
  const content = `${PageHeader('Assigned Complaints', 'Everything assigned to you.')}
    <div class="filter-pills" id="wc-filters">${statuses.map((s) => `<button data-action="wc-filter" data-value="${s}" class="pill${s === filter ? ' active' : ''}">${s}</button>`).join('')}</div>
    <div id="wc-results"></div>`;
  return AppShell('worker', '#/worker/complaints', content);
}
function renderWorkerComplaintsResults(filter) {
  const mine = Store.complaints.filter((c) => c.assignedWorkerId === Store.session.userId);
  const filtered = filter === 'All' ? mine : mine.filter((c) => c.status === filter);
  const sorted = [...filtered].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  const el = document.getElementById('wc-results');
  el.innerHTML = sorted.length === 0 ? EmptyState({ title: 'No tasks assigned yet', message: 'New work will appear here.', icon: 'complaints' })
    : `<div class="grid sm-2col" style="gap:0.75rem;">${sorted.map((c) => ComplaintCard(c, `#/worker/complaints/${c.id}`)).join('')}</div>`;
}
function mountAssignedComplaints() {
  let filter = 'All';
  renderWorkerComplaintsResults(filter);
  document.getElementById('wc-filters').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="wc-filter"]');
    if (!btn) return;
    filter = btn.dataset.value;
    document.querySelectorAll('#wc-filters .pill').forEach((p) => p.classList.toggle('active', p === btn));
    renderWorkerComplaintsResults(filter);
  });
}

/* PROFILE / SETTINGS */
function profilePage(role) {
  const me = Store.users.find((u) => u.id === Store.session.userId) || {};
  const content = `${PageHeader('Profile', 'Your account details.')}
    ${Card(`<div style="display:flex;align-items:center;gap:12px;margin-bottom:1.5rem;">${UserAvatar(me.name, 52)}<div><p class="font-display font-bold">${esc(me.name)}</p><p class="capitalize" style="font-size:0.875rem;color:var(--muted);">${esc(me.role)}</p></div></div>
    <form id="profile-form">
      ${fieldWrap('Full Name', `<input class="input" style="${inputStyle()}" id="pf-name" value="${esc(me.name || '')}">`)}
      ${fieldWrap('Email', `<input class="input" style="${inputStyle()}opacity:0.6;" value="${esc(me.email || '')}" disabled>`)}
      ${fieldWrap('Phone', `<input class="input" style="${inputStyle()}" id="pf-phone" value="${esc(me.phone || '')}">`)}
      ${me.role === 'resident' ? `<div class="grid grid-cols-2" style="gap:12px;">
        ${fieldWrap('Tower', `<input class="input" style="${inputStyle()}" id="pf-tower" value="${esc(me.tower || '')}">`)}
        ${fieldWrap('Flat', `<input class="input" style="${inputStyle()}" id="pf-flat" value="${esc(me.flat || '')}">`)}
      </div>` : ''}
      ${me.role === 'worker' ? fieldWrap('Specialization', `<select class="input" style="${inputStyle()}" id="pf-spec">${['Electrician', 'Plumber', 'Carpenter', 'Cleaner', 'Lift Technician'].map((s) => `<option${s === me.specialization ? ' selected' : ''}>${s}</option>`).join('')}</select>`) : ''}
      ${Button({ label: 'Save Changes', extraAttrs: 'type="submit" style="margin-top:0.25rem;"' })}
    </form>`, 'max-width:32rem;margin:0 auto;')}`;
  return AppShell(role, '#/profile', content);
}
function mountProfile() {
  document.getElementById('profile-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const patch = { name: document.getElementById('pf-name').value.trim(), phone: document.getElementById('pf-phone').value.trim() };
    const towerEl = document.getElementById('pf-tower'); if (towerEl) patch.tower = towerEl.value.trim();
    const flatEl = document.getElementById('pf-flat'); if (flatEl) patch.flat = flatEl.value.trim();
    const specEl = document.getElementById('pf-spec'); if (specEl) patch.specialization = specEl.value;
    Store.updateProfile(Store.session.userId, patch);
    showToast('Profile updated');
    renderApp();
  });
}
function settingsPage(role) {
  const notif = getStored(KEYS.settings, { email: true, sms: false });
  const content = `${PageHeader('Settings', 'Manage your preferences.')}
    <div style="max-width:32rem;margin:0 auto;display:flex;flex-direction:column;gap:1.25rem;">
      ${Card(`<h3 class="font-display font-bold text-sm" style="margin-bottom:1rem;">Notification preferences</h3>
        <label style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0;font-size:0.875rem;">Email notifications<input type="checkbox" id="notif-email"${notif.email ? ' checked' : ''}></label>
        <label style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0;font-size:0.875rem;">SMS notifications<input type="checkbox" id="notif-sms"${notif.sms ? ' checked' : ''}></label>`)}
      ${Card(`<h3 class="font-display font-bold text-sm" style="margin-bottom:1rem;">Appearance</h3>
        <select class="input" style="${inputStyle()}" id="theme-select">
          <option value="light"${getTheme() === 'light' ? ' selected' : ''}>Light</option>
          <option value="dark"${getTheme() === 'dark' ? ' selected' : ''}>Dark</option>
          <option value="system"${getTheme() === 'system' ? ' selected' : ''}>System</option>
        </select>`)}
      ${Button({ label: 'Logout', variant: 'danger', icon: 'logout', extraAttrs: 'data-action="logout"' })}
    </div>`;
  return AppShell(role, '#/settings', content);
}
function mountSettings() {
  const save = () => { setStored(KEYS.settings, { email: document.getElementById('notif-email').checked, sms: document.getElementById('notif-sms').checked }); showToast('Preference saved'); };
  document.getElementById('notif-email').addEventListener('change', save);
  document.getElementById('notif-sms').addEventListener('change', save);
  document.getElementById('theme-select').addEventListener('change', (e) => { setTheme(e.target.value); showToast('Preference saved'); });
}

/* MAIN RENDER / ROUTER */
function requireAuth(role) {
  if (!Store.session) { window.location.href = 'login.html'; return false; }
  if (role && Store.session.role !== role) { navigate(`#/${Store.session.role}/dashboard`); return false; }
  return true;
}
function renderApp() {
  const parts = hashParts();
  const root = document.getElementById('root');
  let html = '', mount = null;

  if (parts[0] === 'profile') { if (!requireAuth()) return; html = profilePage(Store.session.role); mount = mountProfile; }
  else if (parts[0] === 'settings') { if (!requireAuth()) return; html = settingsPage(Store.session.role); mount = mountSettings; }
  else if (parts[0] === 'resident') {
    if (!requireAuth('resident')) return;
    if (parts[1] === 'complaints' && parts[2] === 'new') { html = newComplaintPage(); mount = mountNewComplaint; }
    else if (parts[1] === 'complaints' && parts[2]) { html = complaintDetailsPage('resident', parts[2]); mount = () => mountComplaintDetails('resident', parts[2]); }
    else if (parts[1] === 'complaints') { html = myComplaintsPage(); mount = mountMyComplaints; }
    else if (parts[1] === 'announcements') { html = announcementsPage('resident'); mount = mountAnnouncements; }
    else if (parts[1] === 'feedback') { html = residentFeedbackPage(); }
    else { html = residentDashboardPage(); }
  } else if (parts[0] === 'admin') {
    if (!requireAuth('admin')) return;
    if (parts[1] === 'complaints' && parts[2]) { html = complaintDetailsPage('admin', parts[2]); mount = () => mountComplaintDetails('admin', parts[2]); }
    else if (parts[1] === 'complaints') { html = allComplaintsPage(); mount = mountAllComplaints; }
    else if (parts[1] === 'announcements') { html = announcementsPage('admin'); mount = mountAnnouncements; }
    else if (parts[1] === 'gate-entry') { html = gateEntryPage(); mount = mountGateEntry; }
    else if (parts[1] === 'feedback') { html = adminFeedbackPage(); }
    else { html = adminDashboardPage(); }
  } else if (parts[0] === 'worker') {
    if (!requireAuth('worker')) return;
    if (parts[1] === 'complaints' && parts[2]) { html = complaintDetailsPage('worker', parts[2]); mount = () => mountComplaintDetails('worker', parts[2]); }
    else if (parts[1] === 'complaints') { html = assignedComplaintsPage(); mount = mountAssignedComplaints; }
    else { html = workerDashboardPage(); }
  } else {
    // no/unknown hash: send signed-in users to their dashboard, everyone else to login
    if (!Store.session) { window.location.href = 'login.html'; return; }
    navigate(`#/${Store.session.role}/dashboard`);
    return;
  }

  root.innerHTML = html;
  attachModalCloseOnBackdrop();
  if (mount) mount();
  window.scrollTo(0, 0);
}

/* GLOBAL DELEGATED EVENTS */
function attachModalCloseOnBackdrop() {
  document.querySelectorAll('[data-modal-root]').forEach((overlay) => {
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.add('hidden'); });
  });
}
document.addEventListener('click', (e) => {
  const navEl = e.target.closest('[data-nav]');
  if (navEl) { e.preventDefault(); navigate(navEl.getAttribute('data-nav')); return; }

  const actionEl = e.target.closest('[data-action]');
  if (!actionEl) return;
  const action = actionEl.dataset.action;

  if (action === 'logout') { Store.logout(); window.location.href = 'login.html'; return; }
  if (action === 'open-mobile-menu') { document.getElementById('mobile-sidebar-overlay').classList.remove('hidden'); return; }
  if (action === 'close-mobile-menu') { document.getElementById('mobile-sidebar-overlay').classList.add('hidden'); return; }
  if (action === 'toggle-theme') {
    toggleTheme();
    const dark = resolvedTheme(getTheme()) === 'dark';
    document.querySelectorAll('.theme-toggle').forEach((btn) => { btn.innerHTML = Icon(dark ? 'sun' : 'moon', 17); });
    return;
  }
  if (action === 'open-modal') {
    if (actionEl.dataset.modal === 'announcement-modal') {
      document.getElementById('announcement-modal-title').textContent = 'Publish Announcement';
      document.getElementById('an-id').value = '';
      document.getElementById('an-title').value = '';
      document.getElementById('an-description').value = '';
      document.getElementById('an-category').value = 'General';
      document.getElementById('an-priority').value = 'Normal';
    }
    document.getElementById(actionEl.dataset.modal).classList.remove('hidden');
    return;
  }
  if (action === 'close-modal') { document.getElementById(actionEl.dataset.modal).classList.add('hidden'); return; }
  if (action === 'assign-worker') {
    Store.updateComplaint(actionEl.dataset.id, { status: 'Assigned', assignedWorkerId: actionEl.dataset.workerId, assignedWorkerName: actionEl.dataset.workerName }, `Assigned to ${actionEl.dataset.workerName}.`);
    showToast('Worker assigned successfully'); renderApp(); return;
  }
  if (action === 'change-priority') {
    Store.updateComplaint(actionEl.dataset.id, { priority: actionEl.dataset.value }, `Priority changed to ${actionEl.dataset.value}.`);
    showToast('Priority updated'); renderApp(); return;
  }
  if (action === 'change-status') {
    Store.updateComplaint(actionEl.dataset.id, { status: actionEl.dataset.value }, `Status updated to ${actionEl.dataset.value} by admin.`);
    showToast('Status updated'); renderApp(); return;
  }
  if (action === 'start-work') { Store.updateComplaint(actionEl.dataset.id, { status: 'In Progress' }, 'Work started.'); showToast('Status updated'); renderApp(); return; }
  if (action === 'mark-resolved') { Store.updateComplaint(actionEl.dataset.id, { status: 'Resolved' }, 'Marked as resolved by worker.'); showToast('Status updated'); renderApp(); return; }
  if (action === 'confirm-resolution') { Store.updateComplaint(actionEl.dataset.id, { status: 'Closed' }, 'Resident confirmed resolution. Complaint closed.'); showToast('Resolution confirmed'); renderApp(); return; }
  if (action === 'mark-exit') { Store.markExit(actionEl.dataset.id); showToast('Visitor marked as exited'); renderApp(); return; }
  if (action === 'edit-announcement') {
    const a = Store.announcements.find((x) => x.id === actionEl.dataset.id);
    if (!a) return;
    document.getElementById('announcement-modal-title').textContent = 'Edit Announcement';
    document.getElementById('an-id').value = a.id;
    document.getElementById('an-title').value = a.title;
    document.getElementById('an-description').value = a.description;
    document.getElementById('an-category').value = a.category;
    document.getElementById('an-priority').value = a.priority;
    document.getElementById('announcement-modal').classList.remove('hidden');
    return;
  }
  if (action === 'ask-delete-announcement') { pendingDeleteAnnouncementId = actionEl.dataset.id; document.getElementById('delete-announcement-modal').classList.remove('hidden'); return; }
});

/* BOOT */
applyTheme();
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (getTheme() === 'system') applyTheme(); });
}
window.addEventListener('hashchange', renderApp);
window.addEventListener('DOMContentLoaded', renderApp);