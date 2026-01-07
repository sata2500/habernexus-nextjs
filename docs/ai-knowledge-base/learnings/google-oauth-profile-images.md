# Google OAuth Profile Images Configuration

**Date:** 07 January 2026  
**Category:** Configuration  
**Status:** Resolved

---

## Problem

When users sign in with Google OAuth, their profile images are not displayed. The browser console shows errors related to image loading from Google domains.

## Root Cause

Next.js Image component requires explicit configuration of allowed remote image domains in `next.config.js`. Google profile images are served from `lh3.googleusercontent.com`, which was not included in the `remotePatterns` configuration.

## Solution

Add Google image domains to `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // ... other patterns
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
```

## Key Learnings

1. **Always check image domains:** When implementing OAuth providers, check which domains they use for profile images.
2. **Use wildcards carefully:** The `*.googleusercontent.com` pattern covers future Google domain changes.
3. **Test after changes:** Verify image loading works after configuration changes.

## Related Files

- `next.config.js` - Image domain configuration
- `components/layout/Header.tsx` - Profile image display component
- `app/admin/layout.tsx` - Admin panel profile image display

## References

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
