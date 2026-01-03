import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import cloudinary from '@/lib/cloudinary';

// GET - Tüm menüleri getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    const connection = await getConnection();
    
    try {
      let query = 'SELECT * FROM menu_items WHERE is_active = TRUE ORDER BY created_at DESC';
      let params: any[] = [];
      
      if (category && category !== 'All') {
        query = 'SELECT * FROM menu_items WHERE is_active = TRUE AND category = ? ORDER BY created_at DESC';
        params = [category];
      }
      
      const [items] = await connection.execute(query, params);
      
      return NextResponse.json({
        success: true,
        items
      });
      
    } finally {
      await connection.end();
    }
    
  } catch (error) {
    console.error('Menu fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// POST - Yeni menü ekle
export async function POST(request: NextRequest) {
  try {
    const { title, description, category, price, image, cloudinaryPublicId } = await request.json();
    
    if (!title || !category || !price) {
      return NextResponse.json(
        { success: false, message: 'Başlık, kategori ve fiyat gerekli' },
        { status: 400 }
      );
    }
    
    const connection = await getConnection();
    
    try {
      const [result]: any = await connection.execute(
        `INSERT INTO menu_items (title, description, category, price, image, cloudinary_public_id) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [title, description || null, category, price, image || null, cloudinaryPublicId || null]
      );
      
      // Yeni eklenen menüyü getir
      const [items]: any = await connection.execute(
        'SELECT * FROM menu_items WHERE id = ?',
        [result.insertId]
      );
      
      return NextResponse.json({
        success: true,
        message: 'Menü başarıyla eklendi',
        item: items[0]
      });
      
    } finally {
      await connection.end();
    }
    
  } catch (error) {
    console.error('Menu create error:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// PUT - Menü güncelle
export async function PUT(request: NextRequest) {
  try {
    const { id, title, description, category, price, image, cloudinaryPublicId } = await request.json();
    
    if (!id || !title || !category || !price) {
      return NextResponse.json(
        { success: false, message: 'ID, başlık, kategori ve fiyat gerekli' },
        { status: 400 }
      );
    }
    
    const connection = await getConnection();
    
    try {
      await connection.execute(
        `UPDATE menu_items 
         SET title = ?, description = ?, category = ?, price = ?, image = ?, cloudinary_public_id = ?
         WHERE id = ?`,
        [title, description || null, category, price, image || null, cloudinaryPublicId || null, id]
      );
      
      // Güncellenmiş menüyü getir
      const [items]: any = await connection.execute(
        'SELECT * FROM menu_items WHERE id = ?',
        [id]
      );
      
      return NextResponse.json({
        success: true,
        message: 'Menü başarıyla güncellendi',
        item: items[0]
      });
      
    } finally {
      await connection.end();
    }
    
  } catch (error) {
    console.error('Menu update error:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// DELETE - Menü sil
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Menü ID gerekli' },
        { status: 400 }
      );
    }
    
    const connection = await getConnection();
    
    try {
      // Önce resim bilgisini al
      const [items]: any = await connection.execute(
        'SELECT cloudinary_public_id FROM menu_items WHERE id = ?',
        [id]
      );
      
      if (items.length > 0 && items[0].cloudinary_public_id) {
        // Cloudinary'den sil
        try {
          await cloudinary.uploader.destroy(items[0].cloudinary_public_id);
        } catch (cloudError) {
          console.error('Cloudinary delete error:', cloudError);
        }
      }
      
      // Veritabanından sil (soft delete)
      await connection.execute(
        'UPDATE menu_items SET is_active = FALSE WHERE id = ?',
        [id]
      );
      
      return NextResponse.json({
        success: true,
        message: 'Menü başarıyla silindi'
      });
      
    } finally {
      await connection.end();
    }
    
  } catch (error) {
    console.error('Menu delete error:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

