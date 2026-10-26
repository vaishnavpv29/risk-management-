import React from 'react';

export default function RiskBadge({ level }) {
  const styles = {
    Low: 'badge-low',
    Medium: 'badge-medium',
    High: 'badge-high',
    Critical: 'badge-critical',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[level] || 'badge-medium'}`}>
      {level}
    </span>
  );
}
