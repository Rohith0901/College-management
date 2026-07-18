'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { FiAlertCircle, FiPlus, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';

export default function ComplaintsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [complaints, setComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'maintenance', title: '', description: '', isAnonymous: false, priority: 'medium' });
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { if (!loading && !user) router.push('/login'); fetchComplaints(); }, [user, loading, router]);

  const fetchComplaints = () => {
    fetch('/api/complaints', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(r => r.json()).then(d => setComplaints(d.complaints || []));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) { toast.error('Fill all fields'); return; }
    setSubmitting(true);
    const res = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success('Complaint submitted!');
      setShowForm(false);
      setForm({ type: 'maintenance', title: '', description: '', isAnonymous: false, priority: 'medium' });
      fetchComplaints();
    } else toast.error('Failed to submit');
    setSubmitting(false);
  };

  const statusColors = { pending: 'badge-yellow', 'in-progress': 'badge-blue', resolved: 'badge-green', rejected: 'badge-red' };
  const priorityColors = { urgent: 'badge-red', high: 'badge-coral', medium: 'badge-gray', low: 'badge-gray' };

  if (loading || !user) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-teal-800 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <Toaster position="top-center" />
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-500 text-sm">Raise issues or track existing complaints</p>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-1.5">
          {showForm ? <><FiX size={14} /> Cancel</> : <><FiPlus size={14} /> New Complaint</>}
        </button>
      </div>

      {showForm && (
        <div className="cardStatic mb-6 border border-cream-200">
          <h3 className="font-bold text-gray-900 mb-4">Raise a Complaint</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="select-field">
                  {['bullying', 'maintenance', 'harassment', 'ragging', 'infrastructure', 'other'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Priority</label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="select-field">
                  {['low', 'medium', 'high', 'urgent'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Title</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="Brief title of the issue" />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={4} placeholder="Describe the issue in detail..." />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isAnonymous} onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-teal-600" />
              <span className="text-sm text-gray-600">Submit anonymously</span>
            </label>
            <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Submitting...' : 'Submit Complaint'}</button>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {complaints.length === 0 ? (
          <div className="card text-center py-16 text-gray-500">No complaints yet. Click "New Complaint" to raise one.</div>
        ) : complaints.map(c => (
          <div key={c._id} className="cardStatic border border-cream-200 cursor-pointer hover:border-cream-300 transition-all"
            onClick={() => setExpanded(expanded === c._id ? null : c._id)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={statusColors[c.status] || 'badge-gray'}>{c.status}</span>
                <span className="badge-gray">{c.type}</span>
                <span className={priorityColors[c.priority] || 'badge-gray'}>{c.priority}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                {expanded === c._id ? <FiChevronUp size={16} className="text-gray-400" /> : <FiChevronDown size={16} className="text-gray-400" />}
              </div>
            </div>
            <h3 className="font-bold text-gray-900 mt-2">{c.title}</h3>
            {expanded === c._id && (
              <div className="mt-3 pt-3 border-t border-cream-200">
                <p className="text-sm text-gray-600 mb-2">{c.description}</p>
                <p className="text-xs text-gray-400">By: {c.isAnonymous ? 'Anonymous' : c.userId?.name || 'Unknown'}</p>
                {c.adminResponse && (
                  <div className="mt-3 bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                    <p className="text-xs font-bold text-emerald-700 mb-1">Admin Response</p>
                    <p className="text-sm text-emerald-600">{c.adminResponse}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
