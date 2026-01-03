/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    MYSQL_HOST: 'srv2025.hstgr.io',
    MYSQL_USER: 'u230671021_test',
    MYSQL_PASSWORD: '2107ow7wpN21bb',
    MYSQL_DATABASE: 'u230671021_test',
    // Cloudinary credentials
    // ÖNEMLİ: cloud_name Dashboard'un sağ üst köşesinde veya Settings > Account Details'te bulunur
    // "Key Name" değeri DEĞİL, hesap ayarlarındaki "Cloud name" değeri kullanılmalı
    CLOUDINARY_CLOUD_NAME: 'ddzo3wugb', // Dashboard'dan "Cloud name" değerini kopyalayın
    CLOUDINARY_API_KEY: '473679788567838',
    CLOUDINARY_API_SECRET: 'r2t4WV8Us3oHO7J5N77AI-OES2s',
  }
}

module.exports = nextConfig

