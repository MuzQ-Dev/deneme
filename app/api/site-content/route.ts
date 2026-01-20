import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

// GET - Tüm içerikleri veya belirli bir key'i getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const section = searchParams.get('section');
    
    const connection = await getConnection();
    
    try {
      let query = 'SELECT * FROM site_content';
      let params: any[] = [];
      
      if (key) {
        query += ' WHERE key_name = ?';
        params = [key];
      } else if (section) {
        query += ' WHERE section = ?';
        params = [section];
      }
      
      query += ' ORDER BY section, key_name';
      
      const [rows]: any = await connection.execute(query, params);
      
      if (key && rows.length > 0) {
        return NextResponse.json({
          success: true,
          content: rows[0]
        });
      }
      
      return NextResponse.json({
        success: true,
        contents: rows
      });
      
    } finally {
      await connection.end();
    }
    
  } catch (error) {
    console.error('Site content fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// PUT - İçerik güncelle
export async function PUT(request: NextRequest) {
  try {
    const { key, value, section } = await request.json();
    
    if (!key || !value) {
      return NextResponse.json(
        { success: false, message: 'Key and value required' },
        { status: 400 }
      );
    }
    
    const connection = await getConnection();
    
    try {
      await connection.execute(
        `INSERT INTO site_content (key_name, content_value, section) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE content_value = ?, section = ?`,
        [key, value, section || null, value, section || null]
      );
      
      return NextResponse.json({
        success: true,
        message: 'Content updated'
      });
      
    } finally {
      await connection.end();
    }
    
  } catch (error) {
    console.error('Site content update error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

