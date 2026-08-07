import React, { useState, useEffect } from 'react';
import { 
  Users, 
  PhoneCall, 
  ThumbsUp, 
  CalendarClock, 
  TrendingUp, 
  Mic, 
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { analyticsAPI, crmAPI } from '../services/api';
import { AnalyticsData, Customer } from '../types';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [anRes, custRes] = await Promise.all([
          analyticsAPI.getAnalytics(),
          crmAPI.getCustomers(),
        ]);
        setAnalytics(anRes.data);
        setRecentCustomers(custRes.data.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const metrics = analytics?.summary_metrics || {
    total_customers: 24,
    total_calls: 68,
    interested_customers: 14,
    pending_followups: 6,
    conversion_rate: 58.3,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Quick Launch Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/80 via-indigo-900/80 to-slate-900 border border-blue-500/30 p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Pay-in-3 Zero-Cost EMI Active Campaign</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Ready for your next customer call?</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Upload customer call audio to generate instant transcripts, detect customer intent, query RAG product guide, and auto-sync with mini CRM.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('call-assistant')}
            className="flex-shrink-0 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all transform hover:scale-[1.02]"
          >
            <Mic className="w-5 h-5 text-amber-300 animate-pulse" />
            <span>Start Call Co-Pilot</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Customers"
          value={metrics.total_customers}
          subtitle="Registered in CRM"
          icon={Users}
          trend="+12%"
          color="blue"
        />
        <MetricCard
          title="Total Calls"
          value={metrics.total_calls}
          subtitle="Analyzed by AI"
          icon={PhoneCall}
          trend="+18%"
          color="indigo"
        />
        <MetricCard
          title="Interested"
          value={metrics.interested_customers}
          subtitle="Ready for Onboarding"
          icon={ThumbsUp}
          trend="+24%"
          color="emerald"
        />
        <MetricCard
          title="Pending Follow-ups"
          value={metrics.pending_followups}
          subtitle="Callbacks scheduled"
          icon={CalendarClock}
          trend="-5%"
          trendPositive={true}
          color="amber"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${metrics.conversion_rate}%`}
          subtitle="Pay-in-3 EMI sales"
          icon={TrendingUp}
          trend="+8.5%"
          color="purple"
        />
      </div>

      {/* Main Grid: Recent Calls & Quick RAG Product Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Customers Table */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Recent Customer Activity</h3>
              <p className="text-xs text-slate-400">Latest call logs & CRM updates</p>
            </div>
            <button
              onClick={() => setActiveTab('customers')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>View All Customers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase bg-slate-900/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Intent Status</th>
                  <th className="px-4 py-3">KYC</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-200">
                      {c.name}
                      <span className="block text-[11px] text-slate-500 font-normal">{c.email}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">{c.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        c.interest_status === 'Interested'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : c.interest_status === 'Wants Callback'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : c.interest_status === 'EMI Query' || c.interest_status === 'Eligibility Query'
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {c.interest_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${
                        c.kyc_status === 'Approved'
                          ? 'text-emerald-400'
                          : c.kyc_status === 'In Review'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}>
                        {c.kyc_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setActiveTab('call-assistant')}
                        className="px-3 py-1 text-xs font-medium rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30 transition-all"
                      >
                        Co-Pilot
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Quick Guide Panel */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Pay-in-3 Cheat Sheet</span>
            </h3>
            <button
              onClick={() => setActiveTab('knowledge-base')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300"
            >
              Docs
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-200 font-semibold">
                <span>Zero Interest Rule</span>
                <span className="text-emerald-400 font-bold">0% APR</span>
              </div>
              <p className="text-slate-400">0 interest and 0 processing fee across 3 monthly installments.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-200 font-semibold">
                <span>Eligibility Criteria</span>
                <span className="text-blue-400 font-bold">CIBIL 670+</span>
              </div>
              <p className="text-slate-400">Age 21-60 years. Salaried (Min 25k/mo) or Self-employed (Min 3L ITR).</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-200 font-semibold">
                <span>Instant KYC Verification</span>
                <span className="text-purple-400 font-bold">60 Secs</span>
              </div>
              <p className="text-slate-400">Requires PAN Card + Aadhaar linked to mobile + Auto-debit e-NACH.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-200 font-semibold">
                <span>Grace Period & Prepayment</span>
                <span className="text-amber-400 font-bold">3 Days</span>
              </div>
              <p className="text-slate-400">3 days grace period. 0% penalty on early foreclosure.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
