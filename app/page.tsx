export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          🚀 HaberNexus
        </h1>
        <p className="text-xl text-center mb-4">
          AI Destekli Haber Platformu
        </p>
        <div className="bg-gray-100 p-6 rounded-lg mt-8">
          <h2 className="text-2xl font-semibold mb-4">✅ Kurulum Başarılı!</h2>
          <p className="mb-2">
            Next.js temel yapısı başarıyla oluşturuldu. Proje şu anda çalışıyor.
          </p>
          <p className="text-sm text-gray-600 mt-4">
            <strong>Sonraki Adım:</strong> v1.0 MVP özelliklerinin geliştirilmesi
          </p>
        </div>
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Versiyon: 0.1.0 (Temel Kurulum)</p>
          <p>Durum: Geliştirme Aşamasında</p>
        </div>
      </div>
    </main>
  )
}
