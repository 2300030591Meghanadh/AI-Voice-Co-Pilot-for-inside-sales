import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  Phone, 
  Mail, 
  Calendar, 
  CheckCircle, 
  X,
  FileText,
  Save
} from 'lucide-react';
import { crmAPI } from '../services/api';
import { Customer } from '../types';
import { getUserStorageKey } from '../utils/storage';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [kycFilter, setKycFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    interest_status: 'Interested',
    kyc_status: 'Pending',
    call_summary: ''
  });

  const fetchCustomers = async () => {
    const storageKey = getUserStorageKey('affordai_custom_customers');
    try {
      const res = await crmAPI.getCustomers();
      const cached = localStorage.getItem(storageKey);
      let customList: Customer[] = cached ? JSON.parse(cached) : [];
      
      const mergedMap = new Map<string | number, Customer>();
      customList.forEach(c => mergedMap.set(c.id, c));
      res.data.forEach((c: Customer) => mergedMap.set(c.id, c));

      const merged = Array.from(mergedMap.values()).sort((a, b) => 
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );

      setCustomers(merged);
      setFilteredCustomers(merged);
    } catch (err) {
      console.error('Error loading customers:', err);
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        setCustomers(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    let result = customers;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
      );
    }

    if (statusFilter !== 'All') {
      result = result.filter(c => c.interest_status === statusFilter);
    }

    if (kycFilter !== 'All') {
      result = result.filter(c => c.kyc_status === kycFilter);
    }

    setFilteredCustomers(result);
  }, [searchQuery, statusFilter, kycFilter, customers]);

  const handleOpenAddModal = () => {
    setSelectedCustomer(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      interest_status: 'Interested',
      kyc_status: 'Pending',
      call_summary: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: Customer) => {
    setSelectedCustomer(c);
    setFormData({
      name: c.name,
      phone: c.phone,
      email: c.email,
      interest_status: c.interest_status,
      kyc_status: c.kyc_status,
      call_summary: c.call_summary || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Please provide a name and phone number.');
      return;
    }

    const tempId = selectedCustomer ? selectedCustomer.id : Date.now();
    const newCustomerObj: Customer = {
      id: tempId,
      name: formData.name,
      phone: formData.phone,
      email: formData.email || `${tempId}@example.com`,
      interest_status: formData.interest_status as any,
      kyc_status: formData.kyc_status as any,
      call_summary: formData.call_summary,
      call_date: new Date().toISOString(),
      created_at: selectedCustomer?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 1. Update localStorage cache so it's persisted across tab switches
    const storageKey = getUserStorageKey('affordai_custom_customers');
    const cached = localStorage.getItem(storageKey);
    let customList: Customer[] = cached ? JSON.parse(cached) : [];
    if (selectedCustomer) {
      customList = customList.map(c => c.id === selectedCustomer.id ? newCustomerObj : c);
    } else {
      customList = [newCustomerObj, ...customList];
    }
    localStorage.setItem(storageKey, JSON.stringify(customList));

    // 2. Update local React state immediately
    if (selectedCustomer) {
      setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? newCustomerObj : c));
    } else {
      setCustomers(prev => [newCustomerObj, ...prev]);
    }
    setIsModalOpen(false);

    // 3. Sync to API backend
    try {
      if (selectedCustomer) {
        await crmAPI.updateCustomer(selectedCustomer.id, formData);
      } else {
        const res = await crmAPI.createCustomer(formData);
        if (res.data?.id) {
          const realCustomer = { ...newCustomerObj, id: res.data.id };
          customList = customList.map(c => c.id === tempId ? realCustomer : c);
          localStorage.setItem(storageKey, JSON.stringify(customList));
          setCustomers(prev => prev.map(c => c.id === tempId ? realCustomer : c));
        }
      }
    } catch (err) {
      console.warn('Backend sync notice (saved locally in browser):', err);
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this customer record?')) {
      const storageKey = getUserStorageKey('affordai_custom_customers');
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const customList: Customer[] = JSON.parse(cached);
        const updated = customList.filter(c => c.id !== id);
        localStorage.setItem(storageKey, JSON.stringify(updated));
      }
      setCustomers(prev => prev.filter(c => c.id !== id));
      try {
        await crmAPI.deleteCustomer(id);
      } catch (err) {
        console.warn('API delete notice:', err);
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Mini CRM Customer Management</h1>
          <p className="text-xs text-slate-400">Manage sales leads, interest classifications, and KYC statuses</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="glass-panel rounded-xl p-4 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Interest Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Intents</option>
              <option value="Interested">Interested</option>
              <option value="Wants Callback">Wants Callback</option>
              <option value="EMI Query">EMI Query</option>
              <option value="Eligibility Query">Eligibility Query</option>
              <option value="KYC Query">KYC Query</option>
              <option value="Not Interested">Not Interested</option>
            </select>
          </div>

          {/* KYC Status Filter */}
          <select
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All KYC Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Review">In Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Customer Data Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Customer Name</th>
                <th className="px-5 py-3.5">Phone & Email</th>
                <th className="px-5 py-3.5">Interest Status</th>
                <th className="px-5 py-3.5">KYC Status</th>
                <th className="px-5 py-3.5">Call Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-100">{c.name}</td>
                  <td className="px-5 py-4">
                    <div className="text-slate-300 font-mono text-xs flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-500" /> {c.phone}
                    </div>
                    <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-500" /> {c.email}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      c.interest_status === 'Interested'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : c.interest_status === 'Wants Callback'
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : c.interest_status === 'Not Interested'
                        ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                        : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                    }`}>
                      {c.interest_status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold ${
                      c.kyc_status === 'Approved' ? 'text-emerald-400' :
                      c.kyc_status === 'In Review' ? 'text-amber-400' :
                      c.kyc_status === 'Rejected' ? 'text-red-400' : 'text-slate-400'
                    }`}>
                      {c.kyc_status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-400">
                    {c.call_date ? new Date(c.call_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-5 py-4 text-right space-x-2">
                    <button
                      onClick={() => setDetailCustomer(c)}
                      title="View Details & Call Summary"
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(c)}
                      title="Edit Customer"
                      className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(c.id)}
                      title="Delete Customer"
                      className="p-1.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl max-w-md w-full p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {selectedCustomer ? 'Edit Customer Record' : 'Add New Customer'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Email</label>
                  <input
                    type="text"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Interest Status</label>
                  <select
                    value={formData.interest_status}
                    onChange={(e) => setFormData({ ...formData, interest_status: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                  >
                    <option value="Interested">Interested</option>
                    <option value="Wants Callback">Wants Callback</option>
                    <option value="EMI Query">EMI Query</option>
                    <option value="Eligibility Query">Eligibility Query</option>
                    <option value="KYC Query">KYC Query</option>
                    <option value="Not Interested">Not Interested</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">KYC Status</label>
                  <select
                    value={formData.kyc_status}
                    onChange={(e) => setFormData({ ...formData, kyc_status: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Review">In Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Call Summary Notes</label>
                <textarea
                  rows={3}
                  value={formData.call_summary}
                  onChange={(e) => setFormData({ ...formData, call_summary: e.target.value })}
                  placeholder="Notes from customer call..."
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
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Detail Drawer / Modal */}
      {detailCustomer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl max-w-lg w-full p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">{detailCustomer.name}</h3>
                <span className="text-xs text-slate-400">Customer Details & Co-Pilot Summary</span>
              </div>
              <button onClick={() => setDetailCustomer(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <div>
                  <span className="text-xs text-slate-500 uppercase">Phone Number</span>
                  <p className="text-slate-200 font-mono text-xs">{detailCustomer.phone}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase">Email</span>
                  <p className="text-slate-200 text-xs truncate">{detailCustomer.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <div>
                  <span className="text-xs text-slate-500 uppercase">Intent Classification</span>
                  <p className="text-emerald-400 font-semibold">{detailCustomer.interest_status}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase">KYC Status</span>
                  <p className="text-blue-400 font-semibold">{detailCustomer.kyc_status}</p>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">AI Generated Call Summary</span>
                <div className="mt-1 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 text-xs leading-relaxed">
                  {detailCustomer.call_summary || 'No call summary recorded yet for this customer.'}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDetailCustomer(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
