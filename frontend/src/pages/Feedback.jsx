import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Plus, X, Star, AlertTriangle } from 'lucide-react';

const SENTIMENT_COLORS = { Positive: '#10b981', Neutral: '#f59e0b', Negative: '#ef4444' };

const StatCard = ({ label, value, color, subtitle }) => (
  <div className="bg-[#1e2130] rounded-xl border border-[#2a2d3e] p-5">
    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">{label}</p>
    <p className="text-3xl font-bold" style={{ color }}>{value}</p>
    {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
  </div>
);

export default function Feedback() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ customerName: '', feedback: '', rating: 5 });
  const [saving, setSaving] = useState(false);

  const fetchFeedback = async () => {
    const res = await axios.get('/api/feedback');
    setData(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchFeedback(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post('/api/feedback', form);
      setShowModal(false);
      setForm({ customerName: '', feedback: '', rating: 5 });
      fetchFeedback();
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-96">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const pieData = data ? [
    { name: 'Positive', value: data.stats.positive },
    { name: 'Neutral', value: data.stats.neutral },
    { name: 'Negative', value: data.stats.negative },
  ].filter(d => d.value > 0) : [];

  const sentimentBg = { Positive: 'bg-green-500/10 text-green-400', Neutral: 'bg-yellow-500/10 text-yellow-400', Negative: 'bg-red-500/10 text-red-400' };

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Customer Feedback</h1>
          <p className="text-slate-400 text-sm">Sentiment analysis & reputation monitoring</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm transition-all shadow-lg shadow-blue-500/20">
          <Plus size={16} /> Add Feedback
        </button>
      </div>

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Feedback" value={data.stats.total} color="#e2e8f0" />
          <StatCard label="Positive" value={`${data.stats.positivePercent}%`} color="#10b981" subtitle={`${data.stats.positive} reviews`} />
          <StatCard label="Neutral" value={`${data.stats.neutralPercent}%`} color="#f59e0b" subtitle={`${data.stats.neutral} reviews`} />
          <StatCard label="Negative" value={`${data.stats.negativePercent}%`} color="#ef4444" subtitle={`${data.stats.negative} reviews`} />
        </div>
      )}

      {/* Reputation Risk Warning */}
      {data && data.stats.negativePercent > 40 && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
          <AlertTriangle size={20} className="text-red-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-400">⚠️ Potential Reputation Risk Detected</p>
            <p className="text-sm text-slate-400">Negative feedback has exceeded 40% ({data.stats.negativePercent}%). Immediate action recommended.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Pie Chart */}
        <div className="bg-[#1e2130] rounded-xl border border-[#2a2d3e] p-5">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                {pieData.map((entry) => <Cell key={entry.name} fill={SENTIMENT_COLORS[entry.name]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e2130', border: '1px solid #2a2d3e', borderRadius: '8px', color: '#e2e8f0' }} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Feedback List */}
        <div className="lg:col-span-2 bg-[#1e2130] rounded-xl border border-[#2a2d3e] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#2a2d3e]">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Recent Feedback</h3>
          </div>
          <div className="divide-y divide-[#2a2d3e] max-h-72 overflow-y-auto">
            {data?.feedbacks.map((fb) => (
              <div key={fb._id} className="px-5 py-4 hover:bg-[#252840] transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-white text-sm">{fb.customerName}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={12} className={s <= fb.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'} />
                      ))}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sentimentBg[fb.sentiment]}`}>{fb.sentiment}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-400">{fb.feedback}</p>
                <p className="text-xs text-slate-600 mt-1">{new Date(fb.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1d27] rounded-2xl border border-[#2a2d3e] w-full max-w-md shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-[#2a2d3e]">
              <h2 className="text-lg font-semibold text-white">Submit Feedback</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Customer Name *</label>
                <input value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} required placeholder="John Doe"
                  className="w-full bg-[#252840] border border-[#2a2d3e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Feedback *</label>
                <textarea value={form.feedback} onChange={e => setForm({ ...form, feedback: e.target.value })} required rows={3} placeholder="Write your feedback here..."
                  className="w-full bg-[#252840] border border-[#2a2d3e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Rating (1–5) *</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(r => (
                    <button key={r} type="button" onClick={() => setForm({...form, rating: r})}
                      className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${form.rating >= r ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' : 'bg-[#252840] text-slate-500 border border-[#2a2d3e]'}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-[#2a2d3e] rounded-lg text-slate-300 hover:bg-[#252840] text-sm">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm disabled:opacity-60">
                  {saving ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
