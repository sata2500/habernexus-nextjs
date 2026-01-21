# Geliştirme Ortamı Kılavuzu

Bu proje, en son web teknolojileriyle (Next.js 16, React 19) inşa edilmiştir. Geliştirme sürecinin sorunsuz ve hatasız olması için aşağıdaki araçlar ve yapılandırmalar hazırlanmıştır.

## 🛠️ Önerilen VS Code Eklentileri

Proje `.vscode` klasöründe önerilen eklentilerle yapılandırılmıştır. VS Code'u açtığınızda sağ altta "Install Recommended Extensions" uyarısını göreceksiniz. "Install" diyerek hepsini yüklemenizi şiddetle öneririz:

*   **Error Lens:** Hataları kod satırının hemen yanında gösterir, terminale bakma ihtiyacını azaltır.
*   **ESLint & Prettier:** Kodunuzu otomatik olarak biçimlendirir ve hataları düzeltir.
*   **Tailwind CSS IntelliSense:** CSS sınıfları için otomatik tamamlama sağlar.
*   **Prisma:** Veritabanı şemaları için renklendirme ve tamamlama sağlar.
*   **Pretty TypeScript Errors:** Karışık TS hatalarını insan tarafından okunabilir hale getirir.

## ⚡️ Otomatik Biçimlendirme

Her kaydettiğinizde (`Ctrl+S` veya `Cmd+S`):
1.  Kodunuz **Prettier** ile standart formata getirilir.
2.  **ESLint** olası hataları ve kullanılmayan importları temizler.

Bu sayede kod stili hakkında endişelenmeden mantığa odaklanabilirsiniz.

## 📦 Sürüm Bilgileri

Projede kullanılan ana teknolojilerin sürümleri günceldir, bu nedenle dokümantasyon ararken bu sürümlere dikkat edin:

*   **Next.js:** v16.x (App Router)
*   **React:** v19.x
*   **Node.js:** v20.x veya üzeri önerilir.

## 🚀 Geliştirmeye Başlarken

1.  Bağımlılıkları yükleyin: `npm install`
2.  Geliştirme sunucusunu başlatın: `npm run dev`
3.  Tarayıcıda `http://localhost:3000` adresine gidin.

Herhangi bir sorun yaşarsanız `npm run lint` komutu ile projedeki tüm hataları tarayabilirsiniz.
