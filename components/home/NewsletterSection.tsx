'use client'

import { useState } from 'react'
import { Mail, CheckCircle, Loader2 } from 'lucide-react'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    // Simüle edilmiş API çağrısı
    setTimeout(() => {
      setStatus('success')
      setMessage('Bültenimize başarıyla abone oldunuz!')
      setEmail('')
    }, 1000)
  }

  return (
    <section className="py-16 bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6">
            <Mail className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Güncel Kalın
          </h2>
          
          <p className="text-lg text-blue-100 mb-8">
            En önemli haberleri her gün e-posta kutunuza gönderelim. 
            Spam yok, sadece değerli içerikler.
          </p>

          {status === 'success' ? (
            <div className="flex items-center justify-center space-x-2 text-white bg-white/10 rounded-xl p-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <span>{message}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta adresiniz"
                required
                className="flex-1 px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Abone Ol'
                )}
              </button>
            </form>
          )}

          <p className="text-sm text-blue-200 mt-4">
            Abone olarak{' '}
            <a href="/gizlilik" className="underline hover:text-white">
              Gizlilik Politikamızı
            </a>{' '}
            kabul etmiş olursunuz.
          </p>
        </div>
      </div>
    </section>
  )
}
