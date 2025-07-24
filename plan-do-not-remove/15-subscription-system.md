# Subscription System

## Overview
The School Finder Portal uses a freemium model with limited free searches and premium features for subscribers.

## Subscription Tiers

### Free Tier
- 10 school searches per 24 hours
- Basic school information
- Limited access to ratings and comments

### Premium Tier ($9.99/month)
- Unlimited searches
- Full access to all school details
- Sentiment analysis of reviews
- Advanced filtering options
- School comparison feature

## Implementation with Stripe

### Checkout Process
```typescript
// pages/api/create-checkout-session.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/subscription/cancel`,
      customer_email: session.user.email!,
      metadata: {
        userId: session.user.id,
      },
    });

    return res.status(200).json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe error:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
```

### Webhook for Subscription Events
Implement a webhook endpoint at `/api/webhooks/stripe` to handle subscription events (created, updated, canceled).