# Veri Aktarımı (Migration)

**Özellik Sürümü:** v3.1

Bu rehber, HaberNexus kurulumunuzdaki tüm verileri (veritabanı, ayarlar vb.) başka bir sunucuya veya yeni bir kuruluma nasıl güvenli bir şekilde aktaracağınızı açıklar.

---

## 🎯 Amaç

Veri aktarım özelliği, sunucu değiştirme, yedekten dönme veya test ortamı oluşturma gibi senaryolarda tüm verilerinizi kayıpsız ve güvenli bir şekilde taşımanızı sağlar. Bu sistem, tüm veritabanını şifreli tek bir paket haline getirir ve bu paketi yeni sisteme kolayca aktarmanıza olanak tanır.

---

## ✨ Nasıl Çalışır?

Aktarım süreci 3 basit adımdan oluşur:

1.  **Dışa Aktar (Export):** Eski sunucunuzdaki Admin Panelinden bir "Aktarım Paketi" oluşturursunuz. Bu işlem size şifreli veri dosyasını indirme linki ve bu dosyayı açmak için gerekli olan tek kullanımlık bir **Aktarım Kodu** ve **Şifreleme Anahtarı** verir.
2.  **İndir ve Taşı:** Oluşturulan şifreli dosyayı bilgisayarınıza indirir ve yeni sunucunuza yüklersiniz.
3.  **İçe Aktar (Import):** Yeni sunucunuzdaki Admin Panelinde, indirdiğiniz dosyayı ve size verilen anahtarı kullanarak verileri içe aktarırsınız.

![Veri Aktarım Akışı](https://raw.githubusercontent.com/sata2500/habernexus-nextjs/main/docs/assets/data-transfer-flow.png)  
*Not: Bu görsel temsilidir.* 

---

## 🚀 Adım Adım Kullanım

### 1. Verileri Dışa Aktarma (Eski Sunucu)

1.  Admin Paneline giriş yapın.
2.  Kenar çubuğundan **Veri Aktarımı** sayfasına gidin.
3.  "Veri Dışa Aktar" bölümünde, **Aktarım Paketi Oluştur** butonuna tıklayın.
4.  Sistem, veritabanını paketlerken kısa bir süre bekleyin.
5.  İşlem tamamlandığında, size özel olarak oluşturulmuş **Aktarım Kodu** ve **Şifreleme Anahtarı** ekranda görünecektir.

    > ⚠️ **ÇOK ÖNEMLİ:** Bu iki bilgiyi kopyalayıp güvenli bir yere kaydedin. Özellikle **Şifreleme Anahtarı** olmadan verilerinizi geri getiremezsiniz. Bu anahtar sunucuda saklanmaz.

6.  **Dosyayı İndir** butonuna tıklayarak `.enc` uzantılı şifreli veri paketinizi bilgisayarınıza indirin.

### 2. Verileri İçe Aktarma (Yeni Sunucu)

1.  Yeni sunucunuza HaberNexus'u kurun ve admin kullanıcısı ile giriş yapın.
2.  Admin Panelinde **Veri Aktarımı** sayfasına gidin.
3.  "Veri İçe Aktar" bölümünde, aşağıdaki bilgileri girin:
    *   **Aktarım Dosyası:** Eski sunucudan indirdiğiniz `.enc` uzantılı dosyayı seçin.
    *   **Şifreleme Anahtarı:** Dışa aktarma sırasında size verilen anahtarı yapıştırın.
4.  **Seçenekleri** yapılandırın:
    *   **Mevcut verileri temizle:** Bu seçeneği işaretlerseniz, yeni kurulumdaki tüm mevcut veriler (makaleler, kullanıcılar vb.) silinir ve sadece aktarılan veriler kullanılır. Temiz bir kurulum için bu seçeneği işaretlemeniz önerilir.
    *   **Kullanıcıları atla:** Eğer sadece içerikleri (makaleler, ayarlar vb.) aktarmak ve yeni sunucudaki mevcut kullanıcıları korumak istiyorsanız bu seçeneği işaretleyin.
5.  **Verileri İçe Aktar** butonuna tıklayın.
6.  Sistem verileri işlerken bekleyin. İşlem tamamlandığında bir başarı mesajı göreceksiniz.

---

## 🔐 Güvenlik

-   **Uçtan Uca Şifreleme:** Verileriniz, sunucudan ayrılmadan önce AES-256-GCM ile şifrelenir ve sadece sizin bildiğiniz anahtarla yeni sunucuda çözülebilir.
-   **Tek Kullanımlık Kod:** Her aktarım kodu sadece bir defa kullanılabilir.
-   **Zaman Sınırlaması:** Oluşturulan her aktarım paketi ve kodu 24 saat boyunca geçerlidir. Bu sürenin sonunda otomatik olarak geçersiz hale gelir.
-   **Bütünlük Kontrolü:** Veri paketinin yolda bozulmadığından emin olmak için bir `checksum` (sağlama toplamı) kullanılır.

---

## ❓ Sıkça Sorulan Sorular

**S: Şifreleme anahtarımı kaybettim. Ne yapabilirim?**  
A: Maalesef şifreleme anahtarı olmadan verileri geri getirmek imkansızdır. Bu anahtar güvenlik nedeniyle sunucuda saklanmaz. Yeni bir dışa aktarma işlemi başlatmanız gerekir.

**S: Aktarım ne kadar sürer?**  
A: Süre, veritabanınızın boyutuna bağlıdır. Genellikle birkaç saniye ile birkaç dakika arasında tamamlanır.

**S: Hangi veriler aktarılır?**  
A: Veritabanındaki **tüm** tablolar aktarılır. Buna kullanıcılar, makaleler, ayarlar, yorumlar, RSS kaynakları ve daha fazlası dahildir. Medya dosyaları (`public/uploads` klasörü) manuel olarak taşınmalıdır.

**S: Medya dosyalarımı (görseller) nasıl taşıyacağım?**  
A: Bu sistem şimdilik sadece veritabanını taşır. `public/uploads` klasörünüzdeki görselleri manuel olarak (örn: `scp` veya `rsync` komutları ile) eski sunucudan yeni sunucuya kopyalamanız gerekmektedir.
