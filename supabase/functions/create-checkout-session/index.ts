// Setup Stripe
import Stripe from 'https://esm.sh/stripe@14.19.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

// Configure CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('create-checkout-session function loaded');

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }


  try {
    // Check Authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    // Get Request Body
    const { cycle } = await req.json();
    if (!cycle || (cycle !== 'monthly' && cycle !== 'yearly')) {
      throw new Error('Invalid cycle. Must be monthly or yearly.');
    }

    // Get User from token (Supabase Auth)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('User not found');
    }

    // Determine Price ID (Set these in Supabase Secrets)
    const priceId = cycle === 'monthly' 
      ? Deno.env.get("STRIPE_PRICE_ID_MONTHLY") 
      : Deno.env.get("STRIPE_PRICE_ID_YEARLY");

    if (!priceId) {
      throw new Error('Price ID not configured on server.');
    }

    console.log(`Creating checkout session for user ${user.id} with cycle ${cycle} (price: ${priceId})`);

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/pricing`,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        billing_cycle: cycle
      },
      subscription_data: {
          metadata: {
              user_id: user.id
          }
      }
    });

    console.log("Checkout session created:", session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error creating checkout session:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

// Helper for Supabase Client
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
