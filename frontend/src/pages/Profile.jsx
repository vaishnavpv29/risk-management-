import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-6">Profile</h1>

      <div className="max-w-2xl space-y-5">
        {/* Profile Card */}
        <div className="bg-[#1e2130] rounded-xl border border-[#2a2d3e] p-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
              <p className="text-slate-400 text-sm">{user?.email}</p>
              <span className={`inline-flex mt-2 px-3 py-0.5 rounded-full text-xs font-semibold ${user?.role === 'admin' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'}`}>
                {user?.role === 'admin' ? 'Administrator' : 'Risk Manager'}
              </span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-[#1e2130] rounded-xl border border-[#2a2d3e] p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Account Information</h3>
          {[
            { icon: User, label: 'Full Name', value: user?.name },
            { icon: Mail, label: 'Email Address', value: user?.email },
            { icon: Shield, label: 'Role', value: user?.role === 'admin' ? 'Administrator' : 'Risk Manager' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 p-3 rounded-lg bg-[#252840]">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Icon size={16} className="text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-sm font-medium text-white capitalize">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* System Info */}
        <div className="bg-[#1e2130] rounded-xl border border-[#2a2d3e] p-6">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">System Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-[#2a2d3e]">
              <span className="text-slate-400">System Name</span>
              <span className="text-white font-medium">CRAMS v1.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#2a2d3e]">
              <span className="text-slate-400">Technology Stack</span>
              <span className="text-white font-medium">MERN Stack</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#2a2d3e]">
              <span className="text-slate-400">Risk Categories</span>
              <span className="text-white font-medium">5 Categories</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Project Type</span>
              <span className="text-white font-medium">Final Year Project</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
