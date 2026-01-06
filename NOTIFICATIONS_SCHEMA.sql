-- Notifications table schema for Supabase
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'welcome', 'feature', 'payment', 'system')),
  category VARCHAR(50) DEFAULT 'system' CHECK (category IN ('system', 'user', 'payment', 'feature', 'security')),
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  action_text VARCHAR(100),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_notifications_updated_at 
  BEFORE UPDATE ON notifications 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create function for welcome notification
CREATE OR REPLACE FUNCTION create_welcome_notification(user_id UUID, user_name TEXT)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    category,
    action_url,
    action_text,
    metadata
  ) VALUES (
    user_id,
    'Welcome to LAW.AI, ' || user_name || '! 🎉',
    'Your AI-powered legal assistant is ready. Explore our features to revolutionize your legal practice.',
    'welcome',
    'system',
    '/dashboard',
    'Get Started',
    jsonb_build_object('isWelcome', true, 'userName', user_name)
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for payment notifications
CREATE OR REPLACE FUNCTION create_payment_notification(
  user_id UUID, 
  payment_type TEXT, 
  plan_name TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
  title TEXT;
  message TEXT;
BEGIN
  CASE payment_type
    WHEN 'success' THEN
      title := 'Payment Successful! ✅';
      message := 'Your ' || COALESCE(plan_name, 'premium') || ' plan is now active. Enjoy unlimited access to all features.';
    WHEN 'failed' THEN
      title := 'Payment Failed ❌';
      message := 'Your payment could not be processed. Please try again or contact support.';
    WHEN 'upgrade' THEN
      title := 'Upgrade Available 🚀';
      message := 'Unlock more features with our premium plans. Get unlimited queries and priority support.';
    ELSE
      title := 'Payment Update';
      message := 'There has been an update to your payment status.';
  END CASE;

  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    category,
    action_url,
    action_text,
    metadata
  ) VALUES (
    user_id,
    title,
    message,
    CASE payment_type 
      WHEN 'success' THEN 'success'
      WHEN 'failed' THEN 'error'
      ELSE 'info'
    END,
    'payment',
    '/dashboard',
    'View Details',
    jsonb_build_object('paymentType', payment_type, 'plan', plan_name)
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to clean old notifications (keep last 100 per user)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications 
  WHERE id IN (
    SELECT id FROM (
      SELECT id, 
             ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
      FROM notifications
    ) t 
    WHERE rn > 100
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to run cleanup (if using pg_cron extension)
-- SELECT cron.schedule('cleanup-notifications', '0 2 * * *', 'SELECT cleanup_old_notifications();');

COMMENT ON TABLE notifications IS 'User notifications for LAW-AI platform';
COMMENT ON COLUMN notifications.type IS 'Type of notification: info, success, warning, error, welcome, feature, payment, system';
COMMENT ON COLUMN notifications.category IS 'Category for filtering: system, user, payment, feature, security';
COMMENT ON COLUMN notifications.metadata IS 'Additional data stored as JSON';
COMMENT ON FUNCTION create_welcome_notification IS 'Creates a welcome notification for new users';
COMMENT ON FUNCTION create_payment_notification IS 'Creates payment-related notifications';
COMMENT ON FUNCTION cleanup_old_notifications IS 'Removes old notifications, keeping last 100 per user';