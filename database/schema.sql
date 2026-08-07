-- Database Schema for AffordAI Voice Co-Pilot
-- Compatible with PostgreSQL and SQLite

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'sales_agent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    interest_status VARCHAR(50) DEFAULT 'Pending', -- Interested, Not Interested, Wants Callback, EMI Query, Eligibility Query, KYC Query, Complaint, Pending
    kyc_status VARCHAR(50) DEFAULT 'Pending',       -- Pending, In Review, Approved, Rejected
    call_date TIMESTAMP NULL,
    followup_date TIMESTAMP NULL,
    call_summary TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS calls (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    agent_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    audio_file_path VARCHAR(500) NULL,
    duration_seconds INTEGER DEFAULT 0,
    intent VARCHAR(100) NULL,
    intent_confidence FLOAT DEFAULT 0.0,
    summary TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transcripts (
    id SERIAL PRIMARY KEY,
    call_id INTEGER UNIQUE REFERENCES calls(id) ON DELETE CASCADE,
    full_text TEXT NOT NULL,
    speaker_segments JSONB NULL, -- Optional timestamps/speaker identification
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS followups (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    agent_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    scheduled_date TIMESTAMP NOT NULL,
    notes TEXT NULL,
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Completed, Cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    document_path VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
