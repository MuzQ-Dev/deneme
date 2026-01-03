import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import cloudinary from '@/lib/cloudinary';

// Profil güncelleme
export async function PUT(request: NextRequest) {
  try {
    const { userId, firstName, lastName, profileImage, cloudinaryPublicId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Kullanıcı ID gerekli' },
        { status: 400 }
      );
    }
    
    const connection = await getConnection();
    
    try {
      await connection.execute(
        `UPDATE users 
         SET first_name = ?, 
             last_name = ?, 
             profile_image = ?,
             cloudinary_public_id = ?
         WHERE id = ?`,
        [firstName || null, lastName || null, profileImage || null, cloudinaryPublicId || null, userId]
      );
      
      // Güncel kullanıcı bilgisini al
      const [rows]: any = await connection.execute(
        'SELECT id, username, first_name, last_name, profile_image, cloudinary_public_id FROM users WHERE id = ?',
        [userId]
      );
      
      return NextResponse.json({
        success: true,
        message: 'Profil güncellendi',
        user: rows[0]
      });
      
    } finally {
      await connection.end();
    }
    
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// Profil resmi silme
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Kullanıcı ID gerekli' },
        { status: 400 }
      );
    }
    
    const connection = await getConnection();
    
    try {
      // Önce mevcut resim bilgisini al
      const [rows]: any = await connection.execute(
        'SELECT cloudinary_public_id FROM users WHERE id = ?',
        [userId]
      );
      
      if (rows.length > 0 && rows[0].cloudinary_public_id) {
        // Cloudinary'den sil
        try {
          await cloudinary.uploader.destroy(rows[0].cloudinary_public_id);
        } catch (cloudError) {
          console.error('Cloudinary delete error:', cloudError);
        }
      }
      
      // Veritabanından resim bilgisini sil
      await connection.execute(
        'UPDATE users SET profile_image = NULL, cloudinary_public_id = NULL WHERE id = ?',
        [userId]
      );
      
      return NextResponse.json({
        success: true,
        message: 'Profil resmi silindi'
      });
      
    } finally {
      await connection.end();
    }
    
  } catch (error) {
    console.error('Profile image delete error:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

