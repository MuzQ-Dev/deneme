import mysql from 'mysql2/promise';

async function updateUsersTable() {
  const connection = await mysql.createConnection({
    host: 'srv2025.hstgr.io',
    user: 'u230671021_test',
    password: '2107ow7wpN21bb',
    database: 'u230671021_test',
  });
  
  try {
    console.log('Users tablosuna yeni kolonlar ekleniyor...');
    
    // Sütunların var olup olmadığını kontrol et
    const [columns]: any = await connection.execute(
      "SHOW COLUMNS FROM users LIKE 'first_name'"
    );
    
    if (columns.length === 0) {
      // first_name ekle
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN first_name VARCHAR(50) NULL AFTER username
      `);
      console.log('✓ first_name kolonu eklendi');
    } else {
      console.log('ℹ first_name kolonu zaten mevcut');
    }
    
    const [columns2]: any = await connection.execute(
      "SHOW COLUMNS FROM users LIKE 'last_name'"
    );
    
    if (columns2.length === 0) {
      // last_name ekle
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN last_name VARCHAR(50) NULL AFTER first_name
      `);
      console.log('✓ last_name kolonu eklendi');
    } else {
      console.log('ℹ last_name kolonu zaten mevcut');
    }
    
    const [columns3]: any = await connection.execute(
      "SHOW COLUMNS FROM users LIKE 'profile_image'"
    );
    
    if (columns3.length === 0) {
      // profile_image ekle
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN profile_image VARCHAR(500) NULL AFTER last_name
      `);
      console.log('✓ profile_image kolonu eklendi');
    } else {
      console.log('ℹ profile_image kolonu zaten mevcut');
    }
    
    const [columns4]: any = await connection.execute(
      "SHOW COLUMNS FROM users LIKE 'cloudinary_public_id'"
    );
    
    if (columns4.length === 0) {
      // cloudinary_public_id ekle
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN cloudinary_public_id VARCHAR(255) NULL AFTER profile_image
      `);
      console.log('✓ cloudinary_public_id kolonu eklendi');
    } else {
      console.log('ℹ cloudinary_public_id kolonu zaten mevcut');
    }
    
    console.log('\n✓ Tablo güncelleme tamamlandı!');
    
    // Güncel tablo yapısını göster
    const [structure] = await connection.execute('DESCRIBE users');
    console.log('\nGüncel tablo yapısı:');
    console.log(structure);
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await connection.end();
  }
}

updateUsersTable();

