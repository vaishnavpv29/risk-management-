import React, { useEffect, useState } from 'react';
import axios from 'axios';
import RiskBadge from '../components/RiskBadge';
import { Bell, BellOff, AlertTriangle } from 'lucide-react';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    axios.get('/api/alerts')
      .then(res => setAlerts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleStatus = async (alert) => {
    const newStatus = alert.status === 'Unread' ? 'Read' : 'Unread';
    const res = await axios.put(`/api/alerts/${alert._id}`, { status: newStatus });
    setAlerts(alerts.map(a => a._id === alert._id ? res.data : a));
  };

  const filtered = alerts.filter(a =>
    filter === 'All' || (filter === 'Unread' ? a.status === 'Unread' : a.status === 'Read')
  );

  const unreadCount = alerts.filter(a => a.status === 'Unread').length;

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Alerts</h1>
          <p className="text-slate-400 text-sm">{unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          {['All', 'Unread', 'Read'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-blue-600 text-white' : 'bg-[#1e2130] border border-[#2a2d3e] text-slate-400 hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#1e2130] rounded-xl border border-[#2a2d3e] p-12 text-center">
          <AlertTriangle size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No alerts found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => (
            <div key={alert._id}
              className={`bg-[#1e2130] rounded-xl border p-5 flex items-start gap-4 transition-all ${alert.status === 'Unread' ? 'border-red-500/30' : 'border-[#2a2d3e]'}`}>
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${alert.level === 'Critical' ? 'bg-red-500/20' : 'bg-orange-500/20'}`}>
                <Bell size={18} className={alert.level === 'Critical' ? 'text-red-400' : 'text-orange-400'} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <RiskBadge level={alert.level} />
                  <span className="text-xs bg-[#252840] text-slate-400 px-2 py-0.5 rounded-full">{alert.category}</span>
                  {alert.status === 'Unread' && (
                    <span className="w-2 h-2 bg-red-500 rounded-full" title="Unread" />
                  )}
                </div>
                <h3 className="font-semibold text-white">{alert.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{alert.message}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                  <span>Score: <span className="text-white font-medium">{alert.riskScore}</span></span>
                  <span>{new Date(alert.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              </div>

              {/* Action */}
              <button onClick={() => toggleStatus(alert)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 ${
                  alert.status === 'Unread'
                    ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20'
                    : 'bg-[#252840] text-slate-400 hover:text-white border border-[#2a2d3e]'
                }`}>
                {alert.status === 'Unread' ? <><Bell size={12} /> Mark Read</> : <><BellOff size={12} /> Mark Unread</>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
