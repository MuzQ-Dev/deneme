import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getConnection } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ success: false, message: 'sessionId gerekli' }, { status: 400 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ success: false, message: 'Stripe yapılandırılmamış' }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2025-07-30.basil' as any });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json({ success: false, message: 'Ödeme doğrulanamadı' }, { status: 400 });
    }

    const orderIdFromMeta = session.metadata?.orderId ? Number(session.metadata.orderId) : null;

    const connection = await getConnection();
    try {
      let orderRow: any = null;

      if (orderIdFromMeta) {
        const [rows]: any = await connection.execute('SELECT * FROM orders WHERE id = ?', [orderIdFromMeta]);
        orderRow = rows?.[0];
      }

      if (!orderRow) {
        const [rows2]: any = await connection.execute('SELECT * FROM orders WHERE stripe_checkout_session_id = ?', [
          sessionId,
        ]);
        orderRow = rows2?.[0];
      }

      if (!orderRow) {
        return NextResponse.json({ success: false, message: 'Sipariş bulunamadı' }, { status: 404 });
      }

      await connection.execute(
        `UPDATE orders SET status = 'paid', stripe_payment_intent_id = COALESCE(?, stripe_payment_intent_id) WHERE id = ?`,
        [session.payment_intent ? String(session.payment_intent) : null, orderRow.id]
      );

      return NextResponse.json({ success: true, orderId: orderRow.id });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Confirm error:', error);
    return NextResponse.json({ success: false, message: 'Doğrulama hatası' }, { status: 500 });
  }
}


