import mysql from 'mysql2/promise';

async function createSiteContentTable() {
  const connection = await mysql.createConnection({
    host: 'srv2025.hstgr.io',
    user: 'u230671021_test',
    password: '2107ow7wpN21bb',
    database: 'u230671021_test',
  });

  try {
    console.log('Site content tablosu oluşturuluyor...');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS site_content (
        id INT AUTO_INCREMENT PRIMARY KEY,
        key_name VARCHAR(100) NOT NULL UNIQUE,
        content_type ENUM('text', 'html', 'json') NOT NULL DEFAULT 'text',
        content_value LONGTEXT NOT NULL,
        section VARCHAR(50) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Varsayılan içerikleri ekle
    const defaultContent = [
      { key: 'hero_title', value: 'Taste Meets Art', section: 'hero' },
      { key: 'hero_subtitle', value: 'Unforgettable Flavours, Perfect Events. From weddings to corporate meetings, we deliver a unique experience.', section: 'hero' },
      { key: 'hero_cta', value: 'Plan Event', section: 'hero' },
      { key: 'why_us_title', value: 'Why Choose Us?', section: 'why_us' },
      { key: 'why_us_subtitle', value: 'We bring excellence to every event', section: 'why_us' },
      { key: 'menu_title', value: 'Our Menu', section: 'menu' },
      { key: 'menu_subtitle', value: 'Discover our delicious offerings', section: 'menu' },
      { key: 'reservation_title', value: 'Reservation & Payment', section: 'reservation' },
      { key: 'reservation_subtitle', value: 'Fill in your details, select your menu, and pay securely. Your order will appear in the admin panel.', section: 'reservation' },
      { key: 'testimonials_title', value: 'What Our Clients Say', section: 'testimonials' },
      { key: 'footer_copyright', value: '© 2026 BEN\'S BAP\'S. All rights reserved.', section: 'footer' },
    ];

    for (const item of defaultContent) {
      await connection.execute(
        `INSERT INTO site_content (key_name, content_value, section) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE content_value = VALUES(content_value)`,
        [item.key, item.value, item.section]
      );
    }

    console.log('✓ Site content tablosu oluşturuldu ve varsayılan içerikler eklendi');
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await connection.end();
  }
}

createSiteContentTable();

