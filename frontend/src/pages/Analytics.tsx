import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieIcon, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { analyticsAPI } from '../services/api';
import { AnalyticsData } from '../types';

export const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await analyticsAPI.getAnalytics();
        setData(res.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const dailyCalls = data?.daily_calls || [
    { day: 'Mon', calls: 12, conversions: 7 },
    { day: 'Tue', calls: 18, conversions: 11 },
    { day: 'Wed', calls: 15, conversions: 9 },
    { day: 'Thu', calls: 22, conversions: 14 },
    { day: 'Fri', calls: 19, conversions: 12 },
    { day: 'Sat', calls: 8, conversions: 5 },
    { day: 'Sun', calls: 4, conversions: 2 },
  ];

  const intentDist = data?.intent_distribution || [
    { name: 'Interested', value: 35, color: '#10B981' },
    { name: 'EMI Query', value: 25, color: '#3B82F6' },
    { name: 'Eligibility Query', value: 15, color: '#8B5CF6' },
    { name: 'Wants Callback', value: 12, color: '#F59E0B' },
    { name: 'KYC Query', value: 8, color: '#06B6D4' },
    { name: 'Not Interested', value: 5, color: '#EF4444' },
  ];

  const objections = data?.common_objections || [
    { objection: 'CIBIL Score Concerns', count: 28, percentage: 34 },
    { objection: 'Document Upload Friction', count: 21, percentage: 26 },
    { objection: 'Fear of Hidden Charges', count: 18, percentage: 22 },
    { objection: 'Prefers Credit Card Points', count: 14, percentage: 18 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Sales Analytics & Insights</h1>
          <p className="text-xs text-slate-400">Deep performance metrics on Pay-in-3 customer calls, objections, and conversions</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs text-slate-300 font-semibold">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span>Last 7 Days Performance</span>
        </div>
      </div>

      {/* Grid 1: Daily Calls & Conversion Line Chart + Customer Intent Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Daily Calls & Conversions (7 Cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <span>Daily Calls & Conversions Trend</span>
              </h3>
              <p className="text-xs text-slate-400">Call volume vs. Pay-in-3 sales conversions</p>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyCalls}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                />
                <Line type="monotone" dataKey="calls" stroke="#3b82f6" strokeWidth={3} name="Total Calls" />
                <Line type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={3} name="Conversions" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Intent Distribution Pie Chart (5 Cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-purple-400" />
              <span>Customer Intent Distribution</span>
            </h3>
            <p className="text-xs text-slate-400">Classified by Whisper & OpenAI pipeline</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={intentDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {intentDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {intentDist.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 truncate">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid 2: Most Common Objections + Follow-up Completion Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Common Objections Breakdown */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Most Common Customer Objections</span>
            </h3>
            <p className="text-xs text-slate-400">Extracted from speech-to-text call transcripts</p>
          </div>

          <div className="space-y-3">
            {objections.map((obj, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{obj.objection}</span>
                  <span className="font-bold text-amber-400">{obj.count} calls ({obj.percentage}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full"
                    style={{ width: `${obj.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Follow-up Completion Status */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Follow-up Callback Completion</span>
            </h3>
            <p className="text-xs text-slate-400">Callback execution rate across sales team</p>
          </div>

          <div className="flex items-center justify-around p-6 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-center">
              <span className="text-3xl font-extrabold text-white">66.7%</span>
              <span className="block text-xs text-emerald-400 font-semibold mt-1">Completion Rate</span>
            </div>
            <div className="h-12 w-px bg-slate-800"></div>
            <div className="text-center">
              <span className="text-3xl font-extrabold text-amber-400">6</span>
              <span className="block text-xs text-slate-400 mt-1">Pending Callback</span>
            </div>
            <div className="h-12 w-px bg-slate-800"></div>
            <div className="text-center">
              <span className="text-3xl font-extrabold text-emerald-400">12</span>
              <span className="block text-xs text-slate-400 mt-1">Completed Callback</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
