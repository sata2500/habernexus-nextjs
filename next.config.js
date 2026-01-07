/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.unsplash.com',
      },
      {
        // Google OAuth profil fotoğrafları için
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        // Google kullanıcı içerikleri için alternatif domain
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
    ],
  },
}

module.exports = nextConfig
