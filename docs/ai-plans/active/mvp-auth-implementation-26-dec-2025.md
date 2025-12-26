# MVP Authentication Implementation Plan

**Tarih:** 26 Aralık 2025  
**Agent:** Manus AI  
**Durum:** Aktif

## 1. Amaç

ROADMAP.md'de belirtilen MVP (v1.0) için bekleyen özellikleri tamamlamak:
- Google OAuth ile kimlik doğrulama (Auth.js v5 entegrasyonu)
- 3 Seviyeli kullanıcı sistemi (Admin, Yazar, Kullanıcı) rollerin yetkileri

## 2. Araştırma Özeti

### Auth.js v5 Temel Değişiklikler:
- Konfigürasyon dosyası root'ta `auth.ts` olarak oluşturulmalı
- `@auth/prisma-adapter` kullanılmalı (eski `@next-auth/prisma-adapter` yerine)
- Edge uyumluluğu için JWT stratejisi önerilir (SQLite/Prisma ile)
- `auth()` fonksiyonu ile her yerde session alınabilir
- Middleware için ayrı `auth.config.ts` gerekebilir

### Mevcut Durum:
- Prisma schema'da User modeli ve Role enum'u mevcut (ADMIN, AUTHOR, USER)
- `@auth/prisma-adapter` zaten package.json'da mevcut
- `next-auth@5.0.0-beta.30` zaten yüklü

## 3. Micro-Step Implementation Plan

### Step 1: Auth.js Prisma Schema Güncellemesi
- **Dosyalar:** `prisma/schema.prisma`
- **İşlem:** Auth.js için gerekli Account, Session, VerificationToken modellerini ekle
- **Doğrulama:** `npx prisma generate && npx prisma db push`

### Step 2: Auth Konfigürasyon Dosyaları
- **Dosyalar:** `auth.config.ts`, `auth.ts`
- **İşlem:** Auth.js v5 konfigürasyonunu oluştur
- **Doğrulama:** `npx tsc --noEmit`

### Step 3: API Route Handler
- **Dosyalar:** `app/api/auth/[...nextauth]/route.ts`
- **İşlem:** Auth handlers'ı export et
- **Doğrulama:** `npm run build`

### Step 4: Middleware
- **Dosyalar:** `middleware.ts`
- **İşlem:** Korumalı rotalar için middleware oluştur
- **Doğrulama:** `npm run build`

### Step 5: Session Provider
- **Dosyalar:** `components/providers/SessionProvider.tsx`, `app/layout.tsx`
- **İşlem:** Client-side session yönetimi için provider ekle
- **Doğrulama:** `npm run build`

### Step 6: Login/Logout UI
- **Dosyalar:** `components/layout/Header.tsx`, `app/auth/signin/page.tsx`
- **İşlem:** Giriş/çıkış butonları ve sayfası
- **Doğrulama:** `npm run dev` ile manuel test

### Step 7: Admin Panel Koruma
- **Dosyalar:** `app/admin/layout.tsx`
- **İşlem:** Admin sayfalarını sadece ADMIN rolüne aç
- **Doğrulama:** `npm run build`

## 4. Hata Günlüğü

(Hatalar burada loglanacak)

## 5. Test Sonuçları

(Test sonuçları burada kaydedilecek)
