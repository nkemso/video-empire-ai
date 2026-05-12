export type Profile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  country: string
  subscription_tier: 'free' | 'pro' | 'agency'
  subscription_status: 'active' | 'cancelled' | 'expired' | 'trial'
  subscription_provider: 'paystack' | 'lemonsqueezy' | null
  subscription_id: string | null
  subscription_started_at: string | null
  subscription_expires_at: string | null
  generations_count: number
  generations_this_month: number
  last_generation_at: string | null
  created_at: string
  updated_at: string
}

export type Generation = {
  id: string
  user_id: string
  topic: string
  strategy_mode: 1 | 2 | 3 | 4 | 5
  target_audience: string | null
  platform: string | null
  tone: string | null
  title: string | null
  content: string
  metadata: Record<string, any>
  ai_provider: string
  model_used: string
  tokens_used: number | null
  generation_time_ms: number | null
  status: 'pending' | 'completed' | 'failed'
  error_message: string | null
  is_favorite: boolean
  is_archived: boolean
  rating: number | null
  created_at: string
  updated_at: string
}

export type Subscription = {
  id: string
  user_id: string
  provider: 'paystack' | 'lemonsqueezy'
  provider_subscription_id: string
  provider_customer_id: string | null
  plan_name: string
  plan_tier: 'pro' | 'agency'
  billing_cycle: 'monthly' | 'yearly'
  amount: number
  currency: string
  status: 'active' | 'cancelled' | 'expired' | 'past_due' | 'trial'
  started_at: string
  current_period_start: string | null
  current_period_end: string | null
  cancelled_at: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export type Payment = {
  id: string
  user_id: string
  subscription_id: string | null
  provider: 'paystack' | 'lemonsqueezy'
  provider_payment_id: string
  provider_reference: string | null
  amount: number
  currency: string
  payment_method: string | null
  status: 'pending' | 'success' | 'failed' | 'refunded'
  metadata: Record<string, any>
  paid_at: string | null
  created_at: string
}

export type SubscriptionTier = {
  name: string
  tier: 'free' | 'pro' | 'agency'
  price_usd: number
  price_ngn: number
  features: string[]
  generations_limit: number | 'unlimited'
  paystack_plan_code?: string
  lemonsqueezy_variant_id?: string
}

export const SUBSCRIPTION_PLANS: SubscriptionTier[] = [
  {
    name: 'Free',
    tier: 'free',
    price_usd: 0,
    price_ngn: 0,
    features: [
      '3 generations per day',
      'All 5 strategy modes',
      'Basic export (Copy/Paste)',
      'Community support'
    ],
    generations_limit: 3
  },
  {
    name: 'Pro',
    tier: 'pro',
    price_usd: 19,
    price_ngn: 30000,
    features: [
      '100 generations per month',
      'All 5 strategy modes',
      'PDF export',
      'Generation history',
      'Priority support',
      'Custom branding'
    ],
    generations_limit: 100
  },
  {
    name: 'Agency',
    tier: 'agency',
    price_usd: 97,
    price_ngn: 150000,
    features: [
      'Unlimited generations',
      'All 5 strategy modes',
      'PDF + Word export',
      'Team accounts (5 users)',
      'API access',
      'White-label option',
      'Dedicated support',
      'Custom integrations'
    ],
    generations_limit: 'unlimited'
  }
]
