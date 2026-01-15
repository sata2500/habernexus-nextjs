import { Metadata } from 'next'
import Link from 'next/link'
import { FileText, CheckCircle, XCircle, AlertTriangle, Scale, Users, Shield, Mail } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Kullanım Koşulları | HaberNexus',
  description: 'HaberNexus kullanım koşulları - Platform kullanım kuralları, sorumluluklar ve yasal bilgiler.',
}

const sections = [
  {
    icon: FileText,
    title: '1. Genel Hükümler',
    content: `Bu kullanım koşulları, ${SITE_CONFIG.name} platformunu ("Platform") kullanımınızı düzenler. Platformu kullanarak bu koşulları kabul etmiş sayılırsınız.

${SITE_CONFIG.name}, yapay zeka destekli bir haber agregasyon platformudur. İçerikler çeşitli RSS kaynaklarından toplanmakta ve AI teknolojisi ile işlenmektedir.

Bu koşulları kabul etmiyorsanız, lütfen platformu kullanmayınız.`
  },
  {
    icon: Users,
    title: '2. Kullanıcı Hesapları',
    content: `**Hesap Oluşturma:**
• Platform, Google OAuth ile giriş yapmanıza olanak tanır
• Hesap oluşturarak doğru ve güncel bilgiler sağlamayı kabul edersiniz
• Hesabınızın güvenliğinden siz sorumlusunuz

**Hesap Türleri:**
• **Kullanıcı:** Temel okuma ve etkileşim özellikleri
• **Yazar:** İçerik oluşturma yetkisi (admin onayı gerekir)
• **Admin:** Tam yönetim yetkisi

**Hesap Askıya Alma:**
Platform, bu koşulları ihlal eden hesapları uyarı olmaksızın askıya alabilir veya silebilir.`
  },
  {
    icon: CheckCircle,
    title: '3. Kabul Edilen Kullanımlar',
    content: `Platformu aşağıdaki amaçlarla kullanabilirsiniz:

• Haberleri okumak ve takip etmek
• Okuma listesi oluşturmak ve yönetmek
• Makalelere yorum yapmak ve etkileşimde bulunmak
• İçerikleri sosyal medyada paylaşmak
• Kişisel tercihlerinizi özelleştirmek
• Bültene abone olmak
• Geri bildirim ve önerilerde bulunmak`
  },
  {
    icon: XCircle,
    title: '4. Yasaklanan Kullanımlar',
    content: `Aşağıdaki davranışlar kesinlikle yasaktır:

• Spam, zararlı yazılım veya kötü amaçlı içerik paylaşmak
• Başkalarının hesaplarına yetkisiz erişim sağlamaya çalışmak
• Platformun güvenliğini tehlikeye atacak eylemler
• Otomatik botlar veya scraper kullanmak (izinsiz)
• Telif hakkı ihlali içeren içerik paylaşmak
• Nefret söylemi, taciz veya tehdit içeren yorumlar
• Yanlış veya yanıltıcı bilgi yaymak
• Platformun normal işleyişini engellemek`
  },
  {
    icon: AlertTriangle,
    title: '5. İçerik ve Sorumluluk',
    content: `**AI Üretilen İçerik:**
Platformdaki içeriklerin bir kısmı yapay zeka tarafından üretilmektedir. Bu içerikler bilgilendirme amaçlıdır ve kesin doğruluk garantisi verilmez.

**Kaynak İçerikler:**
Haberler çeşitli RSS kaynaklarından toplanmaktadır. Orijinal içeriklerin sorumluluğu kaynak sitelere aittir.

**Kullanıcı Yorumları:**
Kullanıcılar tarafından yapılan yorumların sorumluluğu yorumu yapan kullanıcıya aittir. Platform, uygunsuz içerikleri kaldırma hakkını saklı tutar.

**Sorumluluk Reddi:**
Platform, içeriklerin doğruluğu, güncelliği veya eksiksizliği konusunda garanti vermez. İçerikler "olduğu gibi" sunulmaktadır.`
  },
  {
    icon: Scale,
    title: '6. Fikri Mülkiyet',
    content: `**Platform Hakları:**
${SITE_CONFIG.name} platformunun tasarımı, logosu, yazılımı ve özgün içerikleri telif hakkı ile korunmaktadır.

**Açık Kaynak:**
Platform açık kaynak kodlu olup MIT lisansı altında dağıtılmaktadır. Kaynak kodu GitHub üzerinden erişilebilir.

**Kullanıcı İçerikleri:**
Platformda paylaştığınız yorumlar ve içerikler üzerindeki haklarınız size aittir. Ancak platformda yayınlayarak, bu içeriklerin platformda gösterilmesine izin vermiş olursunuz.`
  },
  {
    icon: Shield,
    title: '7. Gizlilik ve Güvenlik',
    content: `Kişisel verilerinizin toplanması, kullanılması ve korunması hakkında detaylı bilgi için Gizlilik Politikamızı inceleyiniz.

**Güvenlik Önlemleri:**
• HTTPS şifreleme
• Güvenli kimlik doğrulama
• Düzenli güvenlik güncellemeleri

**Veri İhlali:**
Olası bir veri ihlali durumunda, etkilenen kullanıcılar yasal süreler içinde bilgilendirilecektir.`
  }
]

export default function TermsPage() {
  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="container mx-auto px-4 mb-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-6">
            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Kullanım Koşulları
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            {SITE_CONFIG.name} platformunu kullanmadan önce lütfen bu koşulları dikkatlice okuyunuz.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
            Son güncelleme: 15 Ocak 2026
          </p>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="container mx-auto px-4 mb-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">İçindekiler</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sections.map((section, index) => (
                <a
                  key={index}
                  href={`#section-${index + 1}`}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {section.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon
            return (
              <div 
                key={index}
                id={`section-${index + 1}`}
                className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 scroll-mt-24"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {section.title}
                  </h2>
                </div>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  {section.content.split('\n\n').map((paragraph, pIndex) => (
                    <p key={pIndex} className="text-gray-600 dark:text-gray-400 whitespace-pre-line mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Additional Terms */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              8. Değişiklikler ve Güncellemeler
            </h2>
            <div className="text-gray-600 dark:text-gray-400 space-y-4">
              <p>
                {SITE_CONFIG.name}, bu kullanım koşullarını herhangi bir zamanda değiştirme hakkını saklı tutar. 
                Önemli değişiklikler yapıldığında, platformda veya e-posta yoluyla bildirim yapılacaktır.
              </p>
              <p>
                Değişikliklerden sonra platformu kullanmaya devam etmeniz, güncellenmiş koşulları kabul 
                ettiğiniz anlamına gelir.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              9. Uygulanacak Hukuk
            </h2>
            <div className="text-gray-600 dark:text-gray-400 space-y-4">
              <p>
                Bu kullanım koşulları Türkiye Cumhuriyeti yasalarına tabidir. Herhangi bir uyuşmazlık 
                durumunda Türkiye mahkemeleri yetkilidir.
              </p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 text-center">
            <Mail className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">
              Sorularınız mı var?
            </h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Kullanım koşulları hakkında sorularınız için bizimle iletişime geçebilirsiniz.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/iletisim"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <Mail className="w-5 h-5 mr-2" />
                İletişime Geç
              </Link>
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="inline-flex items-center px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                {SITE_CONFIG.email}
              </a>
            </div>
          </div>

          {/* Related Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link
              href="/gizlilik"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Gizlilik Politikası →
            </Link>
            <span className="hidden sm:inline text-gray-400">|</span>
            <Link
              href="/hakkimizda"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Hakkımızda →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
