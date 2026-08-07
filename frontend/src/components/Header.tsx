import React from 'react';
import { Bell, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  title: string;
  description?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, description }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 glass-panel border-b border-slate-800 px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          {title}
        </h2>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Active AI Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Pay-in-3 AI Assistant Active</span>
        </div>

        {/* Security Badge */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-700/50">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>JWT Protected</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500"></span>
        </button>

        {/* Sales Product Tag */}
        <div className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 px-3.5 py-1.5 rounded-lg border border-blue-500/30 text-xs text-blue-300 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Pay-in-3 Zero-Cost EMI</span>
        </div>
      </div>
    </header>
  );
};
