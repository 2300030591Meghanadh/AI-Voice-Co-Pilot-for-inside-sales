export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  interest_status: 'Interested' | 'Not Interested' | 'Wants Callback' | 'EMI Query' | 'Eligibility Query' | 'KYC Query' | 'Complaint' | 'Pending';
  kyc_status: 'Pending' | 'In Review' | 'Approved' | 'Rejected';
  call_date?: string;
  followup_date?: string;
  call_summary?: string;
  created_at: string;
  updated_at: string;
}

export interface Followup {
  id: number;
  customer_id: number;
  customer_name?: string;
  scheduled_date: string;
  notes?: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
  created_at: string;
}

export interface AnalyticsData {
  summary_metrics: {
    total_customers: number;
    total_calls: number;
    interested_customers: number;
    pending_followups: number;
    conversion_rate: number;
  };
  daily_calls: Array<{ day: string; calls: number; conversions: number }>;
  intent_distribution: Array<{ name: string; value: number; color: string }>;
  common_objections: Array<{ objection: string; count: number; percentage: number }>;
  followup_completion: {
    pending: number;
    completed: number;
    completion_rate: number;
  };
}

export interface RAGResponse {
  question: string;
  answer: string;
  sources: string[];
  context_retrieved: boolean;
}

export interface SummaryResponse {
  customer_intent: string;
  key_discussion_points: string[];
  next_best_action: string;
  follow_up_recommendation: string;
  summary_text: string;
}

export interface SuggestionResponse {
  suggestions: string[];
  talking_points: string[];
}
