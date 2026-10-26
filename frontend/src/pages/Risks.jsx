import React, { useEffect, useState } from 'react';
import axios from 'axios';
import RiskBadge from '../components/RiskBadge';
import { Plus, Pencil, Trash2, X, Filter } from 'lucide-react';

const CATEGORIES = ['Financial', 'Operational', 'Cybersecurity', 'Market', 'Reputation'];
const STATUSES = ['Open', 'Under Mitigation', 'Resolved'];
const EMPTY_FORM = { name: '', category: 'Financial', description: '', probability: 3, severity: 3, impact: 3, owner: '', status: 'Open' };

const calcScore = (p, s, i) => Math.round((p * s * i / 125) * 100);
const getLevel = (score) => score <= 30 ? 'Low' : score <= 60 ? 'Medium' : score <= 80 ? 'High' : 'Critical';

export default function Risks() {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterCat, setFilterCat] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [saving, setSaving] = useState(false);

  const previewScore = calcScore(Number(form.probability), Number(form.severity), Number(form.impact));
  const previewLevel = getLevel(previewScore);

  const fetchRisks = async () => {
    try {
      const res = await axios.get('/api/risks');
      setRisks(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRisks(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (risk) => { setEditing(risk._id); setForm({ name: risk.name, category: risk.category, description: risk.description || '', probability: risk.probability, severity: risk.severity, impact: risk.impact, owner: risk.owner || '', status: risk.status }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const res = await axios.put(`/api/risks/${editing}`, form);
        setRisks(risks.map(r => r._id === editing ? res.data : r));
      } else {
        const res = await axios.post('/api/risks', form);
        setRisks([res.data, ...risks]);
      }
      setShowModal(false);
    } catch (e) { alert(e.response?.data?.message || 'Error saving risk'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this risk?')) return;
    await axios.delete(`/api/risks/${id}`);
    setRisks(risks.filter(r => r._id !== id));
  };

  const handleStatusChange = async (id, status) => {
    const res = await axios.put(`/api/risks/${id}`, { status });
    setRisks(risks.map(r => r._id === id ? res.data : r));
  };

  const filtered = risks.filter(r =>
    (filterCat === 'All' || r.category === filterCat) &&
    (filterStatus === 'All' || r.status === filterStatus)
  );

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Risk Management</h1>
          <p className="text-slate-400 text-sm">{risks.length} total risks tracked</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm transition-all shadow-lg shadow-blue-500/20">
          <Plus size={16} /> Add Risk
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Filter size={16} className="text-slate-400" />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="bg-[#1e2130] border border-[#2a2d3e] text-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500">
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-[#1e2130] border border-[#2a2d3e] text-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500">
          <option value="All">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#1e2130] rounded-xl border border-[#2a2d3e] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2d3e] bg-[#252840]">
                  {['Risk Name', 'Category', 'P', 'S', 'I', 'Score', 'Level', 'Status', 'Owner', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={10} className="text-center py-10 text-slate-500">No risks found</td></tr>
                )}
                {filtered.map((risk) => (
                  <tr key={risk._id} className="border-b border-[#2a2d3e] hover:bg-[#252840] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{risk.name}</p>
                      {risk.description && <p className="text-xs text-slate-500 truncate max-w-xs">{risk.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-[#252840] text-slate-300 px-2 py-0.5 rounded-full">{risk.category}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{risk.probability}</td>
                    <td className="px-4 py-3 text-slate-300">{risk.severity}</td>
                    <td className="px-4 py-3 text-slate-300">{risk.impact}</td>
                    <td className="px-4 py-3 font-bold text-white">{risk.score}</td>
                    <td className="px-4 py-3"><RiskBadge level={risk.level} /></td>
                    <td className="px-4 py-3">
                      <select
                        value={risk.status}
                        onChange={e => handleStatusChange(risk._id, e.target.value)}
                        className="bg-[#252840] border border-[#2a2d3e] text-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
                      >
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{risk.owner || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(risk)} className="p-1.5 rounded hover:bg-blue-500/20 text-blue-400 transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(risk._id)} className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1d27] rounded-2xl border border-[#2a2d3e] w-full max-w-lg shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[#2a2d3e]">
              <h2 className="text-lg font-semibold text-white">{editing ? 'Edit Risk' : 'Add New Risk'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Risk Name *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Revenue Decline"
                    className="w-full bg-[#252840] border border-[#2a2d3e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Category *</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[#252840] border border-[#2a2d3e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Risk Owner</label>
                  <input value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })} placeholder="e.g. IT Team"
                    className="w-full bg-[#252840] border border-[#2a2d3e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Brief description of the risk..."
                    className="w-full bg-[#252840] border border-[#2a2d3e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none" />
                </div>
                {['probability', 'severity', 'impact'].map(field => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-slate-400 mb-1 capitalize">{field} (1–5) *</label>
                    <input type="number" min={1} max={5} value={form[field]} onChange={e => setForm({ ...form, [field]: Number(e.target.value) })} required
                      className="w-full bg-[#252840] border border-[#2a2d3e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-[#252840] border border-[#2a2d3e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Preview Score */}
              <div className="p-3 rounded-lg bg-[#252840] border border-[#2a2d3e]">
                <p className="text-xs text-slate-400 mb-1">Calculated Risk Score (auto)</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-white">{previewScore}</span>
                  <RiskBadge level={previewLevel} />
                  <span className="text-xs text-slate-500">= ({form.probability}×{form.severity}×{form.impact}/125)×100</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-[#2a2d3e] rounded-lg text-slate-300 hover:bg-[#252840] text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-60">
                  {saving ? 'Saving...' : editing ? 'Update Risk' : 'Add Risk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
