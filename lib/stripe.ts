import Stripe from "stripe";
import { db } from "@/lib/db";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

const LISTING_FEE_PRICE_ID = process.env.STRIPE_LISTING_FEE_PRICE_ID!; // $500/mo recurring

// ─── Create a Stripe customer for a supplier ──────────────────────────────────

export async function createStripeCustomer(
  supplierId: string,
  email: string,
  companyName: string
): Promise<string> {
  const customer = await stripe.customers.create({
    email,
    name: companyName,
    metadata: { supplierId },
  });

  await db.supplier.update({
    where: { id: supplierId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

// ─── Create listing fee subscription ($500/mo) ────────────────────────────────

export async function createListingSubscription(
  stripeCustomerId: string,
  supplierId: string
): Promise<{ subscriptionId: string; clientSecret: string }> {
  const subscription = await stripe.subscriptions.create({
    customer: stripeCustomerId,
    items: [{ price: LISTING_FEE_PRICE_ID }],
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.payment_intent"],
    metadata: { supplierId },
  });

  await db.supplier.update({
    where: { id: supplierId },
    data: { stripeSubId: subscription.id },
  });

  const invoice = subscription.latest_invoice as Stripe.Invoice;
  const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

  return {
    subscriptionId: subscription.id,
    clientSecret: paymentIntent.client_secret!,
  };
}

// ─── Invoice success fee on deal close ───────────────────────────────────────

export async function invoicePlatformFee(params: {
  stripeCustomerId: string; // importer's customer (or supplier's, your choice)
  dealId: string;
  totalValueUsd: number;    // deal value in USD
  feeRate?: number;         // default 1.5%
}): Promise<{ invoiceId: string; amountUsd: number }> {
  const rate = params.feeRate ?? 0.015;
  const amountUsd = Math.round(params.totalValueUsd * rate * 100) / 100;
  const amountCents = Math.round(amountUsd * 100);

  // Create a one-off invoice item
  await stripe.invoiceItems.create({
    customer: params.stripeCustomerId,
    amount: amountCents,
    currency: "usd",
    description: `MineralX platform fee (${(rate * 100).toFixed(1)}%) — Deal ${params.dealId}`,
    metadata: { dealId: params.dealId },
  });

  const invoice = await stripe.invoices.create({
    customer: params.stripeCustomerId,
    auto_advance: true, // auto-finalize and send
    metadata: { dealId: params.dealId },
  });

  await stripe.invoices.finalizeInvoice(invoice.id);

  await db.deal.update({
    where: { id: params.dealId },
    data: {
      stripeInvoiceId: invoice.id,
      platformFeeUsd: amountUsd,
    },
  });

  return { invoiceId: invoice.id, amountUsd };
}

// ─── Stripe webhook event verification ───────────────────────────────────────

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
