# Node.js Versiyon Yükseltme Rehberi

**Sorun:** Proje, sisteminizde yüklü olan Node.js versiyonundan daha yeni bir versiyon gerektiriyor.

**Hata Mesajı:**
```
You are using Node.js 18.19.1. For Next.js, Node.js version ">=20.9.0" is required.
```

**Çözüm:** Node.js versiyonunuzu en az 20.9.0 veya daha üzerine yükseltmek.

---

## En Kolay ve Önerilen Yöntem: `nvm` (Node Version Manager)

`nvm`, farklı Node.js versiyonlarını aynı anda sisteminizde tutmanızı ve kolayca aralarında geçiş yapmanızı sağlayan bir araçtır. Bu, en esnek ve en güvenli yöntemdir.

### Adım 1: `nvm` Kurulumu

Eğer `nvm` yüklü değilse, aşağıdaki komutu terminalinizde çalıştırın:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

Kurulumdan sonra terminalinizi **kapatıp yeniden açın**.

### Adım 2: Yeni Node.js Versiyonunu Yükleme

Şimdi, en son LTS (Long Term Support - Uzun Süreli Destek) versiyonunu yükleyelim. Bu genellikle en kararlı versiyondur.

```bash
nvm install --lts
```

Bu komut, en güncel kararlı Node.js versiyonunu (şu an için v22.x.x gibi) yükleyecek ve otomatik olarak onu kullanmaya başlayacaktır.

### Adım 3: Yeni Versiyonu Doğrulama

Node.js versiyonunuzun başarıyla yükseltildiğini kontrol edin:

```bash
node -v
```

Çıktının `v20.9.0` veya daha yüksek olması gerekir (örneğin, `v22.13.0`).

### Adım 4: Projeyi Yeniden Başlatma

Şimdi HaberNexus projesinin klasörüne geri dönün ve geliştirme sunucusunu yeniden başlatın.

```bash
cd ~/habernexus-nextjs

# Önceki bağımlılıkları silmek iyi bir fikirdir
rm -rf node_modules

# Bağımlılıkları yeniden yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

Artık projeniz sorunsuz bir şekilde çalışacaktır.

---

## `nvm` Kullanmanın Avantajları

- **Proje Bağımsızlığı:** Farklı projeleriniz farklı Node.js versiyonları gerektirebilir. `nvm use 18` veya `nvm use 22` gibi komutlarla anında versiyon değiştirebilirsiniz.
- **Güvenlik:** Sisteminizin ana Node.js kurulumuna dokunmaz, bu da yetki sorunlarını önler.
- **Kolaylık:** Tek komutla en son versiyonu yükleyebilir veya silebilirsiniz.

---

## Diğer Notlar

- **Prisma Update Uyarısı:** Çıktılarınızda Prisma için bir güncelleme uyarısı görünüyor. Bu bir hata değildir, sadece bilgilendirmedir. Şimdilik görmezden gelebilirsiniz. Projenin ilerleyen aşamalarında bağımlılıkları güncelleyebiliriz.
- **npm WARN EBADENGINE:** Bu uyarı, `npm install` sırasında gördüğünüz Node.js versiyon uyumsuzluğu uyarısıdır. `nvm` ile Node.js versiyonunu yükselttiğinizde bu uyarı da ortadan kalkacaktır.
