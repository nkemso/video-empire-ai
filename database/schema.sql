-- ═══════════════════════════════════════════════════════════
-- 🎬 VIDEO EMPIRE AI - COMPLETE DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- 1. PROFILES TABLE (User Information)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    country TEXT DEFAULT 'NG',
    
    -- Subscription Info
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'agency')),
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'trial')),
    subscription_provider TEXT CHECK (subscription_provider IN ('paystack', 'lemonsqueezy', NULL)),
    subscription_id TEXT,
    subscription_started_at TIMESTAMPTZ,
    subscription_expires_at TIMESTAMPTZ,
    
    -- Usage Tracking
    generations_count INTEGER DEFAULT 0,
    generations_this_month INTEGER DEFAULT 0,
    last_generation_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════
-- 2. GENERATIONS TABLE (Stores all AI outputs)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Input Data
    topic TEXT NOT NULL,
    strategy_mode INTEGER NOT NULL CHECK (strategy_mode BETWEEN 1 AND 5),
    target_audience TEXT,
    platform TEXT,
    tone TEXT,
    
    -- Output Data
    title TEXT,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- AI Provider Info
    ai_provider TEXT DEFAULT 'gemini',
    model_used TEXT DEFAULT 'gemini-1.5-flash',
    tokens_used INTEGER,
    generation_time_ms INTEGER,
    
    -- Status
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    error_message TEXT,
    
    -- User Actions
    is_favorite BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_generations_updated_at 
    BEFORE UPDATE ON public.generations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON public.generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generations_strategy_mode ON public.generations(strategy_mode);

-- ═══════════════════════════════════════════════════════════
-- 3. SUBSCRIPTIONS TABLE (Track all payment events)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Provider Info
    provider TEXT NOT NULL CHECK (provider IN ('paystack', 'lemonsqueezy')),
    provider_subscription_id TEXT NOT NULL,
    provider_customer_id TEXT,
    
    -- Plan Info
    plan_name TEXT NOT NULL,
    plan_tier TEXT NOT NULL CHECK (plan_tier IN ('pro', 'agency')),
    billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),
    
    -- Pricing
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    
    -- Status
    status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'past_due', 'trial')),
    
    -- Dates
    started_at TIMESTAMPTZ NOT NULL,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON public.subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- ═══════════════════════════════════════════════════════════
-- 4. PAYMENTS TABLE (Individual payment records)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    
    -- Provider Info
    provider TEXT NOT NULL CHECK (provider IN ('paystack', 'lemonsqueezy')),
    provider_payment_id TEXT NOT NULL,
    provider_reference TEXT,
    
    -- Payment Details
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL,
    payment_method TEXT,
    
    -- Status
    status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- ═══════════════════════════════════════════════════════════
-- 5. USAGE_LOGS TABLE (Track API usage for rate limiting)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    
    -- Request Info
    ip_address TEXT,
    user_agent TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON public.usage_logs(created_at DESC);

-- ═══════════════════════════════════════════════════════════
-- 6. WAITLIST TABLE (For pre-launch + email capture)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    country TEXT,
    referral_source TEXT,
    
    -- Status
    is_invited BOOLEAN DEFAULT FALSE,
    invited_at TIMESTAMPTZ,
    
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- 7. AUTO-CREATE PROFILE ON USER SIGNUP
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════════════════
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ═══════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- GENERATIONS POLICIES
CREATE POLICY "Users can view their own generations"
    ON public.generations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own generations"
    ON public.generations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generations"
    ON public.generations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generations"
    ON public.generations FOR DELETE
    USING (auth.uid() = user_id);

-- SUBSCRIPTIONS POLICIES
CREATE POLICY "Users can view their own subscriptions"
    ON public.subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- PAYMENTS POLICIES
CREATE POLICY "Users can view their own payments"
    ON public.payments FOR SELECT
    USING (auth.uid() = user_id);

-- USAGE LOGS POLICIES
CREATE POLICY "Users can view their own usage"
    ON public.usage_logs FOR SELECT
    USING (auth.uid() = user_id);

-- WAITLIST POLICIES (Public can join)
CREATE POLICY "Anyone can join waitlist"
    ON public.waitlist FOR INSERT
    WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════
-- 9. HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════

-- Check if user can generate (rate limiting)
CREATE OR REPLACE FUNCTION public.can_user_generate(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_tier TEXT;
    monthly_count INTEGER;
    daily_count INTEGER;
BEGIN
    -- Get user tier
    SELECT subscription_tier INTO user_tier
    FROM public.profiles
    WHERE id = user_uuid;
    
    -- Count today's generations
    SELECT COUNT(*) INTO daily_count
    FROM public.generations
    WHERE user_id = user_uuid
    AND created_at >= CURRENT_DATE;
    
    -- Count this month's generations
    SELECT COUNT(*) INTO monthly_count
    FROM public.generations
    WHERE user_id = user_uuid
    AND created_at >= DATE_TRUNC('month', CURRENT_DATE);
    
    -- Apply limits based on tier
    CASE user_tier
        WHEN 'free' THEN
            RETURN daily_count < 3;
        WHEN 'pro' THEN
            RETURN monthly_count < 100;
        WHEN 'agency' THEN
            RETURN TRUE;
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's remaining generations
CREATE OR REPLACE FUNCTION public.get_remaining_generations(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    user_tier TEXT;
    used_count INTEGER;
BEGIN
    SELECT subscription_tier INTO user_tier
    FROM public.profiles
    WHERE id = user_uuid;
    
    CASE user_tier
        WHEN 'free' THEN
            SELECT COUNT(*) INTO used_count
            FROM public.generations
            WHERE user_id = user_uuid
            AND created_at >= CURRENT_DATE;
            RETURN GREATEST(0, 3 - used_count);
        WHEN 'pro' THEN
            SELECT COUNT(*) INTO used_count
            FROM public.generations
            WHERE user_id = user_uuid
            AND created_at >= DATE_TRUNC('month', CURRENT_DATE);
            RETURN GREATEST(0, 100 - used_count);
        WHEN 'agency' THEN
            RETURN 999999;
        ELSE
            RETURN 0;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════
-- 10. ANALYTICS VIEW (For your admin dashboard)
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW public.admin_analytics AS
SELECT
    -- User Stats
    (SELECT COUNT(*) FROM public.profiles) AS total_users,
    (SELECT COUNT(*) FROM public.profiles WHERE created_at >= CURRENT_DATE) AS users_today,
    (SELECT COUNT(*) FROM public.profiles WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') AS users_this_week,
    
    -- Subscription Stats
    (SELECT COUNT(*) FROM public.profiles WHERE subscription_tier = 'free') AS free_users,
    (SELECT COUNT(*) FROM public.profiles WHERE subscription_tier = 'pro') AS pro_users,
    (SELECT COUNT(*) FROM public.profiles WHERE subscription_tier = 'agency') AS agency_users,
    
    -- Generation Stats
    (SELECT COUNT(*) FROM public.generations) AS total_generations,
    (SELECT COUNT(*) FROM public.generations WHERE created_at >= CURRENT_DATE) AS generations_today,
    
    -- Revenue Stats
    (SELECT COALESCE(SUM(amount), 0) FROM public.payments WHERE status = 'success' AND currency = 'USD') AS total_revenue_usd,
    (SELECT COALESCE(SUM(amount), 0) FROM public.payments WHERE status = 'success' AND currency = 'NGN') AS total_revenue_ngn,
    
    -- Provider Stats
    (SELECT COUNT(*) FROM public.subscriptions WHERE provider = 'paystack' AND status = 'active') AS active_paystack,
    (SELECT COUNT(*) FROM public.subscriptions WHERE provider = 'lemonsqueezy' AND status = 'active') AS active_lemonsqueezy;

-- ═══════════════════════════════════════════════════════════
-- ✅ DATABASE SETUP COMPLETE!
-- ═══════════════════════════════════════════════════════════
