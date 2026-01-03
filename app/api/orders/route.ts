import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

// GET /api/orders?status=paid|accepted|rejected|pending_payment|cancelled
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const connection = await getConnection();
    try {
      let query = 'SELECT * FROM orders ORDER BY created_at DESC';
      let params: any[] = [];

      if (status) {
        query = 'SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC';
        params = [status];
      }

      const [rows]: any = await connection.execute(query, params);
      const orders = (rows || []).map((o: any) => ({
        ...o,
        items: safeJsonParse(o.items_json, []),
      }));

      return NextResponse.json({ success: true, orders });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Orders list error:', error);
    return NextResponse.json({ success: false, message: 'Sunucu hatası' }, { status: 500 });
  }
}

// PUT /api/orders  (admin: status / fields update)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, adminNote, firstName, lastName, phone, email, address } = body || {};

    if (!id) {
      return NextResponse.json({ success: false, message: 'Sipariş ID gerekli' }, { status: 400 });
    }

    const connection = await getConnection();
    try {
      await connection.execute(
        `UPDATE orders
         SET status = COALESCE(?, status),
             admin_note = COALESCE(?, admin_note),
             first_name = COALESCE(?, first_name),
             last_name = COALESCE(?, last_name),
             phone = COALESCE(?, phone),
             email = COALESCE(?, email),
             address = COALESCE(?, address)
         WHERE id = ?`,
        [status ?? null, adminNote ?? null, firstName ?? null, lastName ?? null, phone ?? null, email ?? null, address ?? null, id]
      );

      const [rows]: any = await connection.execute('SELECT * FROM orders WHERE id = ?', [id]);
      const order = rows?.[0];
      if (!order) return NextResponse.json({ success: false, message: 'Sipariş bulunamadı' }, { status: 404 });

      return NextResponse.json({
        success: true,
        order: { ...order, items: safeJsonParse(order.items_json, []) },
      });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Orders update error:', error);
    return NextResponse.json({ success: false, message: 'Sunucu hatası' }, { status: 500 });
  }
}


