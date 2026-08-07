-- Seed Data for AffordAI Voice Co-Pilot

INSERT INTO users (email, password_hash, full_name, role)
VALUES 
('agent@affordai.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQOEg6Lruj3vjPGga31lW', 'Alex Mercer (Sales Lead)', 'sales_agent'),
('sarah.connor@affordai.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQOEg6Lruj3vjPGga31lW', 'Sarah Connor (Senior Agent)', 'sales_agent')
ON CONFLICT DO NOTHING;

INSERT INTO customers (name, phone, email, interest_status, kyc_status, call_date, followup_date, call_summary)
VALUES 
('Rahul Sharma', '+91 9876543210', 'rahul.sharma@example.com', 'Interested', 'Approved', '2026-08-05 11:30:00', '2026-08-10 14:00:00', 'Customer expressed high interest in 3-month zero cost EMI for buying a smartphone. KYC documents verified.'),
('Priya Patel', '+91 9812345678', 'priya.patel@example.com', 'Wants Callback', 'Pending', '2026-08-06 15:00:00', '2026-08-08 10:30:00', 'Requested callback tomorrow to discuss eligibility rules and required salary slips for Pay-in-3.'),
('Amit Kumar', '+91 9765432109', 'amit.k@example.com', 'EMI Query', 'In Review', '2026-08-06 16:45:00', '2026-08-09 16:00:00', 'Asked if zero cost EMI has any hidden processing charges or foreclosure fees. Clarified 0% interest and 0 processing fees.'),
('Ananya Gupta', '+91 9988776655', 'ananya.g@example.com', 'Eligibility Query', 'Pending', '2026-08-07 09:15:00', '2026-08-11 11:00:00', 'Inquired about minimum monthly income criteria and CIBIL score required for Pay-in-3 activation.'),
('Vikram Singh', '+91 9845012345', 'vikram.singh@example.com', 'Not Interested', 'Rejected', '2026-08-04 14:20:00', NULL, 'Customer prefers standard credit card payments over installment options at present.'),
('Neha Reddy', '+91 9123456789', 'neha.reddy@example.com', 'KYC Query', 'In Review', '2026-08-07 13:10:00', '2026-08-08 15:30:00', 'Needed assistance uploading PAN card photo during digital onboarding step.');

INSERT INTO products (name, code, description, document_path)
VALUES 
('Pay-in-3 Zero-Cost EMI', 'PAY_IN_3_EMI', 'Flexible affordability product splitting purchase amount into 3 equal monthly installments with zero interest and zero processing fees.', 'knowledge_base/pay_in_3_product_guide.pdf')
ON CONFLICT DO NOTHING;

INSERT INTO followups (customer_id, agent_id, scheduled_date, notes, status)
VALUES 
(2, 1, '2026-08-08 10:30:00', 'Callback Priya Patel regarding eligibility & salary slip verification.', 'Pending'),
(6, 1, '2026-08-08 15:30:00', 'Assist Neha Reddy with PAN upload troubleshooting.', 'Pending'),
(3, 2, '2026-08-09 16:00:00', 'Follow up with Amit Kumar after product demo.', 'Pending'),
(1, 1, '2026-08-10 14:00:00', 'Confirm order conversion and payment authorization for Rahul Sharma.', 'Pending');
