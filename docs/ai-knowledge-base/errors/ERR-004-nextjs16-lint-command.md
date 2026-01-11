# ERR-004: Next.js 16 Lint Komutu Değişikliği

**Tarih:** 11 Ocak 2026  
**Agent:** Manus AI  
**Durum:** Çözüldü

---

## Sorun Açıklaması

Next.js 16'da `next lint` komutu kaldırıldı veya farklı çalışıyor. `npm run lint` komutu çalıştırıldığında şu hata alınıyor:

```
Invalid project directory provided, no such directory: /home/ubuntu/habernexus-nextjs/lint
```

## Kök Neden

Next.js 16, lint komutunu farklı bir şekilde işliyor. `next lint` yerine ESLint doğrudan kullanılmalı.

## Çözüm

`package.json` dosyasındaki lint script'ini ESLint'i doğrudan kullanacak şekilde güncelle:

**Önceki:**
```json
"lint": "next lint"
```

**Sonraki:**
```json
"lint": "eslint app components lib scripts --ext .ts,.tsx,.js"
```

## Doğrulama

```bash
npm run lint
# Çıktı olmamalı (hata yok)
```

## İlgili Dosyalar

- `package.json`
- `eslint.config.mjs`

## Önleme Stratejileri

1. Next.js major versiyon güncellemelerinde lint komutunu kontrol et
2. ESLint flat config kullanıldığından emin ol
3. `.next` klasörünü lint'ten hariç tut

## Referanslar

- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- [Next.js 16 Changelog](https://nextjs.org/blog)
