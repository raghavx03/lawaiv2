# 🚀 LAW-AI Supabase Complete Setup Guide

## 📊 Current Status
✅ **Supabase Connection**: Working  
✅ **Auth Service**: Active  
✅ **Storage Service**: Active  
❌ **Database Tables**: Need Setup  
❌ **AI Prompts**: Need Configuration  

## 🔧 Step-by-Step Setup

### Step 1: Database Schema Setup
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `hudflljbqezmpibippyb`
3. Navigate to **SQL Editor** in the left sidebar
4. Create a new query and copy-paste the content from `supabase-setup-complete.sql`
5. Click **Run** to execute the schema

### Step 2: AI Prompts Configuration
1. In the same SQL Editor, create another new query
2. Copy-paste the content from `supabase-ai-prompts.sql`
3. Click **Run** to setup AI prompts and functions

### Step 3: Verify Setup
```bash
node verify-supabase-setup.js
```

## 🤖 AI Prompts Configured

### 1. Legal Assistant (`legal_assistant`)
- **Purpose**: General legal queries and advice
- **Features**: Indian law expertise, case citations, procedure guidance
- **Usage**: Chat interface, legal consultations

### 2. Document Generator (`document_generator`)
- **Purpose**: Generate legal documents
- **Features**: Contracts, agreements, petitions, applications
- **Usage**: Document creation workflow

### 3. Judgment Summarizer (`judgment_summarizer`)
- **Purpose**: Analyze and summarize court judgments
- **Features**: Case analysis, precedent extraction, key points
- **Usage**: Judgment analysis feature

### 4. Legal Research (`legal_research`)
- **Purpose**: Comprehensive legal research
- **Features**: Case law search, statute analysis, precedent research
- **Usage**: Research tool functionality

### 5. Case Tracker Analysis (`case_analysis`)
- **Purpose**: Case management insights
- **Features**: Timeline prediction, procedural guidance, risk assessment
- **Usage**: Case tracking dashboard

### 6. Legal Notice Generator (`notice_generator`)
- **Purpose**: Draft legal notices
- **Features**: Formal notices, demand letters, legal communications
- **Usage**: Notice generation feature

### 7. CRM Consultation (`crm_consultation`)
- **Purpose**: Client consultation guidance
- **Features**: Issue assessment, legal remedies, strategic advice
- **Usage**: CRM system integration

### 8. Acts Search (`acts_search`)
- **Purpose**: Search and explain legal provisions
- **Features**: Act interpretation, section analysis, compliance guidance
- **Usage**: Acts database feature

### 9. Legal News Analysis (`news_analysis`)
- **Purpose**: Analyze legal news and developments
- **Features**: Impact assessment, compliance updates, trend analysis
- **Usage**: Legal news feature

## 🔐 Security Features Implemented

### Row Level Security (RLS)
- ✅ All tables have RLS enabled
- ✅ Users can only access their own data
- ✅ Proper authentication checks

### Data Protection
- ✅ UUID-based primary keys
- ✅ Encrypted sensitive data
- ✅ Audit logging for all actions

### API Security
- ✅ Rate limiting tables
- ✅ Usage tracking
- ✅ Token-based authentication

## 📈 Usage Analytics

### AI Interaction Tracking
```sql
-- View AI usage by user
SELECT * FROM ai_usage_analytics WHERE email = 'user@example.com';

-- Get popular AI features
SELECT prompt_category, COUNT(*) as usage_count 
FROM ai_interactions 
GROUP BY prompt_category 
ORDER BY usage_count DESC;
```

### Performance Monitoring
- Response time tracking
- Token usage monitoring
- Error rate analysis

## 🛠️ Development Usage

### Getting AI Prompts
```javascript
// Get prompt for legal assistant
const { data } = await supabase
  .rpc('get_ai_prompt', { prompt_category: 'legal_assistant' })

// Log AI interaction
await supabase
  .rpc('log_ai_interaction', {
    p_user_id: userId,
    p_category: 'legal_assistant',
    p_input: userQuery,
    p_response: aiResponse,
    p_tokens: tokensUsed
  })
```

### Database Operations
```javascript
// Create user profile
await supabase
  .from('users_app')
  .insert({
    user_id: userId,
    email: userEmail,
    plan: 'FREE'
  })

// Track feature usage
await supabase
  .from('usage_events')
  .upsert({
    user_id: userId,
    feature: 'AI_ASSISTANT',
    count: currentCount + 1
  })
```

## 🎯 Next Steps After Setup

1. **Test Database Connection**
   ```bash
   node verify-supabase-setup.js
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Test AI Features**
   - Visit `/dashboard` after login
   - Try AI Assistant chat
   - Generate a legal document
   - Test judgment summarizer

4. **Monitor Usage**
   - Check Supabase Dashboard
   - Review AI interaction logs
   - Monitor performance metrics

## 🔍 Troubleshooting

### Common Issues

**Tables Not Found**
- Ensure SQL scripts ran successfully
- Check for syntax errors in SQL Editor
- Verify user permissions

**AI Prompts Not Working**
- Confirm `ai_prompts` table exists
- Check if prompts are marked as active
- Verify function permissions

**Authentication Issues**
- Check RLS policies
- Verify user session
- Ensure proper JWT tokens

### Support Commands
```bash
# Test specific table
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
supabase.from('users_app').select('*').limit(1).then(console.log);
"

# Check AI prompts
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
supabase.from('ai_prompts').select('name,category').then(console.log);
"
```

## 📞 Support
- **Supabase Dashboard**: https://supabase.com/dashboard/project/hudflljbqezmpibippyb
- **Documentation**: https://supabase.com/docs
- **SQL Editor**: Use for running setup scripts

---

**🎉 Once setup is complete, your LAW-AI SaaS platform will have:**
- ✅ Complete database schema
- ✅ AI-powered legal assistance
- ✅ Secure user management
- ✅ Usage tracking and analytics
- ✅ Professional legal document generation
- ✅ Comprehensive legal research capabilities