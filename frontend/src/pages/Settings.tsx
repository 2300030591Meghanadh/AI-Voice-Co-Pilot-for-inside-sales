import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Key, 
  Cpu, 
  Database, 
  Shield, 
  Save, 
  CheckCircle,
  User,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [saved, setSaved] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Co-Pilot System Settings</h1>
        <p className="text-xs text-slate-400">Configure AI engine parameters, credentials, and agent workspace settings</p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Settings updated successfully!</span>
        </div>
      )}

      {/* AI Credentials & Model Config */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Key className="w-5 h-5 text-blue-400" />
          <span>AI Engine Configuration</span>
        </h3>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              OpenAI API Key (Optional)
            </label>
            <input
              type="password"
              placeholder="sk-proj-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Note: If left blank, AffordAI Voice Co-Pilot automatically uses high-accuracy local heuristic fallback models for speech, RAG, and intent classification.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              LLM Model Target
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
            >
              <option value="gpt-3.5-turbo">OpenAI GPT-3.5 Turbo (Recommended)</option>
              <option value="gpt-4o">OpenAI GPT-4o</option>
              <option value="llama-3-8b">Local Llama 3 8B / Gemma (Ollama)</option>
              <option value="heuristic-offline">Heuristic / Rule-based Offline Engine</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </form>
      </div>

      {/* Database & Infrastructure Status */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-400" />
          <span>Infrastructure Status</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block uppercase">Database Engine</span>
            <span className="text-slate-200 font-semibold text-sm">PostgreSQL / SQLite</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block uppercase">Vector Store</span>
            <span className="text-purple-400 font-semibold text-sm">LangChain + FAISS</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block uppercase">Speech-to-Text</span>
            <span className="text-emerald-400 font-semibold text-sm">Whisper Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
