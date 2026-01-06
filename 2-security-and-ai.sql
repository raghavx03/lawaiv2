-- LAW-AI Security & AI Setup
-- Copy and paste this in Supabase SQL Editor AFTER running 1-database-schema.sql

-- Enable RLS on all tables
ALTER TABLE users_app ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE research ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm ENABLE ROW LEVEL SECURITY;
ALTER TABLE acts ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own profile" ON users_app FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own usage" ON usage_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own research" ON research FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own drafts" ON drafts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own summaries" ON summaries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own case_tracker" ON case_tracker FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notices" ON notices FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own crm" ON crm FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own acts" ON acts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own news" ON news FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own chat_sessions" ON chat_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own uploaded_files" ON uploaded_files FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own audit_logs" ON audit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read active prompts" ON ai_prompts FOR SELECT USING (is_active = true);
CREATE POLICY "Users can manage own interactions" ON ai_interactions FOR ALL USING (auth.uid() = user_id);

-- Chat messages policy
CREATE POLICY "Users can manage chat messages from own sessions" ON chat_messages FOR ALL 
USING (session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid()));

-- Storage policies
CREATE POLICY "Users can upload own files" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'law-ai-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own files" ON storage.objects FOR SELECT 
USING (bucket_id = 'law-ai-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE 
USING (bucket_id = 'law-ai-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- AI Functions
CREATE OR REPLACE FUNCTION get_ai_prompt(prompt_category TEXT)
RETURNS TABLE(
    prompt_text TEXT,
    system_prompt TEXT,
    temperature DECIMAL,
    max_tokens INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ap.prompt_text,
        ap.system_prompt,
        ap.temperature,
        ap.max_tokens
    FROM ai_prompts ap
    WHERE ap.category = prompt_category 
        AND ap.is_active = true
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_ai_interaction(
    p_user_id UUID,
    p_category TEXT,
    p_input TEXT,
    p_response TEXT,
    p_tokens INTEGER DEFAULT NULL,
    p_response_time INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    interaction_id UUID;
BEGIN
    INSERT INTO ai_interactions (user_id, prompt_category, user_input, ai_response, tokens_used, response_time_ms)
    VALUES (p_user_id, p_category, p_input, p_response, p_tokens, p_response_time)
    RETURNING id INTO interaction_id;
    
    RETURN interaction_id;
END;
$$ LANGUAGE plpgsql;

-- Insert AI Prompts
INSERT INTO ai_prompts (name, category, prompt_text, system_prompt, temperature, max_tokens) VALUES
('legal_assistant', 'chat', 
'You are LAW-AI, an expert Indian legal assistant. Provide accurate legal information based on Indian Constitution, IPC, CrPC, CPC, and other Indian laws. Always cite relevant sections and recommend professional consultation for specific cases.

User Query: {query}

Provide comprehensive, accurate response following Indian legal framework.',
'You are a professional Indian legal assistant with expertise in Indian law. Always provide accurate, helpful information while maintaining professional ethics.',
0.7, 1500),

('document_generator', 'drafting',
'Generate a professional legal document:
Document Type: {document_type}
Parties: {parties}
Details: {details}

Create complete, legally sound document following Indian legal standards with proper formatting, clauses, and execution details.',
'You are an expert legal document drafter specializing in Indian legal documents.',
0.5, 2000),

('judgment_summarizer', 'analysis',
'Analyze and summarize this court judgment:
{judgment_text}

Provide: Case details, legal issues, arguments, court reasoning, final judgment, precedents cited, and implications.',
'You are a legal analyst specializing in Indian court judgments.',
0.6, 1800),

('legal_research', 'research',
'Conduct comprehensive legal research on: {query}

Provide: Constitutional provisions, applicable statutes, key case laws, recent amendments, regulatory guidelines, and practical applications with proper citations.',
'You are a legal researcher with expertise in Indian law.',
0.6, 2000),

('case_analysis', 'tracking',
'Analyze case details: {case_info}
Status: {status}
Court: {court}

Provide: Stage assessment, timeline predictions, required documentation, procedural steps, potential outcomes, and strategic recommendations.',
'You are a case management expert specializing in Indian court procedures.',
0.7, 1200),

('notice_generator', 'notices',
'Draft legal notice:
Type: {notice_type}
Sender: {sender_details}
Recipient: {recipient_details}
Cause: {cause}

Generate professionally drafted legal notice following Indian legal notice format with proper structure and legal requirements.',
'You are a legal notice specialist with expertise in Indian legal procedures.',
0.5, 1500),

('crm_consultation', 'crm',
'Provide consultation for: {issue}
Client: {client_info}

Provide: Issue assessment, applicable laws, available remedies, procedural requirements, documentation needed, timeline, costs, and strategic recommendations.',
'You are a legal consultation expert specializing in client advisory services.',
0.7, 1400),

('acts_search', 'database',
'Explain legal provision: {query}
Act: {act_name}
Section: {section}

Provide: Provision text, legal interpretation, practical application, related provisions, case law interpretations, and compliance requirements.',
'You are a legal database expert specializing in Indian acts and regulations.',
0.6, 1300),

('news_analysis', 'news',
'Analyze legal news: {news_content}

Provide: Key developments, impact assessment, affected stakeholders, practical implications, compliance requirements, and strategic considerations.',
'You are a legal news analyst specializing in Indian legal developments.',
0.7, 1200);

-- Analytics view
CREATE OR REPLACE VIEW ai_usage_analytics AS
SELECT 
    u.email,
    u.plan,
    ai.prompt_category,
    COUNT(*) as interaction_count,
    AVG(ai.tokens_used) as avg_tokens,
    AVG(ai.response_time_ms) as avg_response_time,
    DATE_TRUNC('day', ai.created_at) as usage_date
FROM ai_interactions ai
JOIN users_app u ON ai.user_id = u.user_id
GROUP BY u.email, u.plan, ai.prompt_category, DATE_TRUNC('day', ai.created_at);

-- Sample legal acts data
INSERT INTO acts (id, user_id, title, year, act_id, content) VALUES
(uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Indian Penal Code', '1860', 'IPC', 'The Indian Penal Code (IPC) is the official criminal code of India.'),
(uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Code of Criminal Procedure', '1973', 'CrPC', 'The Code of Criminal Procedure (CrPC) is the procedural law for criminal matters.'),
(uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Indian Evidence Act', '1872', 'IEA', 'The Indian Evidence Act governs the admissibility of evidence in Indian courts.')
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT SELECT ON ai_usage_analytics TO authenticated;