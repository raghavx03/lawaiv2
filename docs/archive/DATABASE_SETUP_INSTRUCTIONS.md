# 🗄️ Database Setup Instructions

## ✅ **SUPABASE NOTIFICATIONS TABLE SETUP**

### **🎯 Quick Setup (2 Minutes):**

#### **Step 1: Open Supabase Dashboard**
1. Go to [supabase.com](https://supabase.com)
2. Login to your account
3. Select your LAW-AI project
4. Click on **"SQL Editor"** in the left sidebar

#### **Step 2: Run the Setup Script**
1. Copy the entire content from `SUPABASE_SETUP.sql`
2. Paste it in the SQL Editor
3. Click **"Run"** button
4. Wait for success message: ✅ "Notifications table created successfully!"

#### **Step 3: Verify Setup**
```sql
-- Check if table exists
SELECT * FROM notifications LIMIT 5;

-- Check table structure
\d notifications;
```

### **🔧 Alternative Setup Methods:**

#### **Method 1: API Endpoint (Automatic)**
```bash
# Start your Next.js server
npm run dev

# Call setup endpoint
curl -X POST http://localhost:3000/api/setup-db
```

#### **Method 2: Manual SQL Commands**
Run these commands one by one in Supabase SQL Editor:

```sql
-- 1. Create table
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  category VARCHAR(50) DEFAULT 'system',
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  action_text VARCHAR(100),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- 3. Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 4. Create policies
CREATE POLICY "notifications_policy" ON notifications 
FOR ALL USING (auth.uid()::text = user_id::text);
```

### **🧪 Test the Setup:**

#### **1. Create Test Notification:**
```sql
-- Replace 'YOUR_USER_ID' with actual user ID from auth.users table
INSERT INTO notifications (user_id, title, message, type, category)
VALUES (
  'YOUR_USER_ID',
  'Test Notification 🧪',
  'This is a test notification to verify the setup.',
  'info',
  'system'
);
```

#### **2. Query Notifications:**
```sql
-- View all notifications
SELECT * FROM notifications ORDER BY created_at DESC;

-- Count notifications by user
SELECT user_id, COUNT(*) as count 
FROM notifications 
GROUP BY user_id;
```

### **🔍 Troubleshooting:**

#### **Common Issues:**

**Issue 1: "relation notifications does not exist"**
```sql
-- Solution: Run the CREATE TABLE command
CREATE TABLE notifications (...);
```

**Issue 2: "permission denied for table notifications"**
```sql
-- Solution: Enable RLS and create policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_policy" ON notifications FOR ALL USING (auth.uid()::text = user_id::text);
```

**Issue 3: "function gen_random_uuid() does not exist"**
```sql
-- Solution: Enable uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Or use this alternative:
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### **📊 Database Schema Overview:**

```
notifications
├── id (UUID, Primary Key)
├── user_id (UUID, Foreign Key to auth.users)
├── title (VARCHAR(255))
├── message (TEXT)
├── type (VARCHAR(50)) - info, success, warning, error, welcome, feature, payment, system
├── category (VARCHAR(50)) - system, user, payment, feature, security
├── read (BOOLEAN, Default: false)
├── action_url (TEXT, Optional)
├── action_text (VARCHAR(100), Optional)
├── metadata (JSONB, Default: {})
├── created_at (TIMESTAMP WITH TIME ZONE)
└── updated_at (TIMESTAMP WITH TIME ZONE)
```

### **🔐 Security Features:**

- ✅ **Row Level Security (RLS)** enabled
- ✅ **User isolation** - users only see their notifications
- ✅ **Secure policies** - proper read/write permissions
- ✅ **Data validation** - type and category constraints

### **🚀 Performance Optimizations:**

- ✅ **Indexes** on user_id, read status, and created_at
- ✅ **Efficient queries** for unread count and recent notifications
- ✅ **Automatic cleanup** ready for implementation

### **✅ Verification Checklist:**

- [ ] Table `notifications` exists
- [ ] All columns are present with correct types
- [ ] Indexes are created
- [ ] RLS is enabled
- [ ] Policies are active
- [ ] Test notification can be inserted
- [ ] Test notification can be queried

### **🎉 Success Indicators:**

When setup is complete, you should see:
- ✅ Table created without errors
- ✅ Policies show as "Enabled" in Supabase dashboard
- ✅ Test queries return expected results
- ✅ No permission errors when accessing data

**Once setup is complete, your notifications system will be fully functional with real-time updates!** 🔔✨