import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

// Test modu için sipariş oluştur (Stripe olmadan)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, phone, email, address, selectedItems } = body;

    if (!firstName || !lastName || !phone || !email || !address || !selectedItems || selectedItems.length === 0) {
      return NextResponse.json({ success: false, message: 'All fields and at least one menu item required' }, { status: 400 });
    }

    const connection = await getConnection();
    try {
      // Menü fiyatlarını DB'den çek
      const itemIds = selectedItems.map((si: any) => si.id);
      const placeholders = itemIds.map(() => '?').join(',');
      const [menuRows]: any = await connection.execute(
        `SELECT id, price FROM menu_items WHERE id IN (${placeholders}) AND is_active = TRUE`,
        itemIds
      );

      const priceMap = new Map(menuRows.map((m: any) => [m.id, Number(m.price)]));
      const items = selectedItems.map((si: any) => {
        const price = priceMap.get(si.id) || 0;
        return { id: si.id, qty: si.qty, price };
      });

      const total = items.reduce((sum: number, i: any) => sum + i.price * i.qty, 0);

      // Sipariş numarası oluştur (ORD-YYYYMMDD-HHMMSS-RANDOM)
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const orderNumber = `ORD-${dateStr}-${timeStr}-${random}`;

      // Sipariş oluştur (test modu: direkt paid)
      const [result]: any = await connection.execute(
        `INSERT INTO orders 
         (order_number, first_name, last_name, phone, email, address, items_json, total_amount, status, payment_method, test_mode)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'paid', 'test_mode', TRUE)`,
        [orderNumber, firstName, lastName, phone, email, address, JSON.stringify(items), total]
      );

      const orderId = result.insertId;

      return NextResponse.json({
        success: true,
        order: {
          id: orderId,
          orderNumber,
          total,
        },
      });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Test mode order error:', error);
    return NextResponse.json({ success: false, message: 'Sunucu hatası' }, { status: 500 });
  }
}

