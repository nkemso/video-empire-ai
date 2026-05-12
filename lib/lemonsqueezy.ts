const LEMON_API_KEY = process.env.LEMONSQUEEZY_API_KEY;
const LEMON_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;
const LEMON_BASE_URL = 'https://api.lemonsqueezy.com/v1';

const headers = {
  'Accept': 'application/vnd.api+json',
  'Content-Type': 'application/vnd.api+json',
  'Authorization': `Bearer ${LEMON_API_KEY}`,
};

export interface LemonCheckoutParams {
  variantId: string;
  email: string;
  userId: string;
  customData?: Record<string, any>;
}

export async function createCheckout(params: LemonCheckoutParams) {
  const response = await fetch(`${LEMON_BASE_URL}/checkouts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: params.email,
            custom: {
              user_id: params.userId,
              ...params.customData,
            },
          },
          product_options: {
            redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
          },
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: LEMON_STORE_ID,
            },
          },
          variant: {
            data: {
              type: 'variants',
              id: params.variantId,
            },
          },
        },
      },
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.errors?.[0]?.detail || 'Checkout creation failed');
  }

  return data.data.attributes.url;
}

export async function getSubscription(subscriptionId: string) {
  const response = await fetch(
    `${LEMON_BASE_URL}/subscriptions/${subscriptionId}`,
    { headers }
  );
  return await response.json();
}

export async function cancelSubscription(subscriptionId: string) {
  const response = await fetch(
    `${LEMON_BASE_URL}/subscriptions/${subscriptionId}`,
    {
      method: 'DELETE',
      headers,
    }
  );
  return await response.json();
}
