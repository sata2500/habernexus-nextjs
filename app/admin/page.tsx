import { 
  Newspaper, 
  Users, 
  Eye, 
  TrendingUp,
  Rss,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

// Demo istatistikler
const stats = [
  { name: 'Toplam Makale', value: '1,234', change: '+12%', changeType: 'positive', icon: Newspaper },
  { name: 'Toplam Kullanıcı', value: '5,678', change: '+8%', changeType: 'positive', icon: Users },
  { name: 'Günlük Görüntülenme', value: '45,678', change: '+23%', changeType: 'positive', icon: Eye },
  { name: 'Aktif RSS Kaynağı', value: '24', change: '+2', changeType: 'positive', icon: Rss },
]

const recentArticles = [
  { id: 1, title: 'Yapay Zeka Teknolojisinde Yeni Bir Dönem', category: 'Teknoloji', status: 'published', views: 15420, date: '26 Ara 2025' },
  { id: 2, title: 'Ekonomide Son Durum: Merkez Bankası Faiz Kararı', category: 'Ekonomi', status: 'published', views: 12350, date: '25 Ara 2025' },
  { id: 3, title: 'Süper Lig\'de Şampiyonluk Yarışı', category: 'Spor', status: 'draft', views: 0, date: '25 Ara 2025' },
  { id: 4, title: 'Mars\'ta Su İzleri Bulundu', category: 'Bilim', status: 'published', views: 11200, date: '24 Ara 2025' },
  { id: 5, title: 'İklim Zirvesi\'nde Tarihi Anlaşma', category: 'Dünya', status: 'published', views: 9450, date: '23 Ara 2025' },
]

const systemStatus = [
  { name: 'AI İçerik Motoru', status: 'active', lastRun: '5 dakika önce' },
  { name: 'RSS Tarayıcı', status: 'active', lastRun: '10 dakika önce' },
  { name: 'Görsel Üretici', status: 'active', lastRun: '15 dakika önce' },
  { name: 'Veritabanı Yedekleme', status: 'scheduled', lastRun: '6 saat önce' },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          HaberNexus yönetim paneline hoş geldiniz
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.name}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.name}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Articles */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Son Makaleler</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentArticles.map((article) => (
              <div key={article.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {article.title}
                    </p>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-xs text-gray-500">{article.category}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{article.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center text-xs text-gray-500">
                      <Eye className="w-3 h-3 mr-1" />
                      {article.views.toLocaleString('tr-TR')}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      article.status === 'published' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {article.status === 'published' ? 'Yayında' : 'Taslak'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <a href="/admin/makaleler" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Tüm makaleleri görüntüle →
            </a>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sistem Durumu</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {systemStatus.map((item) => (
              <div key={item.name} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {item.status === 'active' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : item.status === 'scheduled' ? (
                      <Clock className="w-5 h-5 text-blue-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.lastRun}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    item.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : item.status === 'scheduled'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {item.status === 'active' ? 'Aktif' : item.status === 'scheduled' ? 'Planlandı' : 'Bekliyor'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
            <Newspaper className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Yeni Makale</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors">
            <Rss className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">RSS Ekle</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors">
            <Users className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Kullanıcı Ekle</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors">
            <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">AI Çalıştır</span>
          </button>
        </div>
      </div>
    </div>
  )
}
