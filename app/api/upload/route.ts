import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { getConnection } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Dosya gerekli' },
        { status: 400 }
      );
    }
    
    // Dosyayı buffer'a çevir
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Base64'e çevir
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;
    
    // Cloudinary'ye yükle
    const uploadResult = await cloudinary.uploader.upload(base64Image, {
      folder: 'user-profiles',
      transformation: [
        { width: 500, height: 500, crop: 'fill', gravity: 'face' },
        { quality: 'auto' }
      ]
    });
    
    // Eğer kullanıcının eski resmi varsa sil
    if (userId) {
      const connection = await getConnection();
      try {
        const [rows]: any = await connection.execute(
          'SELECT cloudinary_public_id FROM users WHERE id = ?',
          [userId]
        );
        
        if (rows.length > 0 && rows[0].cloudinary_public_id) {
          // Eski resmi Cloudinary'den sil
          try {
            await cloudinary.uploader.destroy(rows[0].cloudinary_public_id);
          } catch (error) {
            console.error('Eski resim silinemedi:', error);
          }
        }
      } finally {
        await connection.end();
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Resim yüklendi',
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id
    });
    
  } catch (error: any) {
    console.error('Upload error:', error);
    
    // Cloudinary hata mesajlarını daha anlaşılır hale getir
    let errorMessage = 'Yükleme hatası';
    
    if (error.http_code === 401) {
      if (error.message?.includes('cloud_name')) {
        errorMessage = 'Cloudinary cloud_name geçersiz. Lütfen Cloudinary Dashboard\'dan doğru cloud_name\'i kontrol edin.';
      } else {
        errorMessage = 'Cloudinary kimlik bilgileri geçersiz. API Key ve API Secret\'ı kontrol edin.';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

