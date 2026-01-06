const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function createTables() {
  console.log('🚀 Creating LAW-AI Database Tables...\n')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  const supabase = createClient(supabaseUrl, serviceKey)
  
  const queries = [
    // Extensions
    `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,
    
    // Enums
    `CREATE TYPE plan_type AS ENUM ('FREE', 'BASIC', 'PLUS', 'PRO');`,
    `CREATE TYPE payment_status AS ENUM ('CREATED', 'PAID', 'FAILED');`,
    `CREATE TYPE feature_type AS ENUM ('AI_ASSISTANT', 'DOC_GENERATOR', 'JUDGMENT_SUMMARIZER', 'CRM', 'ACTS', 'NEWS', 'CASE_TRACKER', 'NOTICES', 'DRAFTS', 'RESEARCH');`,
    
    // Users table
    `CREATE TABLE users_app (
      user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT UNIQUE NOT NULL,
      full_name TEXT,
      phone TEXT,
      organization TEXT,
      profile_pic TEXT,
      plan plan_type DEFAULT 'FREE',
      usage_count INTEGER DEFAULT 0,
      expiry_date TIMESTAMPTZ,
      theme_preference TEXT DEFAULT 'system',
      settings JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    
    // Other tables
    `CREATE TABLE payments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users_app(user_id) ON DELETE CASCADE,
      plan plan_type NOT NULL,
      amount INTEGER NOT NULL,
      currency TEXT DEFAULT 'INR',
      razorpay_order_id TEXT NOT NULL,
      razorpay_payment_id TEXT,
      razorpay_signature TEXT,
      status payment_status DEFAULT 'CREATED',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    
    `CREATE TABLE usage_events (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users_app(user_id) ON DELETE CASCADE,
      feature feature_type NOT NULL,
      count INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, feature)
    );`,
    
    `CREATE TABLE research (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users_app(user_id) ON DELETE CASCADE,
      query TEXT NOT NULL,
      result TEXT NOT NULL,
      type TEXT DEFAULT 'general',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    
    `CREATE TABLE drafts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users_app(user_id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      inputs JSONB NOT NULL,
      pdf_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    
    `CREATE TABLE summaries (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users_app(user_id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      original_text TEXT NOT NULL,
      summary TEXT NOT NULL,
      file_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    
    `CREATE TABLE case_tracker (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users_app(user_id) ON DELETE CASCADE,
      cnr TEXT UNIQUE NOT NULL,
      party_name TEXT NOT NULL,
      court TEXT NOT NULL,
      status TEXT NOT NULL,
      next_date TIMESTAMPTZ,
      last_update TIMESTAMPTZ NOT NULL,
      details JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    
    `CREATE TABLE notices (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users_app(user_id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      recipient TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      pdf_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    
    `CREATE TABLE crm (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users_app(user_id) ON DELETE CASCADE,
      client_name TEXT NOT NULL,
      client_email TEXT,
      client_phone TEXT,
      title TEXT NOT NULL,
      description TEXT,
      date TIMESTAMPTZ NOT NULL,
      duration INTEGER DEFAULT 60,
      status TEXT DEFAULT 'scheduled',
      reminders JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    
    `CREATE TABLE acts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users_app(user_id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      year TEXT NOT NULL,
      act_id TEXT NOT NULL,
      content TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    
    `CREATE TABLE news (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users_app(user_id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      summary TEXT,
      source TEXT NOT NULL,
      url TEXT NOT NULL,
      published_at TIMESTAMPTZ NOT NULL,
      category TEXT,
      tags TEXT[],
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    
    `CREATE TABLE chat_sessions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users_app(user_id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    
    `CREATE TABLE chat_messages (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      citations TEXT[],
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    
    `CREATE TABLE uploaded_files (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users_app(user_id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      content TEXT,
      uploaded_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    
    `CREATE TABLE audit_logs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users_app(user_id) ON DELETE CASCADE,
      action TEXT NOT NULL,
      resource TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      timestamp TIMESTAMPTZ DEFAULT NOW()
    );`,
    
    `CREATE TABLE rate_limits (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      key TEXT UNIQUE NOT NULL,
      count INTEGER DEFAULT 1,
      reset_time TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    
    `CREATE TABLE ai_prompts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      prompt_text TEXT NOT NULL,
      system_prompt TEXT,
      temperature DECIMAL(3,2) DEFAULT 0.7,
      max_tokens INTEGER DEFAULT 1000,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    
    `CREATE TABLE ai_interactions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users_app(user_id) ON DELETE CASCADE,
      prompt_category TEXT NOT NULL,
      user_input TEXT NOT NULL,
      ai_response TEXT NOT NULL,
      tokens_used INTEGER,
      response_time_ms INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`
  ]
  
  for (let i = 0; i < queries.length; i++) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: queries[i] })
      if (error && !error.message.includes('already exists')) {
        console.log(`❌ Query ${i + 1}: ${error.message}`)
      } else {
        console.log(`✅ Query ${i + 1}: Success`)
      }
    } catch (err) {
      console.log(`❌ Query ${i + 1}: ${err.message}`)
    }
  }
  
  console.log('\n🎯 Tables creation completed!')
}

createTables()