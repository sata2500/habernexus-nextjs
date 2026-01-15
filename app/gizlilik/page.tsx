import { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Lock, Eye, Database, Cookie, Mail, FileText, AlertCircle } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Gizlilik Politikası | HaberNexus',
  description: 'HaberNexus gizlilik politikası - Kişisel verilerinizin nasıl toplandığı, kullanıldığı ve korunduğu hakkında bilgi.',
}

const sections = [
  {
    icon: Database,
    title: 'Toplanan Veriler',
    content: `HaberNexus olarak, hizmetlerimizi sunabilmek için aşağıdaki verileri topluyoruz:

• **Hesap Bilgileri:** Google OAuth ile giriş yaptığınızda adınız, e-posta adresiniz ve profil fotoğrafınız.
• **Kullanım Verileri:** Ziyaret ettiğiniz sayfalar, okuma listenize eklediğiniz makaleler, tercihleriniz.
• **Teknik Veriler:** IP adresi, tarayıcı türü, cihaz bilgileri ve çerezler.
• **İletişim Verileri:** Bize gönderdiğiniz mesajlar ve geri bildirimler.`
  },
  {
    icon: Eye,
    title: 'Verilerin Kullanımı',
    content: `Topladığımız verileri şu amaçlarla kullanıyoruz:

• Hesabınızı oluşturmak ve yönetmek
• Kişiselleştirilmiş haber önerileri sunmak
• Okuma listenizi ve tercihlerinizi kaydetmek
• Hizmetlerimizi geliştirmek ve analiz etmek
• Güvenlik ve dolandırıcılık önleme
• Yasal yükümlülüklerimizi yerine getirmek`
  },
  {
    icon: Lock,
    title: 'Veri Güvenliği',
    content: `Verilerinizin güvenliği bizim için önceliktir:

• Tüm veriler şifreli bağlantılar (HTTPS) üzerinden iletilir
• Veritabanı erişimi yetkilendirilmiş sistemlerle sınırlıdır
• Düzenli güvenlik güncellemeleri ve denetimleri yapılır
• Hassas veriler endüstri standardı şifreleme ile korunur
• Minimum veri toplama prensibi uygulanır`
  },
  {
    icon: Cookie,
    title: 'Çerezler',
    content: `Sitemizde çerezler kullanılmaktadır:

• **Zorunlu Çerezler:** Oturum yönetimi ve güvenlik için gereklidir.
• **Tercih Çerezleri:** Tema tercihiniz (açık/koyu mod) gibi ayarlarınızı hatırlar.
• **Analitik Çerezler:** Site kullanımını anlamamıza yardımcı olur.

Tarayıcı ayarlarınızdan çerezleri yönetebilir veya devre dışı bırakabilirsiniz. Ancak bu, bazı özelliklerin düzgün çalışmamasına neden olabilir.`
  },
  {
    icon: FileText,
    title: 'Üçüncü Taraf Hizmetler',
    content: `Hizmetlerimizi sunmak için aşağıdaki üçüncü taraf hizmetleri kullanıyoruz:

• **Google OAuth:** Kimlik doğrulama için
• **Google Gemini AI:** İçerik analizi ve üretimi için

Bu hizmetlerin kendi gizlilik politikaları bulunmaktadır ve verilerinizi kendi politikalarına göre işleyebilirler.`
  },
  {
    icon: Shield,
    title: 'Haklarınız',
    content: `KVKK kapsamında aşağıdaki haklara sahipsiniz:

• Verilerinize erişim talep etme
• Verilerinizin düzeltilmesini isteme
• Verilerinizin silinmesini talep etme
• Veri işlemeye itiraz etme
• Veri taşınabilirliği talep etme

Bu haklarınızı kullanmak için bizimle iletişime geçebilirsiniz.`
  }
]

export default function PrivacyPage() {
  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="container mx-auto px-4 mb-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-6">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Gizlilik Politikası
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            {SITE_CONFIG.name} olarak gizliliğinize saygı duyuyor ve kişisel verilerinizi korumayı taahhüt ediyoruz.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
            Son güncelleme: 15 Ocak 2026
          </p>
        </div>
      </section>

      {/* Important Notice */}
      <section className="container mx-auto px-4 mb-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Önemli Bilgi
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Bu gizlilik politikası, {SITE_CONFIG.name} platformunu kullandığınızda kişisel verilerinizin 
                  nasıl toplandığını, kullanıldığını ve korunduğunu açıklar. Platformumuzu kullanarak bu 
                  politikayı kabul etmiş sayılırsınız.
                </p>
              </div>
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
                className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700"
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

          {/* Contact Section */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 text-center">
            <Mail className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">
              Sorularınız mı var?
            </h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Gizlilik politikamız hakkında sorularınız veya talepleriniz için bizimle iletişime geçebilirsiniz.
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
              href="/kullanim-kosullari"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Kullanım Koşulları →
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
