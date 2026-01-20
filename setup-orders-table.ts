import mysql from 'mysql2/promise';

async function createOrdersTable() {
  const connection = await mysql.createConnection({
    host: 'srv2025.hstgr.io',
    user: 'u230671021_test',
    password: '2107ow7wpN21bb',
    database: 'u230671021_test',
  });

  try {
    console.log('Orders tablosu oluşturuluyor...');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        status ENUM('pending_payment','paid','accepted','rejected','cancelled') NOT NULL DEFAULT 'pending_payment',

        first_name VARCHAR(80) NOT NULL,
        last_name VARCHAR(80) NOT NULL,
        phone VARCHAR(40) NOT NULL,
        email VARCHAR(160) NOT NULL,
        address TEXT NOT NULL,

        items_json LONGTEXT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'GBP',

        stripe_checkout_session_id VARCHAR(255) NULL,
        stripe_payment_intent_id VARCHAR(255) NULL,

        admin_note TEXT NULL,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✓ Orders tablosu oluşturuldu');
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await connection.end();
  }
}

createOrdersTable();


