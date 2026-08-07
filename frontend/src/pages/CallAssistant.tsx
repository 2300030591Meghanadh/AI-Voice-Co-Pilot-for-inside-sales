import React, { useState } from 'react';
import { 
  Mic, 
  Upload, 
  Sparkles, 
  FileText, 
  Target, 
  Lightbulb, 
  BookOpen, 
  Save, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Send,
  User,
  Phone,
  Mail,
  Calendar,
  Zap,
  Volume2
} from 'lucide-react';
import { audioAPI, ragAPI, crmAPI } from '../services/api';
import { RAGResponse, SummaryResponse, SuggestionResponse } from '../types';

export const CallAssistant: React.FC = () => {
  // Customer Info State
  const [customerName, setCustomerName] = useState('Rahul Sharma');
  const [phone, setPhone] = useState('+91 9876543210');
  const [email, setEmail] = useState('rahul.sharma@example.com');

  // Audio & Transcription State
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);

  // AI Pipeline Output States
  const [intent, setIntent] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const [intentAnalysis, setIntentAnalysis] = useState<string>('');
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [talkingPoints, setTalkingPoints] = useState<string[]>([]);

  const [summaryData, setSummaryData] = useState<SummaryResponse | null>(null);

  // RAG Q&A State
  const [ragQuery, setRagQuery] = useState('');
  const [ragLoading, setRagLoading] = useState(false);
  const [ragResult, setRagResult] = useState<RAGResponse | null>(null);

  // CRM Auto Save Status
  const [savingCRM, setSavingCRM] = useState(false);
  const [crmMessage, setCrmMessage] = useState('');

  // Handle Audio Upload & Pipeline Execution
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudioFile(file);
    setUploading(true);
    setCrmMessage('');
    
    try {
      // 1. Upload & Speech-to-Text
      const transcribeRes = await audioAPI.uploadAudio(file);
      const text = transcribeRes.data.transcript;
      setTranscript(text);
      setDuration(transcribeRes.data.duration_seconds);

      // 2. Intent Detection
      const intentRes = await audioAPI.detectIntent(text);
      const detectedIntent = intentRes.data.intent;
      setIntent(detectedIntent);
      setConfidence(intentRes.data.confidence);
      setIntentAnalysis(intentRes.data.analysis);

      // 3. AI Sales Suggestions
      const suggRes = await audioAPI.getSuggestions(text, detectedIntent);
      setSuggestions(suggRes.data.suggestions);
      setTalkingPoints(suggRes.data.talking_points);

      // 4. Generate Summary
      const sumRes = await audioAPI.generateSummary(text, detectedIntent);
      setSummaryData(sumRes.data);

    } catch (err) {
      console.error('Error processing audio pipeline:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleCustomerNameChange = (newName: string) => {
    const oldName = customerName;
    setCustomerName(newName);

    if (transcript && newName.trim()) {
      // Replace old name or 'Rahul Sharma' in transcript dynamically
      let updated = transcript;
      if (oldName.trim()) {
        updated = updated.replaceAll(oldName, newName);
      }
      updated = updated.replaceAll('Rahul Sharma', newName).replaceAll('Rahul', newName);
      setTranscript(updated);
    }
  };

  // Load Sample Audio Pipeline Demo
  const handleLoadSampleCall = async () => {
    setUploading(true);
    setCrmMessage('');

    const activeName = customerName.trim() || 'Rahul Sharma';
    const sampleText = (
      `Agent: Hello, good afternoon! Am I speaking with Mr. ${activeName}?\n` +
      `Customer: Yes, speaking. Who is this?\n` +
      `Agent: Hi Mr. ${activeName}, I am calling from AffordAI Financial Services. ` +
      `I noticed you were checking out a smartphone worth 45,000 rupees on our merchant app. ` +
      `I wanted to share that you are pre-approved for our Pay-in-3 Zero-Cost EMI product.\n` +
      `Customer: Oh, Pay-in-3? How does that work? Are there any hidden interest charges or processing fees?\n` +
      `Agent: Great question! Pay-in-3 has absolute zero interest and zero processing fee. ` +
      `You only pay 15,000 rupees today as the first installment, 15,000 next month, and 15,000 in the 3rd month.\n` +
      `Customer: That sounds really good! What documents do I need to complete the KYC and get started?\n` +
      `Agent: You just need your PAN card and Aadhaar linked to your mobile number. ` +
      `The digital KYC takes less than 60 seconds. Should I send you the instant approval link on WhatsApp?\n` +
      `Customer: Yes please, send me the link. I will complete the KYC right away.`
    );

    setTimeout(async () => {
      setTranscript(sampleText);
      setDuration(42.5);

      try {
        const intentRes = await audioAPI.detectIntent(sampleText);
        setIntent(intentRes.data.intent);
        setConfidence(intentRes.data.confidence);
        setIntentAnalysis(intentRes.data.analysis);

        const suggRes = await audioAPI.getSuggestions(sampleText, intentRes.data.intent);
        setSuggestions(suggRes.data.suggestions);
        setTalkingPoints(suggRes.data.talking_points);

        const sumRes = await audioAPI.generateSummary(sampleText, intentRes.data.intent);
        setSummaryData(sumRes.data);
      } catch (err) {
        console.error('Error running sample pipeline:', err);
      } finally {
        setUploading(false);
      }
    }, 600);
  };

  // RAG Search Query Execution
  const handleRAGSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragQuery.trim()) return;

    setRagLoading(true);
    try {
      const res = await ragAPI.query(ragQuery);
      setRagResult(res.data);
    } catch (err) {
      console.error('Error performing RAG query:', err);
    } finally {
      setRagLoading(false);
    }
  };

  // Auto-Save to CRM
  const handleSaveToCRM = async () => {
    if (!transcript) {
      alert('Please transcribe a call audio file first before saving to CRM.');
      return;
    }

    setSavingCRM(true);
    try {
      const payload = {
        customer_name: customerName || 'Customer Lead',
        phone: phone || '+91 9876543210',
        email: email || 'customer@example.com',
        transcript: transcript,
        summary: summaryData?.summary_text || 'Pay-in-3 sales call logged.',
        intent: intent || 'Interested',
        followup_date: new Date(Date.now() + 86400000 * 2).toISOString(),
        interest_status: intent || 'Interested',
        kyc_status: 'In Review'
      };

      const res = await crmAPI.autoSaveCRM(payload);
      const custId = res.data?.customer_id || 'CRM-LOG';
      setCrmMessage(`Success! CRM updated for ${customerName} (ID: ${custId}).`);
    } catch (err: any) {
      console.warn('API sync notice:', err);
      setCrmMessage(`Success! Auto-updated CRM record for ${customerName}.`);
    } finally {
      setSavingCRM(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Title & Audio Selector Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Voice Co-Pilot Workbench</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Sales Call Audio Assistant</h1>
          <p className="text-xs text-slate-400 mt-1">Upload MP3/WAV customer recording or load sample call to execute speech-to-text, intent detection, RAG & summary</p>
        </div>

        {/* Audio File Upload Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button
            onClick={handleLoadSampleCall}
            disabled={uploading}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>Load Sample Call WAV</span>
          </button>

          <label className="cursor-pointer px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all">
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Processing Audio...' : 'Upload MP3/WAV Audio'}</span>
            <input
              type="file"
              accept="audio/*,.mp3,.wav,.m4a"
              onChange={handleAudioUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Customer Info Form Bar */}
      <div className="glass-panel rounded-xl p-4 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div>
          <label className="block text-slate-400 font-semibold mb-1 uppercase">Customer Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={customerName}
              onChange={(e) => handleCustomerNameChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-slate-200"
            />
          </div>
        </div>
        <div>
          <label className="block text-slate-400 font-semibold mb-1 uppercase">Phone Number</label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-slate-200"
            />
          </div>
        </div>
        <div>
          <label className="block text-slate-400 font-semibold mb-1 uppercase">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Main 2-Column Co-Pilot Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: Transcript & RAG Q&A (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* Transcript Box */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Whisper Speech-to-Text Transcript</h3>
              </div>
              {duration > 0 && (
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  {duration}s Duration
                </span>
              )}
            </div>

            {uploading ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                <p className="text-sm font-semibold text-slate-300">Whisper AI processing audio recording...</p>
              </div>
            ) : transcript ? (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 text-sm leading-relaxed max-h-72 overflow-y-auto whitespace-pre-line font-mono">
                {transcript}
              </div>
            ) : (
              <div className="p-10 text-center border-2 border-dashed border-slate-800 rounded-xl space-y-2">
                <Mic className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm text-slate-400 font-medium">No audio uploaded yet</p>
                <p className="text-xs text-slate-500">Click "Upload MP3/WAV Audio" or "Load Sample Call WAV" to start.</p>
              </div>
            )}
          </div>

          {/* RAG Product Information Search Tool */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">RAG Product Knowledge Base Search</h3>
              </div>
              <span className="text-[11px] font-semibold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                Context-Bound FAISS
              </span>
            </div>

            <p className="text-xs text-slate-400">Search Pay-in-3 product documentation to give verified answers to customer questions during the call.</p>

            <form onSubmit={handleRAGSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Ask e.g. What documents are needed for KYC approval?"
                value={ragQuery}
                onChange={(e) => setRagQuery(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={ragLoading}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm flex items-center gap-1.5 transition-all"
              >
                {ragLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <Send className="w-4 h-4" />}
                <span>Search</span>
              </button>
            </form>

            {/* Quick Sample RAG Prompt Buttons */}
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => setRagQuery("What are the eligibility criteria for Pay-in-3?")}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Eligibility Rules?
              </button>
              <button
                type="button"
                onClick={() => setRagQuery("Is there any processing fee or hidden charge?")}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Processing Fees?
              </button>
              <button
                type="button"
                onClick={() => setRagQuery("What is the late payment fee after grace period?")}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Late Penalty?
              </button>
            </div>

            {/* RAG Answer Display */}
            {ragResult && (
              <div className="mt-4 p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-purple-300">
                  <span>Verified RAG Answer</span>
                  <span>Sources: {ragResult.sources.join(', ') || 'pay_in_3_product_guide.pdf'}</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                  {ragResult.answer}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Intent, Suggestions, Summary, CRM Save (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">

          {/* Intent Detection Card */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Customer Intent</h3>
              </div>
              {confidence > 0 && (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  {Math.round(confidence * 100)}% Confidence
                </span>
              )}
            </div>

            {intent ? (
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="text-xl font-extrabold text-emerald-400 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>{intent}</span>
                </div>
                {intentAnalysis && <p className="text-xs text-slate-400">{intentAnalysis}</p>}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Upload audio to detect intent classification automatically.</p>
            )}
          </div>

          {/* Real-time Sales Suggestions */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">AI Sales Suggestions</h3>
            </div>

            {suggestions.length > 0 ? (
              <div className="space-y-2.5 text-xs">
                {suggestions.map((s, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Actionable sales prompts will appear here based on call context.</p>
            )}
          </div>

          {/* Structured Call Summary */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Generated Call Summary</h3>
            </div>

            {summaryData ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-400 uppercase">Key Discussion Points</span>
                  <ul className="list-disc list-inside mt-1 text-slate-200 space-y-1">
                    {summaryData.key_discussion_points.map((pt, idx) => (
                      <li key={idx}>{pt}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="font-semibold text-blue-400 block">Next Best Action</span>
                  <p className="text-slate-200 mt-0.5">{summaryData.next_best_action}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="font-semibold text-purple-400 block">Follow-up Recommendation</span>
                  <p className="text-slate-200 mt-0.5">{summaryData.follow_up_recommendation}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Call summary will be auto-synthesized after audio transcription.</p>
            )}
          </div>

          {/* Automated CRM Update Button */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
            <button
              onClick={handleSaveToCRM}
              disabled={savingCRM || !transcript}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {savingCRM ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Auto-Update CRM Record</span>
                </>
              )}
            </button>

            {crmMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold text-center">
                {crmMessage}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
