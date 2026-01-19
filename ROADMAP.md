# HaberNexus Geliştirme Yol Haritası

**Son Güncelleme:** 18 Ocak 2026

Bu doküman, HaberNexus projesinin geçmiş başarılarını, mevcut durumunu ve gelecek vizyonunu içerir. Yol haritası, hem insan geliştiricilerin hem de AI ajanlarının katkılarını yönlendirmek için tasarlanmıştır ve projenin temel geliştirme protokollerine sıkı sıkıya bağlıdır.

## 🎯 Vizyon

HaberNexus'u, herkesin kendi akıllı, tam otomatik, kişiselleştirilmiş ve para kazanılabilir haber platformunu kolayca kurabileceği bir ekosisteme dönüştürmek.

---

## ✅ Tamamlanan Sürümler (v1.0 - v3.0)

Platform, v1'den v3'e kadar olan süreçte temel işlevselliğini, admin panelini ve topluluk özelliklerini başarıyla tamamlamıştır. Bu sürümlerde aşağıdaki temel yetenekler kazanılmıştır:

- **Tam Otomatik İçerik Motoru:** RSS kaynaklarından AI ile özgün içerik ve görsel üretimi.
- **Gelişmiş Admin Paneli:** Kullanıcı, makale, RSS ve ayar yönetimi.
- **Topluluk Özellikleri:** Kullanıcı profilleri, takip sistemi ve bildirimler.
- **Geliştirici Otomasyonu:** Otomatik CI/CD, sürüm yönetimi (semantic-release) ve wiki senkronizasyonu.

*Detaylı sürüm geçmişi için `CHANGELOG.md` dosyasına bakınız.*

---

## 🔮 Gelecek Vizyonu: v4.0 ve Ötesi

Proje, sağlam temelleri üzerine inşa edilecek yeni ve gelişmiş özelliklerle bir sonraki aşamaya geçmeye hazırdır. Gelecek sürümler, platformu bir içerik merkezinden, akıllı ve gelir üreten bir ekosisteme dönüştürmeye odaklanacaktır.

### v4.0: Gelişmiş AI ve İçerik Zekası

**Amaç:** Platformun AI yeteneklerini temel içerik üretiminin ötesine taşıyarak, içeriği daha akıllı, erişilebilir ve çeşitli hale getirmek.

| Durum | Özellik | Geliştirici Notu |
|---|---|---|
| ⬜ | **Çoklu Dil Desteği (i18n):** | Arayüzün ve AI tarafından üretilen içeriğin birden fazla dilde sunulması. Kullanıcı dil tercihine göre otomatik çeviri ve içerik sunumu. `next-intl` gibi modern kütüphaneler araştırılacak. |
| ⬜ | **Sesli Makale Okuma (Text-to-Speech):** | Makalelerin AI tarafından seslendirilmesi. Google Text-to-Speech veya benzeri bir API entegrasyonu. Kullanıcıya dinleme seçeneği sunulacak. |
| ⬜ | **Video İçerik Analizi ve Özetleme:** | RSS kaynaklarından gelen video linklerini (örn. YouTube) analiz edip, AI ile metin özetleri ve anahtar noktalar çıkarma. `Gemini 3` veya `Veo 3.1` gibi multimodal modellerin yetenekleri kullanılacak. |
| ⬜ | **Otomatik Etiketleme ve Konu Çıkarımı:** | Her makale için AI'ın otomatik olarak ilgili etiketler (tags) ve ana konular (topics) belirlemesi. Bu, içerik keşfini ve ilgili makale önerilerini iyileştirecek. |
| ⬜ | **Gelişmiş Arama (Vektör Tabanlı):** | Anlamsal (semantic) arama yeteneği eklenmesi. Kullanıcıların sadece anahtar kelimeyle değil, cümlelerle veya sorularla arama yapabilmesi. `pgvector` veya benzeri bir vektör veritabanı entegrasyonu araştırılacak. |

---

### v5.0: Monetizasyon ve Gelir Modelleri

**Amaç:** Platform sahiplerine, ürettikleri değerden gelir elde etme imkanı sunan, esnek ve yönetilebilir para kazanma araçları eklemek.

| Durum | Özellik | Geliştirici Notu |
|---|---|---|
| ⬜ | **Premium Abonelik Sistemi:** | Belirli içeriklere veya özelliklere (örn. reklamsız gezinme, özel analizler) sadece abone olan kullanıcıların erişebilmesi. `Stripe` veya `Lemon Squeezy` gibi ödeme altyapılarıyla entegrasyon. |
| ⬜ | **Yönetilebilir Reklam Alanları:** | Admin panelinden yönetilebilen dinamik reklam alanları (örn. ana sayfa, makale arası). Google AdSense veya özel reklam banner'ları için slotlar oluşturulacak. |
| ⬜ | **Sponsorlu İçerik Yönetimi:** | Adminlerin sponsorlu makaleleri kolayca işaretleyip yönetebileceği bir sistem. Bu makaleler özel bir etiketle gösterilecek. |
| ⬜ | **"Bana bir kahve ısmarla" Entegrasyonu:** | Kullanıcıların içerik üreticilerine (yazarlara veya platform sahibine) doğrudan bağış yapabilmesi için `Buy Me a Coffee` veya `Ko-fi` gibi platformların entegrasyonu. |
| ⬜ | **Ücretli Newsletter:** | Premium abonelere özel, derinlemesine analizler veya özel içerikler sunan ücretli bir bülten katmanı oluşturma. |

---

### v6.0: Ekosistem ve Altyapı Geliştirmeleri

**Amaç:** Platformun teknik temelini sağlamlaştırmak, geliştirici deneyimini iyileştirmek ve uzun vadeli sürdürülebilirliği garanti altına almak.

| Durum | Özellik | Geliştirici Notu |
|---|---|---|
| ⬜ | **Test Altyapısı Kurulumu:** | Projeye kapsamlı bir test süiti eklenmesi. `Jest` ve `React Testing Library` ile birim (unit) ve entegrasyon (integration) testleri yazılacak. CI pipeline'ına test adımı eklenecek. |
| ⬜ | **Gelişmiş Analitik ve Raporlama:** | Admin paneline daha detaylı analitikler eklenmesi: kullanıcı demografisi, içerik performansı, gelir takibi, AI kullanım istatistikleri. `Chart.js` veya benzeri bir kütüphane ile görselleştirmeler zenginleştirilecek. |
| ⬜ | **Mobil Uygulama (Capacitor/Tauri):** | Mevcut PWA'yı, native mobil özelliklere erişebilen (örn. push bildirimleri) bir mobil uygulamaya dönüştürmek için `Capacitor.js` veya `Tauri` gibi teknolojiler araştırılacak. |
| ⬜ | **Plugin/Eklenti Mimarisi:** | Üçüncü parti geliştiricilerin veya platform sahiplerinin kendi özelliklerini ekleyebileceği bir eklenti sistemi için altyapı oluşturulması. Bu, projenin ekosistemini genişletecektir. |
| ⬜ | **Veritabanı Optimizasyonu:** | Büyük veri setleri için performans iyileştirmeleri. Gerekli alanlara ek indeksler eklenmesi, yavaş sorguların tespiti ve optimize edilmesi. `pg_stat_statements` gibi araçlar kullanılabilir. |
| ✅ | **Veri Aktarım Sistemi:** | Admin paneli üzerinden tüm veritabanını şifreli bir paket olarak dışa aktarma ve başka bir kuruluma içe aktarma. Sunucu taşıma ve yedekleme işlemlerini basitleştirir. |

---

## 🔧 Teknik Borç ve Altyapı İyileştirmeleri

Bu özelliklerin yanı sıra, her sürümde teknik borcun azaltılması ve altyapının iyileştirilmesi için zaman ayrılacaktır.

- **Bağımlılıkların Güncellenmesi:** `npm outdated` komutu ile düzenli olarak bağımlılıklar kontrol edilecek ve güncellenecek. `Dependabot` otomasyonu kurulacak.
- **Kod Refaktoring:** `AI_DEVELOPMENT_GUIDE.md` prensiplerine uygun olarak, kod kalitesini artırmak ve karmaşıklığı azaltmak için sürekli refaktoring yapılacak.
- **Dokümantasyon Güncelliği:** Tüm AI ajanları, `DOCUMENTATION_PROTOCOL.md`'ye uygun olarak, ekledikleri her özellik için dokümantasyonu güncel tutmakla yükümlüdür.
- **CI/CD İyileştirmeleri:** Build ve deployment süreçlerini hızlandırmak için `Turbopack` gibi araçlar ve `GitHub Actions` cache mekanizmaları daha etkin kullanılacak.

---

## 🤝 Katkıda Bulunma

Bu yol haritası yaşayan bir belgedir. Katkıda bulunmak isteyen tüm insan ve AI geliştiriciler, `CONTRIBUTING.md` ve `AI_DEVELOPMENT_GUIDE.md` rehberlerini inceleyerek sürece dahil olabilirler. Yeni bir özellik üzerinde çalışmaya başlamadan önce GitHub'da bir `issue` açarak tartışma başlatmak, projenin tutarlılığı için kritik öneme sahiptir.
