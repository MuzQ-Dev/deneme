import mysql from 'mysql2/promise';

async function updateOrdersTable() {
  const connection = await mysql.createConnection({
    host: 'srv2025.hstgr.io',
    user: 'u230671021_test',
    password: '2107ow7wpN21bb',
    database: 'u230671021_test',
  });

  try {
    console.log('Orders tablosu güncelleniyor...');

    // order_number kolonu ekle
    try {
      await connection.execute(`
        ALTER TABLE orders 
        ADD COLUMN order_number VARCHAR(50) NULL UNIQUE AFTER id
      `);
      console.log('✓ order_number kolonu eklendi');
    } catch (error: any) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ order_number kolonu zaten mevcut');
      } else {
        throw error;
      }
    }

    // payment_method kolonu ekle
    try {
      await connection.execute(`
        ALTER TABLE orders 
        ADD COLUMN payment_method VARCHAR(50) NULL AFTER stripe_payment_intent_id
      `);
      console.log('✓ payment_method kolonu eklendi');
    } catch (error: any) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ payment_method kolonu zaten mevcut');
      } else {
        throw error;
      }
    }

    // test_mode kolonu ekle
    try {
      await connection.execute(`
        ALTER TABLE orders 
        ADD COLUMN test_mode BOOLEAN DEFAULT FALSE AFTER payment_method
      `);
      console.log('✓ test_mode kolonu eklendi');
    } catch (error: any) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ test_mode kolonu zaten mevcut');
      } else {
        throw error;
      }
    }

    console.log('\n✓ Tablo güncelleme tamamlandı!');
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await connection.end();
  }
}

updateOrdersTable();

