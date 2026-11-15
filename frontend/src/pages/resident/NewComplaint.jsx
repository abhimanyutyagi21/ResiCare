import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { Button, Card, Field, Input, PageHeader, Select, Textarea } from '../../components/ui.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { api } from '../../api/client.js';
import { CATEGORIES, PRIORITIES } from '../../utils/format.js';
import { resizeImage } from '../../utils/media.js';

const MAX_FILES = 6;
const MAX_VIDEO_MB = 25;

export default function NewComplaint() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const fileInput = useRef(null);
  const [form, setForm] = useState({ title: '', category: CATEGORIES[0], priority: PRIORITIES[0], description: '', tower: user.tower || '', floor: '', flat: user.flat || '' });
  const [attachments, setAttachments] = useState([]); // [{ file, type, preview }]
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Free object URLs when the component unmounts.
  useEffect(() => () => attachments.forEach((a) => URL.revokeObjectURL(a.preview)), []); // eslint-disable-line

  async function onPickFiles(e) {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    const next = [];
    for (const file of picked) {
      if (attachments.length + next.length >= MAX_FILES) { toast(`You can attach up to ${MAX_FILES} files.`, 'info'); break; }
      const isVideo = file.type.startsWith('video/');
      if (isVideo && file.size > MAX_VIDEO_MB * 1024 * 1024) { toast(`Videos must be under ${MAX_VIDEO_MB} MB.`, 'error'); continue; }
      const processed = isVideo ? file : await resizeImage(file);
      next.push({ file: processed, type: isVideo ? 'video' : 'image', preview: URL.createObjectURL(processed) });
    }
    if (next.length) {
      setAttachments((a) => [...a, ...next]);
      setErrors((er) => ({ ...er, attachments: undefined }));
    }
  }

  function removeAttachment(i) {
    setAttachments((list) => {
      URL.revokeObjectURL(list[i].preview);
      return list.filter((_, idx) => idx !== i);
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    const er = {};
    if (!form.title.trim()) er.title = 'Please enter a title for the issue.';
    if (!form.description.trim()) er.description = 'Please enter a description.';
    if (!form.tower.trim() || !form.flat.trim()) er.location = 'Please enter tower and flat.';
    if (!attachments.length) er.attachments = 'Please attach at least one photo or video as proof — this helps us verify genuine complaints.';
    setErrors(er);
    if (Object.keys(er).length) return;

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v.trim ? v.trim() : v));
    attachments.forEach((a) => fd.append('attachments', a.file));

    setBusy(true);
    try {
      const c = await api.complaints.create(fd);
      toast(`Complaint submitted successfully \u2014 ${c.id}`);
      navigate(`/resident/complaints/${c.id}`);
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Report an Issue" subtitle="Tell us what needs attention." />
      <Card style={{ maxWidth: '42rem', margin: '0 auto' }}>
        <form onSubmit={onSubmit} noValidate>
          <Field label="Issue Title" error={errors.title}><Input value={form.title} onChange={set('title')} placeholder="e.g. Kitchen tap leaking" /></Field>
          <div className="grid sm-2col" style={{ gap: '1rem' }}>
            <Field label="Category"><Select value={form.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
            <Field label="Priority"><Select value={form.priority} onChange={set('priority')}>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</Select></Field>
          </div>
          <Field label="Description" error={errors.description}><Textarea rows={4} value={form.description} onChange={set('description')} placeholder="Describe the issue in detail" /></Field>
          <Field label="Location" error={errors.location}>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              <Input placeholder="Tower" value={form.tower} onChange={set('tower')} />
              <Input placeholder="Floor" value={form.floor} onChange={set('floor')} />
              <Input placeholder="Flat" value={form.flat} onChange={set('flat')} />
            </div>
          </Field>
          <Field label="Proof (photo or video) — required" error={errors.attachments}>
            <label className="upload-box">
              <Icon name="image" size={17} /> Upload photo(s) or video(s) of the issue
              <input ref={fileInput} type="file" accept="image/*,video/*" multiple className="hidden" onChange={onPickFiles} />
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '0.75rem' }}>
              {attachments.map((a, i) => (
                <div key={a.preview} style={{ position: 'relative', width: 88, height: 88 }}>
                  {a.type === 'video'
                    ? <video src={a.preview} style={thumb} />
                    : <img src={a.preview} alt="" style={thumb} />}
                  <button type="button" onClick={() => removeAttachment(i)} aria-label="Remove file"
                    style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: 9999, background: 'var(--error)', color: '#fff', fontSize: '0.7rem', lineHeight: 1, cursor: 'pointer' }}>&times;</button>
                </div>
              ))}
            </div>
          </Field>

          {errors.form && <p className="field-error" style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--error)' }}>{errors.form}</p>}
          <div style={{ display: 'flex', gap: 12, marginTop: '0.5rem' }}>
            <Button type="submit" disabled={busy}>{busy ? 'Submitting…' : 'Submit Complaint'}</Button>
            <Button variant="secondary" to="/resident/dashboard">Cancel</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
const thumb = { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.6rem', border: '1px solid var(--border)' };
