# HaberNexus: GitHub Güncellemelerini Çekme Rehberi

Bu rehber, projenin GitHub deposundaki en son değişiklikleri kendi yerel makinenize nasıl alacağınızı (pull) açıklar.

---

## Güncellemeler Neden Önemli?

Proje sürekli olarak geliştiriliyor. Ben (veya başka AI ajanları) yeni özellikler eklediğinde, hataları düzelttiğinde veya dokümantasyonu güncellediğinde, bu değişiklikler önce GitHub deposuna yüklenir. Kendi yerel kopyanızın güncel kalması için bu değişiklikleri düzenli olarak çekmeniz gerekir.

---

## En Kolay Yöntem: `git pull`

### Adım 1: Proje Klasörüne Gidin

Terminalinizi açın ve HaberNexus projenizin bulunduğu klasöre gidin:

```bash
cd ~/habernexus-nextjs
```

### Adım 2: Güncellemeleri Çekin

En son değişiklikleri çekmek için aşağıdaki basit komutu çalıştırın:

```bash
git pull origin main
```

**Bu komut ne yapar?**

-   `git pull`: Değişiklikleri çek ve yerel kopyanla birleştir komutudur.
-   `origin`: GitHub deposunun varsayılan adıdır.
-   `main`: Değişikliklerin çekileceği ana branch'tir.

### Adım 3: Bağımlılıkları Güncelleyin (Gerekirse)

Eğer çekilen güncellemeler `package.json` dosyasında bir değişiklik içeriyorsa (yani yeni bir kütüphane eklenmiş veya bir kütüphane güncellenmişse), bağımlılıklarınızı yeniden yüklemeniz gerekir:

```bash
npm install
```

**İpucu:** `git pull` komutunun çıktısını kontrol edin. Eğer `package.json` dosyasının değiştiğini görürseniz, `npm install` komutunu çalıştırmak iyi bir fikirdir.

---

## Olası Sorunlar ve Çözümleri

### Sorun: "Your local changes to the following files would be overwritten by merge..."

**Anlamı:** Siz yerelinizde bazı dosyalarda değişiklik yapmışsınız ve bu dosyalar GitHub'dan gelen güncellemelerle çakışıyor.

**Çözüm 1: Değişiklikleriniz Önemli Değilse**

Eğer yaptığınız değişiklikleri kaybetmek sorun değilse, şu komutlarla yerel değişikliklerinizi geri alabilir ve sonra güncellemeyi çekebilirsiniz:

```bash
# DİKKAT: Bu komut yerel değişikliklerinizi SİLER!
git reset --hard

# Şimdi güncellemeyi çekin
git pull origin main
```

**Çözüm 2: Değişiklikleriniz Önemliyse**

Eğer değişikliklerinizi korumak istiyorsanız, onları geçici olarak saklayabilirsiniz (`stash`):

```bash
# Değişikliklerinizi geçici olarak saklayın
git stash

# Güncellemeyi çekin
git pull origin main

# Sakladığınız değişiklikleri geri getirin
git stash pop
```

Eğer `git stash pop` komutu bir çakışma (conflict) verirse, Git size hangi dosyalarda çakışma olduğunu gösterecektir. Bu dosyaları manuel olarak düzenleyip çakışmaları çözmeniz gerekir.

---

## Özet

Çoğu zaman, projenizi güncellemek için tek yapmanız gereken şey şudur:

```bash
cd ~/habernexus-nextjs
git pull origin main
npm install
```

Bu, projenizin her zaman en güncel ve en kararlı halde kalmasını sağlar.
