> # Uyumluluk Sorunları ve Karşılaşılan Hatalar Raporu

**Rapor Tarihi:** 21 Ocak 2026  
**Hazırlayan:** Manus AI  
**Proje:** HaberNexus v5.4.1

---

## 1. Özet

Bu rapor, HaberNexus projesinin geliştirme sürecinde karşılaşılan önemli teknoloji uyumluluk sorunlarını, bu sorunların nedenlerini, yapılan araştırmaları ve uygulanan çözümleri detaylandırmaktadır. Temel olarak **Tailwind CSS v4** ve **Prisma v7** sürümlerine yükseltme denemeleri sırasında kritik `build` hataları alınmıştır. Bu nedenle, projenin stabilitesini korumak amacıyla bu teknolojilerin daha kararlı olan eski sürümlerine geri dönülmüştür.

---

## 2. Tailwind CSS v4 Yükseltme Sorunu

### 2.1. Karşılaşılan Hata

Tailwind CSS `v3.4.19` sürümünden `v4.1.18` sürümüne yükseltme yapıldıktan sonra, `npm run build` komutu aşağıdaki hatayı vermiştir:

```bash
Error: It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin.
The PostCSS plugin has moved to a separate package, so to continue using Tailwind CSS with PostCSS
you'll need to install `@tailwindcss/postcss` and update your PostCSS configuration.
```

Bu hatanın devamında ise şu `build` hatası alınmıştır:

```bash
CssSyntaxError: tailwindcss: /home/ubuntu/habernexus-nextjs/app/globals.css:1:1: Cannot apply unknown utility class `bg-gray-50`.
```

### 2.2. Araştırma ve Neden Analizi

Bu sorunu çözmek için yapılan araştırmalar, hatanın Tailwind CSS v4'ün getirdiği köklü değişikliklerden kaynaklandığını ortaya koymuştur:

-   **PostCSS Bağımlılığının Kalkması:** Tailwind CSS v4, artık bir PostCSS eklentisi olarak çalışmamaktadır. Kendi içerisinde Rust tabanlı **Oxide** adında yeni bir derleme motoru ile gelmektedir. Bu nedenle, `postcss.config.js` dosyasındaki `tailwindcss` eklentisi geçersiz hale gelmiştir.
-   **Yeni Kurulum Prosedürü:** v4 ile birlikte, PostCSS entegrasyonu için `@tailwindcss/postcss` adında ayrı bir paket kurulması ve `postcss.config.mjs` dosyasının bu yeni paketi kullanacak şekilde güncellenmesi gerekmektedir.
-   **Direktif Değişiklikleri:** `globals.css` dosyasındaki `@tailwind base;`, `@tailwind components;`, `@tailwind utilities;` direktifleri yerine, v4'te tek bir `@import "tailwindcss";` direktifi kullanılmaktadır.

Bu konuda [GitHub Issue #15735](https://github.com/tailwindlabs/tailwindcss/issues/15735) ve [resmi dokümantasyon](https://tailwindcss.com/docs/installation/framework-guides/nextjs) incelenmiştir.

### 2.3. Uygulanan Çözüm

Tailwind CSS v4'ün Next.js 16 ve mevcut proje yapısıyla tam uyumlu çalışmaması ve `build` sürecini karmaşıklaştırması nedeniyle, projenin stabilitesini önceliklendirerek **Tailwind CSS v3.4.19** sürümüne geri dönülmüştür. Bu, en güvenli ve en hızlı çözüm olarak değerlendirilmiştir.

---

## 3. Prisma v7 Yükseltme Sorunu

### 3.1. Karşılaşılan Hata

Prisma `v6.19.2` sürümünden `v7.2.0` sürümüne yükseltme denemesi sonrasında, `npm run build` komutu şu hatayı vermiştir:

```bash
Error [PrismaClientConstructorValidationError]: Using engine type "client" requires either "adapter" or "accelerateUrl" to be provided to PrismaClient constructor.
Read more at https://pris.ly/d/client-constructor
```

Bu hata, Prisma Client'ın başlatılması sırasında `adapter` veya `accelerateUrl` parametrelerinin eksik olmasından kaynaklanmaktadır.

### 3.2. Araştırma ve Neden Analizi

Prisma v7 dokümantasyonu incelendiğinde, bu sürümle birlikte veritabanı bağlantı URL'sinin `schema.prisma` dosyasından çıkarıldığı ve doğrudan `PrismaClient` başlatılırken sağlanması gerektiği anlaşılmıştır. Bu değişiklik, özellikle serverless ortamlarda daha esnek bağlantı yönetimi sağlamak amacıyla yapılmıştır.

### 3.3. Denenen Çözümler ve Sonuçları

1.  **`schema.prisma` Güncellemesi:** `datasource db` bloğundan `url` alanı kaldırılmıştır.
2.  **`PrismaClient` Başlatma Güncellemesi:** `lib/prisma.ts` dosyasında `PrismaClient`'a `datasources` parametresi eklenerek `url` sağlanmaya çalışılmıştır. Ancak bu, TypeScript tip hatalarına neden olmuştur.
3.  **`prisma generate` Sorunu:** `schema.prisma` dosyasında `url` alanı olmayınca, `npx prisma generate` komutu `P1012` hata kodu ile başarısız olmuştur.

Bu denemeler, Prisma v7'nin mevcut proje yapısıyla entegrasyonunun beklenenden daha karmaşık olduğunu ve ek yapılandırma gerektirdiğini göstermiştir.

### 3.4. Uygulanan Çözüm

Projenin veritabanı katmanındaki stabiliteyi korumak ve geliştirme sürecini yavaşlatmamak adına, **Prisma v6.19.2** sürümüne geri dönülmüştür. Bu sürüm, mevcut yapı ile sorunsuz çalışmaktadır.

---

## 4. Genel Değerlendirme ve Sonuç

Her iki teknoloji yükseltme denemesi de, yeni sürümlerin getirdiği önemli yapısal değişiklikler nedeniyle başarısız olmuştur. Bu tür "major" sürüm yükseltmeleri, genellikle ek yapılandırma, kod refactoring'i ve kapsamlı test süreçleri gerektirir.

**Öneri:** Projenin mevcut kararlı yapısı korunmalı ve bu teknolojilerin yeni sürümlerine geçiş, ayrı bir "teknik borç ödeme" sprint'inde, daha detaylı bir planlama ile ele alınmalıdır. Şimdilik, mevcut stabil sürümlerle geliştirme yapmak en doğru yaklaşımdır.
