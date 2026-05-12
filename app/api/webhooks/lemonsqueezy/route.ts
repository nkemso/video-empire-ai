import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-signature');
    
    // Verify webhook
    const hmac = crypto.createHmac('sha256', process.env.LEMONSQUEEZY_WEBHOOK_SECRET!);
    const digest = hmac.update(body).digest('hex');
    
    if (digest !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    const eventName = event.meta.event_name;
    const userId = event.meta.custom_data?.user_id;
    const tier = event.meta.custom_data?.tier;

    switch (eventName) {
      case 'subscription_created':
        await handleSubscriptionCreated(event.data, userId, tier);
        break;
      case 'subscription_cancelled':
        await handleSubscriptionCancelled(event.data, userId);
        break;
      case 'subscription_resumed':
        await handleSubscriptionResumed(event.data, userId, tier);
        break;
      case 'subscription_expired':
        await handleSubscriptionExpired(userId);
        break;
      case 'order_created':
        await handleOrderCreated(event.data, userId);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('LemonSqueezy webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handleSubscriptionCreated(data: any, userId: string, tier: string) {
  if (!userId) return;

  // Save subscription
  await supabaseAdmin.from('subscriptions').insert({
    user_id: userId,
    provider: 'lemonsqueezy',
    provider_subscription_id: data.id,
    provider_customer_id: data.attributes.customer_id.toString(),
    plan_name: data.attributes.product_name,
    plan_tier: tier,
    billing_cycle: 'monthly',
    amount: data.attributes.first_subscription_item.price / 100,
    currency: 'USD',
    status: 'active',
    started_at: data.attributes.created_at,
    current_period_start: data.attributes.created_at,
    current_period_end: data.attributes.renews_at,
    metadata: data.attributes,
  });

  // Update profile
  await supabaseAdmin
    .from('profiles')
    .update({
      subscription_tier: tier,
      subscription_status: 'active',
      subscription_provider: 'lemonsqueezy',
      subscription_id: data.id,
      subscription_started_at: data.attributes.created_at,
      subscription_expires_at: data.attributes.renews_at,
    })
    .eq('id', userId);
}

async function handleSubscriptionCancelled(data: any, userId: string) {
  if (!userId) return;
  
  await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: 'cancelled',
    })
    .eq('id', userId);
}

async function handleSubscriptionResumed(data: any, userId: string, tier: string) {
  if (!userId) return;
  
  await supabaseAdmin
    .from('profiles')
    .update({
      subscription_tier: tier,
      subscription_status: 'active',
    })
    .eq('id', userId);
}

async function handleSubscriptionExpired(userId: string) {
  if (!userId) return;
  
  await supabaseAdmin
    .from('profiles')
    .update({
      subscription_tier: 'free',
      subscription_status: 'expired',
    })
    .eq('id', userId);
}

async function handleOrderCreated(data: any, userId: string) {
  if (!userId) return;
  
  await supabaseAdmin.from('payments').insert({
    user_id: userId,
    provider: 'lemonsqueezy',
    provider_payment_id: data.id,
    amount: data.attributes.total / 100,
    currency: data.attributes.currency,
    status: 'success',
    paid_at: data.attributes.created_at,
    metadata: data.attributes,
  });
}
