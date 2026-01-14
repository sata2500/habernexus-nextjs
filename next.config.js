/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack configuration (required for Next.js 16+)
  turbopack: {},
  images: {
    // Allow local images from public folder
    // Next.js automatically serves images from /public without needing remotePatterns
    // But we need to configure domains for external images
    remotePatterns: [
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
      {
        // Unsplash görselleri için
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        // Unsplash CDN
        protocol: 'https',
        hostname: '*.unsplash.com',
      },
      {
        // Placeholder görseller için (picsum.photos)
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        // Placeholder görseller için (placeholder.com)
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        // Haber kaynakları - genel
        protocol: 'https',
        hostname: '*.com',
      },
      {
        // Haber kaynakları - .org
        protocol: 'https',
        hostname: '*.org',
      },
      {
        // Haber kaynakları - .net
        protocol: 'https',
        hostname: '*.net',
      },
      {
        // Türk haber siteleri - .com.tr
        protocol: 'https',
        hostname: '*.com.tr',
      },
    ],
    // Optimize image loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Enable modern formats
    formats: ['image/avif', 'image/webp'],
    // Minimize external image requests during development
    minimumCacheTTL: 60,
    // Disable blur placeholder for better performance
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

module.exports = nextConfig
