import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingDown, CheckCircle, BrainCircuit, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

// ─── Monitoring dataset (unchanged) ───────────────────────────────────────────
const MONITORING_DATA = {
  financial: {
    title: 'Financial Metrics',
    color: '#3b82f6',
    metrics: [
      { name: 'Revenue (₹ Cr)', value: 42.5, target: 50, unit: '₹ Cr', alert: false },
      { name: 'Expenses (₹ Cr)', value: 38.2, target: 35, unit: '₹ Cr', alert: true, alertMsg: 'Expenses exceeding target budget' },
      { name: 'Profit (₹ Cr)', value: 4.3, target: 15, unit: '₹ Cr', alert: true, alertMsg: 'Profit margin is significantly below target' },
      { name: 'Cash Flow (₹ Cr)', value: 6.8, target: 10, unit: '₹ Cr', alert: false },
    ],
    chartData: [
      { month: 'Apr', Revenue: 48, Expenses: 35 },
      { month: 'May', Revenue: 45, Expenses: 36 },
      { month: 'Jun', Revenue: 43, Expenses: 37 },
      { month: 'Jul', Revenue: 44, Expenses: 38 },
      { month: 'Aug', Revenue: 41, Expenses: 38 },
      { month: 'Sep', Revenue: 42.5, Expenses: 38.2 },
    ],
    chartKeys: ['Revenue', 'Expenses'],
    chartColors: ['#10b981', '#ef4444'],
  },
  market: {
    title: 'Market Metrics',
    color: '#8b5cf6',
    metrics: [
      { name: 'Customer Demand', value: 68, target: 85, unit: '%', alert: true, alertMsg: 'Customer demand has fallen below threshold' },
      { name: 'Customer Churn', value: 7.2, target: 3, unit: '%', alert: true, alertMsg: 'Churn rate significantly exceeds acceptable limit' },
      { name: 'Monthly Sales', value: 1240, target: 1500, unit: 'units', alert: false },
    ],
    chartData: [
      { month: 'Apr', Demand: 82, Churn: 3.1 },
      { month: 'May', Demand: 80, Churn: 4.2 },
      { month: 'Jun', Demand: 75, Churn: 5.0 },
      { month: 'Jul', Demand: 72, Churn: 6.1 },
      { month: 'Aug', Demand: 70, Churn: 6.8 },
      { month: 'Sep', Demand: 68, Churn: 7.2 },
    ],
    chartKeys: ['Demand'],
    chartColors: ['#8b5cf6'],
  },
  operational: {
    title: 'Operational Metrics',
    color: '#f59e0b',
    metrics: [
      { name: 'System Downtime', value: 8.5, target: 2, unit: 'hrs/month', alert: true, alertMsg: 'System downtime is critically high this month' },
      { name: 'Production Delays', value: 12, target: 5, unit: 'incidents', alert: true, alertMsg: 'Production delays exceeding acceptable threshold' },
      { name: 'Failed Processes', value: 3, target: 1, unit: 'incidents', alert: true, alertMsg: 'Multiple process failures detected' },
    ],
    chartData: [
      { month: 'Apr', Downtime: 2.1, Delays: 4 },
      { month: 'May', Downtime: 3.5, Delays: 6 },
      { month: 'Jun', Downtime: 4.2, Delays: 7 },
      { month: 'Jul', Downtime: 5.8, Delays: 9 },
      { month: 'Aug', Downtime: 7.2, Delays: 11 },
      { month: 'Sep', Downtime: 8.5, Delays: 12 },
    ],
    chartKeys: ['Downtime', 'Delays'],
    chartColors: ['#f59e0b', '#ef4444'],
  },
  cybersecurity: {
    title: 'Cybersecurity Metrics',
    color: '#ef4444',
    metrics: [
      { name: 'Failed Login Attempts', value: 547, target: 20, unit: 'attempts', alert: true, alertMsg: '⚠️ Possible brute-force attack detected — Failed logins: 547' },
      { name: 'Security Incidents', value: 3, target: 0, unit: 'incidents', alert: true, alertMsg: 'Multiple security incidents reported this month' },
      { name: 'Unauthorized Access', value: 12, target: 0, unit: 'attempts', alert: true, alertMsg: 'Unauthorized access attempts detected on admin panel' },
    ],
    chartData: [
      { month: 'Apr', Failed: 12, Unauthorized: 1 },
      { month: 'May', Failed: 45, Unauthorized: 3 },
      { month: 'Jun', Failed: 78, Unauthorized: 4 },
      { month: 'Jul', Failed: 210, Unauthorized: 7 },
      { month: 'Aug', Failed: 380, Unauthorized: 10 },
      { month: 'Sep', Failed: 547, Unauthorized: 12 },
    ],
    chartKeys: ['Failed', 'Unauthorized'],
    chartColors: ['#ef4444', '#f97316'],
  },
};

// ─── Unchanged sub-components ──────────────────────────────────────────────────
const MetricCard = ({ name, value, target, unit, alert, alertMsg }) => (
  <div className={`p-4 rounded-xl border transition-all ${alert ? 'bg-red-500/5 border-red-500/30' : 'bg-[#252840] border-[#2a2d3e]'}`}>
    <div className="flex items-start justify-between mb-2">
      <p className="text-xs text-slate-400">{name}</p>
      {alert
        ? <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
        : <CheckCircle size={14} className="text-green-400 flex-shrink-0" />}
    </div>
    <p className={`text-2xl font-bold ${alert ? 'text-red-400' : 'text-white'}`}>{value}<span className="text-sm font-normal text-slate-500 ml-1">{unit}</span></p>
    <p className="text-xs text-slate-500 mt-1">Target: {target} {unit}</p>
    {alert && alertMsg && <p className="text-xs text-red-400 mt-2 font-medium">{alertMsg}</p>}
  </div>
);

const Section = ({ sectionKey, data }) => (
  <div className="bg-[#1e2130] rounded-xl border border-[#2a2d3e] overflow-hidden">
    <div className="px-5 py-4 border-b border-[#2a2d3e] flex items-center gap-3">
      <div className="w-3 h-3 rounded-full" style={{ background: data.color }} />
      <h2 className="font-semibold text-white">{data.title}</h2>
    </div>
    <div className="p-5 space-y-5">
      <div className={`grid gap-4 ${data.metrics.length >= 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3'}`}>
        {data.metrics.map(m => <MetricCard key={m.name} {...m} />)}
      </div>
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wide mb-3">6-Month Trend</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data.chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#1e2130', border: '1px solid #2a2d3e', borderRadius: '8px', color: '#e2e8f0' }} />
            {data.chartKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={data.chartColors[i]} radius={[3, 3, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

// ─── ML Prediction Panel ───────────────────────────────────────────────────────
// Feature metadata: label for display, placeholder with a realistic example value,
// and a tooltip hint so the user knows what unit/scale to enter.
const FEATURE_META = [
  // Financial
  { key: 'revenue_change_pct',          label: 'Revenue Change %',           placeholder: '-15',   hint: 'Percentage change in revenue. Negative = decline.' },
  { key: 'profit_change_pct',           label: 'Profit Change %',            placeholder: '-20',   hint: 'Percentage change in profit.' },
  { key: 'expense_change_pct',          label: 'Expense Change %',           placeholder: '10',    hint: 'Percentage change in operating expenses.' },
  { key: 'debt_ratio',                  label: 'Debt Ratio',                 placeholder: '0.45',  hint: 'Total debt / total assets (0–1).' },
  // Market
  { key: 'customer_demand_change_pct',  label: 'Customer Demand Change %',   placeholder: '-12',   hint: 'Percentage change in customer demand volume.' },
  { key: 'customer_churn_pct',          label: 'Customer Churn %',           placeholder: '7',     hint: 'Monthly customer churn rate (%).' },
  { key: 'sales_change_pct',            label: 'Sales Change %',             placeholder: '-8',    hint: 'Percentage change in sales volume.' },
  // Operational
  { key: 'downtime_hours',              label: 'Downtime Hours',             placeholder: '8',     hint: 'Unplanned system downtime hours this month.' },
  { key: 'operational_incidents',       label: 'Operational Incidents',      placeholder: '12',    hint: 'Number of operational failure incidents.' },
  { key: 'delivery_delay_pct',          label: 'Delivery Delay %',           placeholder: '15',    hint: 'Percentage of deliveries delayed.' },
  // Cybersecurity
  { key: 'failed_login_attempts',       label: 'Failed Login Attempts',      placeholder: '547',   hint: 'Total failed login attempts detected.' },
  { key: 'security_incidents',          label: 'Security Incidents',         placeholder: '3',     hint: 'Number of confirmed security incidents.' },
  { key: 'vulnerability_count',         label: 'Vulnerability Count',        placeholder: '12',    hint: 'Number of unpatched vulnerabilities detected.' },
  // Reputation
  { key: 'negative_feedback_pct',       label: 'Negative Feedback %',        placeholder: '35',    hint: 'Percentage of negative customer feedback.' },
  { key: 'average_rating',              label: 'Average Customer Rating',    placeholder: '3.2',   hint: 'Average product/service rating (1–5).' },
  { key: 'sentiment_score',             label: 'Sentiment Score',            placeholder: '-0.3',  hint: 'NLP sentiment score (−1 very negative → +1 very positive).' },
];

const LEVEL_STYLES = {
  Low:      { bg: 'bg-green-500/10',  border: 'border-green-500/30',  text: 'text-green-400',  badge: 'bg-green-500/20 text-green-300' },
  Medium:   { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-300' },
  High:     { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-300' },
  Critical: { bg: 'bg-red-500/10',    border: 'border-red-500/30',    text: 'text-red-400',    badge: 'bg-red-500/20 text-red-300'    },
};

const CATEGORY_GROUPS = [
  { label: 'Financial',      keys: ['revenue_change_pct', 'profit_change_pct', 'expense_change_pct', 'debt_ratio'] },
  { label: 'Market',         keys: ['customer_demand_change_pct', 'customer_churn_pct', 'sales_change_pct'] },
  { label: 'Operational',    keys: ['downtime_hours', 'operational_incidents', 'delivery_delay_pct'] },
  { label: 'Cybersecurity',  keys: ['failed_login_attempts', 'security_incidents', 'vulnerability_count'] },
  { label: 'Reputation',     keys: ['negative_feedback_pct', 'average_rating', 'sentiment_score'] },
];

const INITIAL_FORM = Object.fromEntries(FEATURE_META.map(f => [f.key, '']));

function PredictRiskPanel() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    // Convert all strings to numbers, catch non-numeric early
    const payload = {};
    for (const { key, label } of FEATURE_META) {
      const raw = form[key];
      if (raw === '' || raw === null || raw === undefined) {
        setError(`"${label}" is required.`);
        return;
      }
      const num = Number(raw);
      if (!isFinite(num)) {
        setError(`"${label}" must be a valid number.`);
        return;
      }
      payload[key] = num;
    }

    setLoading(true);
    try {
      const { data } = await axios.post('/api/ml/predict', payload);
      setResult(data);
    } catch (err) {
      if (err.response) {
        const msg = err.response.data?.message || JSON.stringify(err.response.data);
        setError(`Server error (${err.response.status}): ${msg}`);
      } else if (err.code === 'ERR_NETWORK') {
        setError('Cannot reach the backend. Ensure the Express server is running on port 5000.');
      } else {
        setError(err.message || 'Unexpected error.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setResult(null);
    setError('');
  };

  const levelStyle = result ? (LEVEL_STYLES[result.predicted_risk_level] || LEVEL_STYLES.Medium) : null;

  return (
    <div className="bg-[#1e2130] rounded-xl border border-[#2a2d3e] overflow-hidden">
      {/* Header – click to expand/collapse */}
      <button
        id="ml-predict-toggle"
        onClick={() => setOpen(v => !v)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <BrainCircuit size={18} className="text-indigo-400" />
          <span className="font-semibold text-white">ML Risk Prediction</span>
          <span className="text-xs text-slate-400 bg-[#252840] px-2 py-0.5 rounded-full">SVM model</span>
        </div>
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>

      {open && (
        <div className="border-t border-[#2a2d3e] p-5">
          <p className="text-sm text-slate-400 mb-5">
            Enter the 16 organizational metrics below. The SVM model will predict the overall risk level.
            These predictions are independent of the rule-based scores shown on the Dashboard.
          </p>

          <form id="ml-predict-form" onSubmit={handleSubmit}>
            {CATEGORY_GROUPS.map(group => (
              <div key={group.label} className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">{group.label}</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {group.keys.map(key => {
                    const meta = FEATURE_META.find(f => f.key === key);
                    return (
                      <div key={key} className="group relative">
                        <label htmlFor={`ml-${key}`} className="block text-xs text-slate-400 mb-1">
                          {meta.label}
                        </label>
                        <input
                          id={`ml-${key}`}
                          type="number"
                          step="any"
                          name={key}
                          value={form[key]}
                          onChange={handleChange}
                          placeholder={meta.placeholder}
                          required
                          className="w-full px-3 py-2 bg-[#252840] border border-[#2a2d3e] rounded-lg text-white text-sm
                            focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500
                            placeholder:text-slate-600 transition-colors"
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-0 mb-1.5 z-10 hidden group-hover:block">
                          <div className="bg-[#0f1117] text-slate-300 text-xs rounded-lg px-3 py-2 max-w-[200px] border border-[#2a2d3e] shadow-xl">
                            {meta.hint}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Actions */}
            <div className="flex items-center gap-3 mt-2">
              <button
                id="ml-predict-submit"
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500
                  disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium
                  text-white transition-colors"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? 'Predicting…' : 'Predict Risk'}
              </button>
              <button
                id="ml-predict-reset"
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 text-sm text-slate-400 hover:text-white border border-[#2a2d3e]
                  hover:border-slate-500 rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>
          </form>

          {/* Error */}
          {error && (
            <div className="mt-4 flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Result */}
          {result && levelStyle && (
            <div id="ml-predict-result" className={`mt-5 rounded-xl border p-5 ${levelStyle.bg} ${levelStyle.border}`}>
              <div className="flex items-center gap-3 mb-4">
                <BrainCircuit size={18} className={levelStyle.text} />
                <p className="font-semibold text-white">Prediction Result</p>
                <span className={`ml-auto text-sm font-bold px-3 py-1 rounded-full ${levelStyle.badge}`}>
                  {result.predicted_risk_level}
                </span>
              </div>

              {result.class_probabilities && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-3">Class Probabilities</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(result.class_probabilities)
                      .sort((a, b) => b[1] - a[1])
                      .map(([cls, prob]) => {
                        const s = LEVEL_STYLES[cls] || LEVEL_STYLES.Medium;
                        const pct = (prob * 100).toFixed(1);
                        return (
                          <div key={cls} className="bg-[#1e2130] rounded-lg p-3">
                            <p className={`text-xs font-medium mb-1 ${s.text}`}>{cls}</p>
                            <div className="w-full bg-[#2a2d3e] rounded-full h-1.5 mb-1">
                              <div
                                className={`h-1.5 rounded-full ${s.badge.split(' ')[0].replace('/20', '/60')}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <p className="text-white text-sm font-semibold">{pct}%</p>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              <p className="mt-4 text-xs text-slate-500">
                Note: This is an ML model prediction based on the 16 metrics you entered. It is separate from
                the rule-based risk scores computed by the CRAMS assessment engine.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function Monitoring() {
  const allAlerts = Object.values(MONITORING_DATA)
    .flatMap(s => s.metrics.filter(m => m.alert).map(m => ({ ...m, section: s.title })));

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Monitoring</h1>
        <p className="text-slate-400 text-sm">Real-time organizational metrics across all risk categories</p>
      </div>

      {/* Active Warnings */}
      {allAlerts.length > 0 && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown size={18} className="text-red-400" />
            <p className="font-semibold text-red-400">{allAlerts.length} Active Threshold Warnings</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {allAlerts.map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                <span className="text-slate-400"><span className="text-red-400 font-medium">{a.section}:</span> {a.alertMsg}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metric Sections */}
      {Object.entries(MONITORING_DATA).map(([key, data]) => (
        <Section key={key} sectionKey={key} data={data} />
      ))}

      {/* ML Prediction Panel */}
      <PredictRiskPanel />
    </div>
  );
}
