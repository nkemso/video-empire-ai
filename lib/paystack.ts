const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export interface PaystackInitParams {
  email: string;
  amount: number; // in kobo (1 NGN = 100 kobo)
  plan?: string;
  metadata?: Record<string, any>;
  callback_url?: string;
}

export async function initializePayment(params: PaystackInitParams) {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  
  if (!data.status) {
    throw new Error(data.message || 'Payment initialization failed');
  }

  return data.data;
}

export async function verifyPayment(reference: string) {
  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  const data = await response.json();
  return data.data;
}

export async function createSubscriptionPlan(params: {
  name: string;
  amount: number;
  interval: 'monthly' | 'yearly';
}) {
  const response = await fetch(`${PAYSTACK_BASE_URL}/plan`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  return await response.json();
}

export async function cancelSubscription(subscriptionCode: string, token: string) {
  const response = await fetch(`${PAYSTACK_BASE_URL}/subscription/disable`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code: subscriptionCode,
      token,
    }),
  });

  return await response.json();
      }
