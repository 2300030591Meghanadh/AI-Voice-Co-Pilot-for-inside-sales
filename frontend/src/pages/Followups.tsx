import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, 
  Plus, 
  CheckCircle, 
  Clock, 
  User, 
  Phone, 
  FileText, 
  X,
  Sparkles
} from 'lucide-react';
import { followupAPI, crmAPI } from '../services/api';
import { Followup, Customer } from '../types';

import { getUserStorageKey } from '../utils/storage';

export const Followups: React.FC = () => {
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [customerId, setCustomerId] = useState<number>(1);
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().slice(0, 16)
  );
  const [notes, setNotes] = useState<string>('');

  const fetchData = async () => {
    const custKey = getUserStorageKey('affordai_custom_customers');
    const fupKey = getUserStorageKey('affordai_custom_followups');
    try {
      const [fRes, cRes] = await Promise.all([
        followupAPI.getFollowups(),
        crmAPI.getCustomers(),
      ]);
      const apiCusts = cRes.data || [];
      const cachedCusts = localStorage.getItem(custKey);
      let customCustList: Customer[] = cachedCusts ? JSON.parse(cachedCusts) : [];
      
      const mergedCustMap = new Map<string | number, Customer>();
      customCustList.forEach(c => mergedCustMap.set(c.id, c));
      apiCusts.forEach((c: Customer) => mergedCustMap.set(c.id, c));

      const mergedCusts = Array.from(mergedCustMap.values());
      setCustomers(mergedCusts);

      // Merge Followups with Local Storage
      const cachedFollowups = localStorage.getItem(fupKey);
      let customFollowupList: Followup[] = cachedFollowups ? JSON.parse(cachedFollowups) : [];

      const mergedFupsMap = new Map<string | number, Followup>();
      customFollowupList.forEach(f => mergedFupsMap.set(f.id, f));
      (fRes.data || []).forEach((f: Followup) => mergedFupsMap.set(f.id, f));

      const mergedFollowups = Array.from(mergedFupsMap.values());
      setFollowups(mergedFollowups);

      if (mergedCusts.length > 0) {
        setCustomerId(mergedCusts[0].id);
      }
    } catch (err) {
      console.error('Error loading follow-ups:', err);
      const cachedCusts = localStorage.getItem(custKey);
      if (cachedCusts) {
        const customCustList: Customer[] = JSON.parse(cachedCusts);
        setCustomers(customCustList);
        if (customCustList.length > 0) setCustomerId(customCustList[0].id);
      }
      const cachedFollowups = localStorage.getItem(fupKey);
      if (cachedFollowups) {
        setFollowups(JSON.parse(cachedFollowups));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (id: number) => {
    const fupKey = getUserStorageKey('affordai_custom_followups');
    setFollowups(prev => {
      const updated = prev.map(f => f.id === id ? { ...f, status: (f.status === 'Pending' ? 'Completed' : 'Pending') as any } : f);
      localStorage.setItem(fupKey, JSON.stringify(updated));
      return updated;
    });
    try {
      await followupAPI.toggleStatus(id);
    } catch (err) {
      console.warn('Status toggle notice:', err);
    }
  };

  const handleCreateFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    const selCust = customers.find(c => Number(c.id) === Number(customerId)) || customers[0];
    if (!selCust) {
      alert('Please select a customer.');
      return;
    }

    const newFollowup: Followup = {
      id: Date.now(),
      customer_id: Number(selCust.id),
      customer_name: selCust.name,
      scheduled_date: new Date(scheduledDate).toISOString(),
      notes: notes || `Scheduled callback for ${selCust.name}`,
      status: 'Pending',
      created_at: new Date().toISOString()
    };

    // Save to Local Storage Cache
    const fupKey = getUserStorageKey('affordai_custom_followups');
    const cachedFollowups = localStorage.getItem(fupKey);
    let customFollowupList: Followup[] = cachedFollowups ? JSON.parse(cachedFollowups) : [];
    customFollowupList = [newFollowup, ...customFollowupList];
    localStorage.setItem(fupKey, JSON.stringify(customFollowupList));

    setFollowups(prev => [newFollowup, ...prev]);
    setIsModalOpen(false);
    setNotes('');

    try {
      await followupAPI.createFollowup({
        customer_id: Number(selCust.id),
        scheduled_date: new Date(scheduledDate).toISOString(),
        notes: notes
      });
      fetchData();
    } catch (err) {
      console.warn('Follow-up creation notice:', err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Title & Add Callback Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Customer Follow-up Module</h1>
          <p className="text-xs text-slate-400">Schedule callback reminders and track follow-up execution</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Callback</span>
        </button>
      </div>

      {/* Follow-up Reminders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {followups.map((f) => {
          const isCompleted = f.status === 'Completed';
          return (
            <div
              key={f.id}
              className={`p-5 rounded-2xl glass-panel border transition-all duration-200 ${
                isCompleted
                  ? 'border-emerald-500/30 bg-emerald-950/10'
                  : 'border-amber-500/30 bg-slate-900/90'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{f.customer_name || 'Customer Lead'}</h3>
                    <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      {new Date(f.scheduled_date).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleStatus(f.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-emerald-500/20 hover:text-emerald-400'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{f.status}</span>
                </button>
              </div>

              {f.notes && (
                <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                  <span className="text-slate-500 font-semibold block uppercase mb-0.5">Callback Notes</span>
                  {f.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Schedule Callback Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl max-w-md w-full p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Schedule Callback Reminder</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFollowup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Select Customer</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Scheduled Callback Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Callback Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Follow up on salary slip upload for Pay-in-3 eligibility..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500"
                >
                  Schedule Callback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
