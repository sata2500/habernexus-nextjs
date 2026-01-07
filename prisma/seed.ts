import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Test kullanıcısı oluştur
  const testUser = await prisma.user.upsert({
    where: { email: 'test@habernexus.com' },
    update: {},
    create: {
      email: 'test@habernexus.com',
      name: 'HaberNexus AI',
      role: 'ADMIN',
    },
  })

  console.log('Created test user:', testUser.id)

  // Test makaleleri oluştur
  const articles = [
    {
      title: 'Yapay Zeka Teknolojisinde Yeni Bir Dönem: 2026 Yılının En Büyük Gelişmeleri',
      slug: 'yapay-zeka-teknolojisinde-yeni-bir-donem-2026',
      excerpt: 'Yapay zeka alanında yaşanan devrim niteliğindeki gelişmeler, teknoloji dünyasını yeniden şekillendiriyor.',
      content: `<p>Yapay zeka teknolojisi, 2026 yılında benzeri görülmemiş bir hızla gelişmeye devam ediyor. Büyük dil modelleri artık daha akıllı, daha hızlı ve daha verimli hale geldi.</p>
<h2>Öne Çıkan Gelişmeler</h2>
<p>Bu yıl, yapay zeka alanında birçok önemli gelişme yaşandı. Özellikle doğal dil işleme ve görüntü tanıma teknolojilerinde büyük ilerlemeler kaydedildi.</p>
<p>Şirketler, yapay zeka çözümlerini iş süreçlerine entegre etmek için yarışıyor. Bu durum, verimlilik artışı ve maliyet düşüşü sağlıyor.</p>`,
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60',
      category: 'Teknoloji',
      viewCount: 15420,
      authorId: testUser.id,
    },
    {
      title: 'Ekonomide Son Durum: Merkez Bankası Faiz Kararını Açıkladı',
      slug: 'ekonomide-son-durum-merkez-bankasi-faiz-karari',
      excerpt: 'Merkez Bankası, piyasaların merakla beklediği faiz kararını açıkladı. İşte detaylar...',
      content: `<p>Merkez Bankası Para Politikası Kurulu, bugün gerçekleştirdiği toplantıda faiz oranlarına ilişkin önemli kararlar aldı.</p>
<h2>Karar Detayları</h2>
<p>Kurul, enflasyon beklentilerini ve küresel ekonomik gelişmeleri değerlendirerek politika faizini belirledi.</p>
<p>Ekonomistler, bu kararın piyasalar üzerindeki etkisini yakından takip ediyor.</p>`,
      imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60',
      category: 'Ekonomi',
      viewCount: 12350,
      authorId: testUser.id,
    },
    {
      title: 'Bilim Dünyasından Heyecan Verici Keşif: Mars\'ta Su İzleri Bulundu',
      slug: 'bilim-dunyasindan-heyecan-verici-kesif-marsta-su-izleri',
      excerpt: 'NASA\'nın Mars keşif aracı, kızıl gezegende su izleri tespit etti. Bu keşif, yaşam arayışında önemli bir adım.',
      content: `<p>NASA'nın Perseverance keşif aracı, Mars yüzeyinde su izleri tespit etti. Bu keşif, bilim dünyasında büyük heyecan yarattı.</p>
<h2>Keşfin Önemi</h2>
<p>Su izlerinin bulunması, Mars'ta geçmişte yaşam olabileceğine dair önemli ipuçları sunuyor.</p>
<p>Bilim insanları, bu bulguları detaylı şekilde incelemeye devam ediyor.</p>`,
      imageUrl: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=800&auto=format&fit=crop&q=60',
      category: 'Bilim',
      viewCount: 11200,
      authorId: testUser.id,
    },
    {
      title: 'Süper Lig\'de Heyecan Dorukta: Şampiyonluk Yarışı Kızışıyor',
      slug: 'super-ligde-heyecan-dorukta-sampiyonluk-yarisi',
      excerpt: 'Süper Lig\'de şampiyonluk yarışı son haftalara girerken, takımlar arasındaki puan farkı giderek azalıyor.',
      content: `<p>Süper Lig'de şampiyonluk yarışı her geçen hafta daha da heyecanlı hale geliyor.</p>
<h2>Puan Durumu</h2>
<p>Lider takım ile takipçileri arasındaki puan farkı, son haftalarda iyice azaldı.</p>
<p>Taraftarlar, sezonun son haftalarını büyük bir heyecanla bekliyor.</p>`,
      imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=60',
      category: 'Spor',
      viewCount: 8920,
      authorId: testUser.id,
    },
    {
      title: 'Sağlıklı Yaşam İçin 10 Altın Kural',
      slug: 'saglikli-yasam-icin-10-altin-kural',
      excerpt: 'Uzmanlar, sağlıklı bir yaşam için uygulanması gereken temel kuralları açıkladı.',
      content: `<p>Sağlıklı bir yaşam sürmek için dikkat edilmesi gereken birçok önemli kural bulunuyor.</p>
<h2>Temel Kurallar</h2>
<p>Düzenli egzersiz, dengeli beslenme ve yeterli uyku, sağlıklı yaşamın temel taşlarıdır.</p>
<p>Uzmanlar, bu kurallara uyulması halinde yaşam kalitesinin önemli ölçüde artacağını belirtiyor.</p>`,
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=60',
      category: 'Sağlık',
      viewCount: 7650,
      authorId: testUser.id,
    },
    {
      title: 'Dünya Liderleri İklim Zirvesi\'nde Buluştu',
      slug: 'dunya-liderleri-iklim-zirvesinde-bulustu',
      excerpt: 'Küresel iklim değişikliğiyle mücadele için dünya liderleri bir araya geldi.',
      content: `<p>Dünya liderleri, iklim değişikliğiyle mücadele kapsamında önemli bir zirve gerçekleştirdi.</p>
<h2>Zirve Kararları</h2>
<p>Zirvede, karbon emisyonlarının azaltılması ve yenilenebilir enerji kaynaklarına geçiş konularında önemli kararlar alındı.</p>
<p>Liderler, ortak bir eylem planı üzerinde anlaştı.</p>`,
      imageUrl: 'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=800&auto=format&fit=crop&q=60',
      category: 'Dünya',
      viewCount: 9450,
      authorId: testUser.id,
    },
  ]

  for (const article of articles) {
    const created = await prisma.article.upsert({
      where: { slug: article.slug },
      update: {},
      create: article,
    })
    console.log('Created article:', created.title)
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
