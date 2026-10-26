import React, { useEffect, useState } from 'react';
import axios from 'axios';
import RiskBadge from '../components/RiskBadge';
import { Plus, X, ShieldCheck, Calendar, User } from 'lucide-react';

const STATUS_COLORS = {
  Planned: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'In Progress': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  Completed: 'bg-green-500/10 text-green-400 border-green-500/30',
};

export default function Mitigation() {
  const [mitigations, setMitigations] = useState([]);
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ riskId: '', action: '', owner: '', deadline: '', status: 'Planned' });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const [mitRes, riskRes] = await Promise.all([axios.get('/api/mitigation'), axios.get('/api/risks')]);
    setMitigations(mitRes.data);
    setRisks(riskRes.data.filter(r => r.status !== 'Resolved'));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.post('/api/mitigation', form);
      setMitigations([res.data, ...mitigations]);
      setShowModal(false);
      setForm({ riskId: '', action: '', owner: '', deadline: '', status: 'Planned' });
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    const res = await axios.put(`/api/mitigation/${id}`, { status });
    setMitigations(mitigations.map(m => m._id === id ? res.data : m));
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Risk Mitigation</h1>
          <p className="text-slate-400 text-sm">{mitigations.length} mitigation actions tracked</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm transition-all shadow-lg shadow-blue-500/20">
          <Plus size={16} /> Add Mitigation
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : mitigations.length === 0 ? (
        <div className="bg-[#1e2130] rounded-xl border border-[#2a2d3e] p-12 text-center">
          <ShieldCheck size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No mitigation actions yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {mitigations.map((m) => (
            <div key={m._id} className="bg-[#1e2130] rounded-xl border border-[#2a2d3e] p-5 hover:border-[#3a3d4e] transition-all">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  {/* Risk Info */}
                  {m.riskId && (
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs bg-[#252840] text-slate-300 px-2 py-0.5 rounded-full">{m.riskId.category}</span>
                      <RiskBadge level={m.riskId.level} />
                      <span className="text-xs text-slate-400">Score: {m.riskId.score}</span>
                    </div>
                  )}
                  <h3 className="font-semibold text-white mb-1">{m.riskId?.name || 'Unknown Risk'}</h3>

                  {/* Action */}
                  <div className="mt-3 p-3 bg-[#252840] rounded-lg">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Mitigation Action</p>
                    <p className="text-sm text-slate-200">{m.action}</p>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-5 mt-3 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <User size={12} className="text-slate-400" />
                      <span className="text-slate-300">{m.owner}</span>
                    </span>
                    {m.deadline && (
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-400" />
                        <span className="text-slate-300">{new Date(m.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_COLORS[m.status]}`}>{m.status}</span>
                  <select value={m.status} onChange={e => updateStatus(m._id, e.target.value)}
                    className="bg-[#252840] border border-[#2a2d3e] text-slate-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-blue-500">
                    <option>Planned</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1d27] rounded-2xl border border-[#2a2d3e] w-full max-w-lg shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[#2a2d3e]">
              <h2 className="text-lg font-semibold text-white">Add Mitigation Action</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Select Risk *</label>
                <select value={form.riskId} onChange={e => setForm({ ...form, riskId: e.target.value })} required
                  className="w-full bg-[#252840] border border-[#2a2d3e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
                  <option value="">-- Select a risk --</option>
                  {risks.map(r => (
                    <option key={r._id} value={r._id}>[{r.level}] {r.name} ({r.category})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Mitigation Action *</label>
                <textarea value={form.action} onChange={e => setForm({ ...form, action: e.target.value })} required rows={3} placeholder="Describe the mitigation steps..."
                  className="w-full bg-[#252840] border border-[#2a2d3e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Risk Owner *</label>
                  <input value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })} required placeholder="e.g. IT Team"
                    className="w-full bg-[#252840] border border-[#2a2d3e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Deadline</label>
                  <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })}
                    className="w-full bg-[#252840] border border-[#2a2d3e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-[#252840] border border-[#2a2d3e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
                  <option>Planned</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-[#2a2d3e] rounded-lg text-slate-300 hover:bg-[#252840] text-sm">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm disabled:opacity-60">
                  {saving ? 'Saving...' : 'Add Mitigation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
