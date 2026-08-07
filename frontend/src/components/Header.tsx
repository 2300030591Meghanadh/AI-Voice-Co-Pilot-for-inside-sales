import React, { useState, useRef, useEffect } from 'react';
import { Bell, Sparkles, ShieldCheck, Check, Clock, PhoneCall, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  title: string;
  description?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, description }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [unread, setUnread] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const notifications = [
    {
      id: 1,
      title: "Callback Reminder Due",
      message: "Scheduled follow-up with Rahul Sharma for Pay-in-3 eligibility.",
      time: "10m ago",
      type: "reminder",
      icon: Clock,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
    },
    {
      id: 2,
      title: "Call Transcript Processed",
      message: "Whisper AI successfully transcribed sample sales call with 96% accuracy.",
      time: "25m ago",
      type: "call",
      icon: PhoneCall,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
    },
    {
      id: 3,
      title: "CRM Auto-Sync Complete",
      message: "Customer record updated with Interested status & Pay-in-3 approval.",
      time: "1h ago",
      type: "crm",
      icon: ShieldCheck,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-slate-800 px-6 py-4 flex items-center justify-between">
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

        {/* Notifications Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => { setIsOpen(!isOpen); setUnread(false); }}
            className={`relative p-2 rounded-lg transition-all ${
              isOpen ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unread && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-slate-900 animate-pulse"></span>
            )}
          </button>

          {/* Popup Dropdown Panel */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel bg-slate-900/95 border border-slate-800 shadow-2xl p-4 space-y-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-purple-400" />
                  <h4 className="text-sm font-bold text-white">Live AI Notifications</h4>
                </div>
                <span className="text-[10px] font-semibold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">
                  {notifications.length} New
                </span>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {notifications.map((n) => {
                  const IconComponent = n.icon;
                  return (
                    <div key={n.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all flex items-start gap-3">
                      <div className={`p-2 rounded-lg border ${n.color} flex-shrink-0 mt-0.5`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-slate-200 truncate">{n.title}</h5>
                          <span className="text-[10px] text-slate-500">{n.time}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => setUnread(false)}
                  className="text-slate-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark all as read</span>
                </button>
                <span className="text-[10px] text-slate-500">AffordAI Real-time Feed</span>
              </div>
            </div>
          )}
        </div>

        {/* Sales Product Tag */}
        <div className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 px-3.5 py-1.5 rounded-lg border border-blue-500/30 text-xs text-blue-300 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Pay-in-3 Zero-Cost EMI</span>
        </div>
      </div>
    </header>
  );
};
