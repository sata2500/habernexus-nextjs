# HaberNexus - Geliştirme Yol Haritası

**Rapor Tarihi:** 21 Ocak 2026  
**Hazırlayan:** AI Geliştirici  
**Proje Sürümü:** v5.4.1

---

## 🎯 Amaç

Bu yol haritası, HaberNexus projesini mevcut durumundan alıp, daha modern, performanslı, güvenli ve sürdürülebilir bir yapıya taşımak için gereken adımları detaylandırmaktadır. Kapsamlı proje analizi sonucunda belirlenen iyileştirme alanları, mantıksal kategorilere ve önceliklendirilmiş fazlara ayrılmıştır.

**Ana Hedefler:**
- **Teknik Borcu Azaltmak:** Kod kalitesini artırmak ve büyük dosyaları yeniden yapılandırmak.
- **Performansı İyileştirmek:** Sayfa yükleme sürelerini kısaltmak ve build süreçlerini hızlandırmak.
- **Kullanıcı Deneyimini Geliştirmek:** Özellikle admin panelinde daha sezgisel ve verimli bir arayüz sunmak.
- **Geleceğe Hazırlamak:** Test altyapısı kurmak ve en son teknolojileri benimsemek.

---

## 🗺️ Geliştirme Fazları ve Kategoriler

Geliştirme süreci, birbiri üzerine inşa edilen 4 ana faza ayrılmıştır. Her faz, projenin farklı bir yönünü iyileştirmeye odaklanır.

| Faz | Odak Alanı | Tahmini Süre |
|-----|------------|--------------|
| **Faz 1** | Temizlik ve Temel İyileştirmeler | 1-2 Hafta |
| **Faz 2** | Performans ve Teknoloji Yükseltme | 2-3 Hafta |
| **Faz 3** | Admin Paneli UX Devrimi | 3-4 Hafta |
| **Faz 4** | Sürdürülebilirlik ve Güvenlik | Sürekli |

---

## 🚀 Faz 1: Temizlik ve Temel İyileştirmeler (Öncelik: Kritik)

**Amaç:** Projenin temelini sağlamlaştırmak, gereksiz kod ve bağımlılıklardan arındırmak ve en büyük kod kalitesi sorunlarını çözmek.

### 🧹 Kategori: Teknoloji Yükseltme ve Temizlik

| Görev | Açıklama | Gerekçe |
|-------|----------|---------|
| **Gereksiz Bağımlılığı Kaldır** | `npm uninstall @emnapi/runtime` komutu ile `@emnapi/runtime` paketi kaldırılacak. | `npm ls` komutu bu paketin "extraneous" (fazlalık) olduğunu gösteriyor. Projede hiçbir yerde kullanılmıyor ve `node_modules` boyutunu gereksiz yere artırıyor. |
| **Bağımlılıkları Güncelle** | `npm outdated` ile belirlenen minor ve patch güncellemeleri yapılacak (`@google/genai`, `@types/node` vb.). | Güvenlik açıklarını kapatmak, bug fixleri almak ve en son API değişikliklerine uyum sağlamak için kritik bir adımdır. |

### 🛠️ Kategori: Kod Kalitesi ve Yeniden Yapılandırma

| Görev | Açıklama | Gerekçe |
|-------|----------|---------|
| **Merkezi Tip Tanımları Oluştur** | `types/admin.ts` gibi merkezi bir dosyada, admin panelinde kullanılan tüm ortak tipler (örn: `User`, `Article`, `RssFeed`) tanımlanacak. | Şu anda tipler farklı dosyalarda dağınık halde. Merkezi bir yapı, kod tekrarını azaltır, tutarlılığı artırır ve geliştirmeyi kolaylaştırır. |
| **`lib/unified-content-engine.ts` Refactor** | 1004 satırlık bu dosya, `ContentSynthesizer`, `ImageGeneratorHandler`, `TrendAnalyzer` gibi daha küçük ve odaklanmış modüllere ayrılacak. | Dosyanın mevcut boyutu, okunabilirliği ve bakımını zorlaştırıyor. Tek Sorumluluk Prensibi (Single Responsibility Principle) uygulanarak kod daha yönetilebilir hale getirilecek. |
| **`app/admin/testler/page.tsx` Refactor** | 1047 satırlık bu test sayfası, `TestRunner`, `TestResultViewer`, `TestConfiguration` gibi yeniden kullanılabilir bileşenlere ayrılacak. | Projenin en büyük dosyası. Bileşenlere ayırmak, hem kodun yeniden kullanılabilirliğini artıracak hem de sayfanın bakımını kolaylaştıracaktır. |

---

## ⚡ Faz 2: Performans ve Teknoloji Yükseltme (Öncelik: Yüksek)

**Amaç:** Projeyi en güncel ve performanslı teknolojilerle donatmak, build sürelerini ve sayfa yükleme hızlarını dramatik şekilde iyileştirmek.

### 🚀 Kategori: Teknoloji Yükseltme

| Görev | Açıklama | Gerekçe |
|-------|----------|---------|
| **Tailwind CSS v4 Yükseltmesi** | Proje, Tailwind CSS v3.4.17'den v4.1.18'e yükseltilecek. `tailwind.config.ts` dosyası yeni formata göre güncellenecek. | **100 kata kadar daha hızlı incremental build.** Rust tabanlı yeni Oxide engine sayesinde geliştirme ortamı çok daha akıcı hale gelecek. Build süreleri %40-60 oranında kısalacak. |
| **Prisma v7 Yükseltmesi** | Proje, Prisma v6.19.1'den v7.2.0'a yükseltilecek. SQLite için `@prisma/adapter-sqlite` sürücüsü entegre edilecek ve `PrismaClient` başlatma konfigürasyonu güncellenecek. | **3 kata kadar daha hızlı veritabanı sorguları.** Rust-free mimari sayesinde %90 daha küçük client boyutu ve daha düşük CPU/bellek kullanımı. Bu, özellikle serverless ortamlarda maliyeti ve performansı doğrudan etkiler. |

### ⚡ Kategori: Performans Optimizasyonu

| Görev | Açıklama | Gerekçe |
|-------|----------|---------|
| **Dinamik Import (Code Splitting)** | Admin paneli sayfaları (`app/admin/*`) ve büyük bileşenler `React.lazy` ve `next/dynamic` kullanılarak dinamik olarak yüklenecek. | İlk sayfa yükleme süresini (Initial Load Time) önemli ölçüde azaltır. Kullanıcı sadece ihtiyaç duyduğu sayfanın kodunu indirir, bu da `_app.js` bundle boyutunu küçültür. |
| **Veri Çekme ve Önbellekleme (Caching)** | `swr` veya `react-query` kütüphanesi entegre edilerek admin panelindeki veri çekme işlemleri (API istekleri) önbelleğe alınacak. | Tekrarlayan API isteklerini önler, sunucu yükünü azaltır ve arayüzü daha hızlı ve akıcı hale getirir. Stale-while-revalidate stratejisi ile veri güncelliği ve hız dengesi sağlanır. |

---

## ✨ Faz 3: Admin Paneli UX Devrimi (Öncelik: Yüksek)

**Amaç:** Admin panelini, modern, verimli ve kullanıcı dostu bir yönetim aracına dönüştürmek.

### 🎨 Kategori: Admin Paneli UX/UI Geliştirmeleri

| Görev | Açıklama | Gerekçe |
|-------|----------|---------|
| **Yeniden Kullanılabilir `DataTable` Bileşeni** | `react-table` veya benzeri bir kütüphane üzerine inşa edilmiş, **sunucu taraflı (server-side)** pagination, sıralama, filtreleme ve toplu işlem (bulk actions) yeteneklerine sahip merkezi bir `DataTable` bileşeni oluşturulacak. | Şu anda her liste sayfası (Makaleler, Kullanıcılar vb.) kendi basit tablosunu kullanıyor. Bu, kod tekrarına ve UX tutarsızlığına yol açıyor. Merkezi bir bileşen, tüm listeleme sayfalarına modern ve güçlü özellikler kazandırır. |
| **Sidebar Navigasyonunu Yeniden Yapılandır** | Mevcut 15 maddelik düz liste, `İçerik Yönetimi`, `Kullanıcı Yönetimi`, `Sistem` gibi **açılır-kapanır (collapsible)** gruplara ayrılacak. | Mevcut yapı, aranan sayfayı bulmayı zorlaştırıyor. Gruplandırma, navigasyonu daha sezgisel ve ölçeklenebilir hale getirir. |
| **Büyük Admin Sayfalarını Refactor Et** | `surum-yonetimi`, `veri-aktarimi`, `env-yonetimi` gibi 500 satırı aşan sayfalar, daha küçük ve yönetilebilir alt bileşenlere ayrılacak. | Bu sayfaların mevcut karmaşıklığı, yeni özellik eklemeyi veya hata ayıklamayı zorlaştırıyor. Bileşenlere ayırmak, kodun okunabilirliğini ve bakımını kolaylaştırır. |
| **Merkezi Modal ve Bildirim Sistemi** | `ConfirmDialog`, `Notification` gibi tüm admin panelinde kullanılacak standart UI bileşenleri oluşturulacak. | Şu anda `window.confirm` gibi eski yöntemler veya tutarsız modal yapıları kullanılıyor. Standart bileşenler, tutarlı bir kullanıcı deneyimi ve daha temiz bir kod tabanı sağlar. |

---

## 🛡️ Faz 4: Sürdürülebilirlik ve Güvenlik (Öncelik: Sürekli)

**Amaç:** Projenin uzun vadeli sağlığını, güvenilirliğini ve bakımını garanti altına almak.

### 🧪 Kategori: Test Altyapısı Kurulumu

| Görev | Açıklama | Gerekçe |
|-------|----------|---------|
| **Test Altyapısını Kur** | `Jest` ve `React Testing Library` projeye entegre edilecek. `tsconfig.json` ve `eslint.config.mjs` dosyaları test ortamı için yapılandırılacak. | Şu anda projenin test kapsamı %0. Bu, yeni özellikler eklerken veya refactoring yaparken regresyon riskini artırır. Test altyapısı, projenin kararlılığı için zorunludur. |
| **Kritik Fonksiyonlar için Unit Testler Yaz** | `lib` klasöründeki yardımcı fonksiyonlar (örn: `utils.ts`, `prompts.ts`) ve basit bileşenler için birim testleri yazılacak. | Projenin temel iş mantığının doğru çalıştığını garanti altına alır ve gelecekteki değişiklikler için bir güvenlik ağı sağlar. |
| **CI Sürecine Test Adımı Ekle** | GitHub Actions (`ci.yml`) workflow'una, her push ve pull request'te testleri otomatik çalıştıran bir adım eklenecek. | Kod tabanına hatalı kodun sızmasını engeller ve kod kalitesini sürekli olarak yüksek tutar. |

### 🔒 Kategori: Güvenlik İyileştirmeleri

| Görev | Açıklama | Gerekçe |
|-------|----------|---------|
| **API Rate Limiting Ekle** | API endpoint'lerine, belirli bir zaman diliminde yapılabilecek istek sayısını sınırlayan bir rate-limiter (örn: `upstash/ratelimit`) eklenecek. | Brute-force saldırılarını ve hizmetin kötüye kullanılmasını (DDoS) önler. Sunucu kaynaklarını korur. |
| **Gelişmiş Giriş Doğrulama (Input Validation)** | API endpoint'lerinde ve formlarda `zod` kütüphanesi kullanılarak daha katı ve şema tabanlı giriş doğrulaması yapılacak. | SQL injection, XSS gibi yaygın güvenlik açıklarını önlemenin en etkili yollarından biridir. Veri bütünlüğünü sağlar. |
| **Admin Eylem Günlüğü (Audit Log)** | Admin panelinde yapılan tüm kritik işlemler (kullanıcı silme, ayar değiştirme vb.) veritabanındaki bir `AuditLog` tablosuna kaydedilecek. | Güvenlik olaylarını izlemeyi, yetkisiz erişimi tespit etmeyi ve sorun gidermeyi kolaylaştırır. Hesap verebilirliği artırır. |

---

## 🎯 Sonuç

Bu yol haritası, HaberNexus projesini teknik mükemmellik seviyesine taşımak için net ve eyleme geçirilebilir bir plan sunmaktadır. Fazları sırayla tamamlamak, projenin kararlılığını korurken, her adımda somut iyileştirmeler sağlayacaktır. Bu sürecin sonunda HaberNexus, sadece özellik zengini değil, aynı zamanda hızlı, güvenli ve bakımı kolay bir platform haline gelecektir.
