/*
  # Add Sample Documents

  1. Purpose
    - Adds sample company documents for demonstration
    - Includes various document types and folders
    - Shows different collaboration states

  2. Sample Data
    - 15 sample documents across different categories
    - Various file types (PDF, DOCX, XLSX)
    - Different status and collaboration states
*/

-- First, ensure we have a company to associate documents with
INSERT INTO companies (id, name, industry, size, description)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'TechCorp Inc.',
  'Technology',
  250,
  'Leading technology solutions provider'
)
ON CONFLICT (id) DO NOTHING;

-- Sample Documents
INSERT INTO documents (id, company_id, name, file_type, file_size, folder, access_level, version, created_at, updated_at) VALUES
-- Contracts Folder
('d1e2f3a4-b5c6-7890-def0-123456789abc', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Master Service Agreement - TechCorp Inc.pdf', 'pdf', 2457600, 'contracts', 'company', 2, NOW() - INTERVAL '30 days', NOW() - INTERVAL '2 days'),
('d2e3f4a5-b6c7-7890-def0-234567890abc', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Tie-up Agreement - GlobalSoft Partners.pdf', 'pdf', 1258291, 'contracts', 'company', 1, NOW() - INTERVAL '45 days', NOW() - INTERVAL '7 days'),
('d3e4f5a6-b7c8-7890-def0-345678901abc', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Vendor Contract - ABC Supplies.pdf', 'pdf', 912384, 'contracts', 'company', 1, NOW() - INTERVAL '21 days', NOW() - INTERVAL '21 days'),
('d4e5f6a7-b8c9-7890-def0-456789012abc', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Partnership Terms - DataDriven Co.pdf', 'pdf', 2202005, 'contracts', 'company', 3, NOW() - INTERVAL '15 days', NOW() - INTERVAL '4 days'),

-- Financial Reports Folder
('d5e6f7a8-b9c0-7890-def0-567890123abc', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Q1 Financial Report 2024.xlsx', 'xlsx', 2516582, 'financial', 'company', 3, NOW() - INTERVAL '60 days', NOW() - INTERVAL '2 days'),
('d6e7f8a9-c0d1-7890-def0-678901234abc', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Q2 Budget Proposal.xlsx', 'xlsx', 1887436, 'financial', 'company', 5, NOW() - INTERVAL '10 days', NOW() - INTERVAL '5 days'),
('d7e8f9a0-d1e2-7890-def0-789012345abc', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Annual Revenue Analysis 2023.pdf', 'pdf', 4404019, 'financial', 'company', 1, NOW() - INTERVAL '90 days', NOW() - INTERVAL '14 days'),
('d8e9f0a1-e2f3-7890-def0-890123456abc', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Expense Report - Operations.xlsx', 'xlsx', 752640, 'financial', 'department', 2, NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),

-- Policies Folder
('d9e0f1a2-f3e4-7890-def0-901234567abc', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Employee Handbook 2024.pdf', 'pdf', 6081740, 'policies', 'company', 4, NOW() - INTERVAL '100 days', NOW() - INTERVAL '14 days'),
('e0f1a2b3-e4f5-7890-def0-012345678abc', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Code of Conduct.docx', 'docx', 409600, 'policies', 'company', 2, NOW() - INTERVAL '120 days', NOW() - INTERVAL '1 month'),
('e1f2a3b4-f5e6-7890-def0-123456789bcd', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Remote Work Policy.docx', 'docx', 307200, 'policies', 'company', 3, NOW() - INTERVAL '50 days', NOW() - INTERVAL '10 days'),
('e2f3a4b5-e6f7-7890-def0-234567890bcd', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Data Privacy Guidelines.pdf', 'pdf', 1843200, 'policies', 'company', 1, NOW() - INTERVAL '80 days', NOW() - INTERVAL '3 weeks'),

-- Legal Documents Folder
('e3f4a5b6-f7e8-7890-def0-345678901bcd', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Non-Disclosure Agreement Template.docx', 'docx', 460800, 'legal', 'company', 1, NOW() - INTERVAL '365 days', NOW() - INTERVAL '1 month'),
('e4f5a6b7-e8f9-7890-def0-456789012bcd', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Intellectual Property Rights.pdf', 'pdf', 1638400, 'legal', 'company', 2, NOW() - INTERVAL '200 days', NOW() - INTERVAL '2 months'),
('e5f6a7b8-f9e0-7890-def0-567890123bcd', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Compliance Checklist 2024.docx', 'docx', 716800, 'legal', 'department', 1, NOW() - INTERVAL '35 days', NOW() - INTERVAL '3 days'),
('e6f7a8b9-e0f1-7890-def0-678901234bcd', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Regulatory Filing Template.pdf', 'pdf', 524288, 'legal', 'company', 1, NOW() - INTERVAL '180 days', NOW() - INTERVAL '6 months');
