import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { CallAssistant } from './pages/CallAssistant';
import { KnowledgeBase } from './pages/KnowledgeBase';
import { Analytics } from './pages/Analytics';
import { Followups } from './pages/Followups';
import { Settings } from './pages/Settings';

const MainLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAuthenticated) {
    return <Login />;
  }

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return { title: 'Dashboard Overview', desc: 'Real-time sales performance & recent calls' };
      case 'call-assistant': return { title: 'Call Assistant Co-Pilot', desc: 'Speech-to-text, intent detection, RAG & AI suggestions' };
      case 'customers': return { title: 'Customer Management (Mini CRM)', desc: 'Search, filter, and update customer sales leads' };
      case 'knowledge-base': return { title: 'Product Knowledge Base', desc: 'Manage PDF product documents & FAISS vector embeddings' };
      case 'analytics': return { title: 'Sales Analytics & Insights', desc: 'Call metrics, conversion rates, and objections' };
      case 'follow-ups': return { title: 'Callback Follow-up Reminders', desc: 'Scheduled customer callbacks' };
      case 'settings': return { title: 'System Settings', desc: 'Configure AI models & API parameters' };
      default: return { title: 'Dashboard', desc: '' };
    }
  };

  const { title, desc } = getPageTitle();

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <Header title={title} description={desc} />

        <div className="flex-1">
          {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
          {activeTab === 'call-assistant' && <CallAssistant />}
          {activeTab === 'customers' && <Customers />}
          {activeTab === 'knowledge-base' && <KnowledgeBase />}
          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'follow-ups' && <Followups />}
          {activeTab === 'settings' && <Settings />}
        </div>
      </main>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;
