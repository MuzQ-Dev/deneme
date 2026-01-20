import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getConnection } from '@/lib/db';

type SelectedItem = { id: number; qty: number };

function toPence(amount: number) {
  return Math.round(amount * 100);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, phone, email, address, selectedItems } = body || {};

    if (!firstName || !lastName || !phone || !email || !address) {
      return NextResponse.json({ success: false, message: 'Lütfen tüm alanları doldurun' }, { status: 400 });
    }

    const items: SelectedItem[] = Array.isArray(selectedItems) ? selectedItems : [];
    const normalized = items
      .map((i) => ({ id: Number(i.id), qty: Math.max(1, Number(i.qty || 1)) }))
      .filter((i) => Number.isFinite(i.id) && i.id > 0 && Number.isFinite(i.qty) && i.qty > 0);

    if (normalized.length === 0) {
      return NextResponse.json({ success: false, message: 'En az bir menü seçmelisiniz' }, { status: 400 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json(
        { success: false, message: 'Payment system not configured (STRIPE_SECRET_KEY missing)' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2025-07-30.basil' as any });

    const connection = await getConnection();
    try {
      // DB'den fiyatları çek (client'a güvenme)
      const ids = normalized.map((i) => i.id);
      const placeholders = ids.map(() => '?').join(',');
      const [rows]: any = await connection.execute(
        `SELECT id, title, description, category, price FROM menu_items WHERE is_active = TRUE AND id IN (${placeholders})`,
        ids
      );

      const byId = new Map<number, any>((rows || []).map((r: any) => [Number(r.id), r]));
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

      let total = 0;
      const orderItems = normalized.map((sel) => {
        const row = byId.get(sel.id);
        if (!row) return null;
        const unitPrice = Number(row.price);
        const qty = sel.qty;
        total += unitPrice * qty;

        lineItems.push({
          quantity: qty,
          price_data: {
            currency: 'gbp',
            unit_amount: toPence(unitPrice),
            product_data: {
              name: row.title,
              description: row.description || undefined,
            },
          },
        });

        return {
          id: Number(row.id),
          title: row.title,
          category: row.category,
          unitPrice: unitPrice,
          qty,
          lineTotal: unitPrice * qty,
        };
      }).filter(Boolean);

      if (orderItems.length === 0) {
        return NextResponse.json({ success: false, message: 'Selected menu items not found' }, { status: 400 });
      }

      // Siparişi oluştur (pending_payment)
      const [insertRes]: any = await connection.execute(
        `INSERT INTO orders (status, first_name, last_name, phone, email, address, items_json, total_amount, currency)
         VALUES ('pending_payment', ?, ?, ?, ?, ?, ?, ?, 'GBP')`,
        [
          firstName,
          lastName,
          phone,
          email,
          address,
          JSON.stringify(orderItems),
          Number(total.toFixed(2)),
        ]
      );
      const orderId = insertRes.insertId;

      const origin = request.headers.get('origin') || 'http://localhost:3000';
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: lineItems,
        success_url: `${origin}/reservation/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/reservation/cancel?order_id=${orderId}`,
        metadata: {
          orderId: String(orderId),
        },
      });

      await connection.execute(
        `UPDATE orders SET stripe_checkout_session_id = ? WHERE id = ?`,
        [session.id, orderId]
      );

      return NextResponse.json({ success: true, checkoutUrl: session.url, orderId });
    } finally {
      await connection.end();
    }
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ success: false, message: 'Failed to start payment' }, { status: 500 });
  }
}


