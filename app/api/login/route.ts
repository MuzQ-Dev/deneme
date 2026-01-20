import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password required' },
        { status: 400 }
      );
    }
    
    const connection = await getConnection();
    
    try {
      // Kullanıcıyı bul
      const [rows]: any = await connection.execute(
        'SELECT id, username, first_name, last_name, profile_image, cloudinary_public_id, password FROM users WHERE username = ?',
        [username]
      );
      
      if (rows.length === 0) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 401 }
        );
      }
      
      const user = rows[0];
      
      // Şifreyi kontrol et
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, message: 'Incorrect password' },
          { status: 401 }
        );
      }
      
      // Başarılı giriş
      return NextResponse.json({
        success: true,
        message: 'Login successful!',
        user: {
          id: user.id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          profile_image: user.profile_image,
          cloudinary_public_id: user.cloudinary_public_id
        }
      });
      
    } finally {
      await connection.end();
    }
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

