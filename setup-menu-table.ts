import mysql from 'mysql2/promise';

async function createMenuTable() {
  const connection = await mysql.createConnection({
    host: 'srv2025.hstgr.io',
    user: 'u230671021_test',
    password: '2107ow7wpN21bb',
    database: 'u230671021_test',
  });
  
  try {
    console.log('Menu tablosu oluşturuluyor...');
    
    // Menu items tablosunu oluştur
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        image VARCHAR(500),
        cloudinary_public_id VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    console.log('✓ Menu items tablosu oluşturuldu');
    
    // Örnek menü verileri ekle
    const sampleMenus = [
      {
        title: "Meatball Sandwich (Kofte)",
        description: "Grilled meatballs blended with special spices, served with fresh greens and onions.",
        category: "Mains",
        price: 8.50,
        image: "https://images.unsplash.com/photo-1529672425113-d3035c7f4837?q=80&w=600"
      },
      {
        title: "Gourmet Burgers",
        description: "Homemade beef burger patty, melted cheddar, and our signature sauce.",
        category: "Mains",
        price: 9.99,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600"
      },
      {
        title: "Halloumi",
        description: "Grilled halloumi cheese, light and delicious with seasonal greens.",
        category: "Mains",
        price: 7.50,
        image: "https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?q=80&w=600"
      },
      {
        title: "Falafel Platter",
        description: "Crispy chickpea balls accompanied by hummus and tahini sauce.",
        category: "Mains",
        price: 7.99,
        image: "https://images.unsplash.com/photo-1547058881-883304a91983?q=80&w=600"
      },
      {
        title: "Wraps",
        description: "Freshly wrapped tortillas with chicken, meat, or vegetarian options.",
        category: "Mains",
        price: 6.99,
        image: "https://images.unsplash.com/photo-1626700051175-6818013e184f?q=80&w=600"
      },
      {
        title: "English Breakfast",
        description: "Start your day strong with eggs, sausages, beans, toast, and mushrooms.",
        category: "Breakfast",
        price: 12.99,
        image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=600"
      },
      {
        title: "Side Dishes",
        description: "Nuggets, french fries, onion rings, and snacks.",
        category: "Side Dishes",
        price: 4.50,
        image: "https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=600"
      }
    ];
    
    for (const menu of sampleMenus) {
      try {
        await connection.execute(
          'INSERT INTO menu_items (title, description, category, price, image) VALUES (?, ?, ?, ?, ?)',
          [menu.title, menu.description, menu.category, menu.price, menu.image]
        );
        console.log(`✓ ${menu.title} eklendi`);
      } catch (error: any) {
        if (error.code !== 'ER_DUP_ENTRY') {
          console.error(`Hata: ${menu.title} eklenirken sorun:`, error.message);
        }
      }
    }
    
    // Tabloyu göster
    const [items] = await connection.execute('SELECT * FROM menu_items');
    console.log('\n✓ Toplam menü sayısı:', (items as any[]).length);
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await connection.end();
  }
}

createMenuTable();

