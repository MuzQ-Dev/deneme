import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function setupDatabase() {
  const connection = await mysql.createConnection({
    host: 'srv2025.hstgr.io',
    user: 'u230671021_test',
    password: '2107ow7wpN21bb',
    database: 'u230671021_test',
  });
  
  try {
    // Users tablosunu oluştur
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    console.log('✓ Users tablosu oluşturuldu');
    
    // Test kullanıcısı ekle (muzo / 123)
    const hashedPassword = await bcrypt.hash('123', 10);
    
    try {
      await connection.execute(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        ['muzo', hashedPassword]
      );
      console.log('✓ Test kullanıcısı eklendi: muzo / 123');
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('ℹ Test kullanıcısı zaten mevcut');
      } else {
        throw error;
      }
    }
    
    // Kullanıcıları listele
    const [users] = await connection.execute('SELECT id, username, created_at FROM users');
    console.log('\nKayıtlı kullanıcılar:', users);
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await connection.end();
  }
}

setupDatabase();

