import { v2 as cloudinary } from 'cloudinary';

// Cloudinary yapılandırması
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
const apiKey = process.env.CLOUDINARY_API_KEY || '';
const apiSecret = process.env.CLOUDINARY_API_SECRET || '';

// Debug: Yapılandırma bilgilerini kontrol et (sadece development)
if (process.env.NODE_ENV === 'development') {
  console.log('Cloudinary Config:', {
    cloud_name: cloudName ? `${cloudName.substring(0, 3)}...` : 'MISSING',
    api_key: apiKey ? `${apiKey.substring(0, 5)}...` : 'MISSING',
    api_secret: apiSecret ? 'SET' : 'MISSING',
  });
}

if (!cloudName || !apiKey || !apiSecret) {
  console.error('Cloudinary credentials eksik!');
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export default cloudinary;

