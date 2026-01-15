import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SITE_CONFIG } from '@/lib/constants'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    // Build query
    const where = category ? { category } : {}

    // Fetch latest articles
    const articles = await prisma.article.findMany({
      where,
      take: 20,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        imageUrl: true,
        category: true,
        publishedAt: true,
        author: {
          select: {
            name: true,
          },
        },
      },
    })

    // Generate RSS XML
    const feedTitle = category 
      ? `${SITE_CONFIG.name} - ${category.charAt(0).toUpperCase() + category.slice(1)} Haberleri`
      : `${SITE_CONFIG.name} - Tüm Haberler`
    
    const feedDescription = category
      ? `${category.charAt(0).toUpperCase() + category.slice(1)} kategorisindeki en güncel haberler`
      : `${SITE_CONFIG.description} - En güncel haberler`

    const feedUrl = category
      ? `${SITE_CONFIG.url}/api/rss?category=${category}`
      : `${SITE_CONFIG.url}/api/rss`

    const rssItems = articles.map(article => {
      const articleUrl = `${SITE_CONFIG.url}/haber/${article.slug}`
      const pubDate = new Date(article.publishedAt).toUTCString()
      const description = article.excerpt || article.content.substring(0, 300) + '...'
      
      return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <description><![CDATA[${description}]]></description>
      <pubDate>${pubDate}</pubDate>
      <category>${article.category}</category>
      <author>${article.author.name || SITE_CONFIG.author}</author>
      ${article.imageUrl ? `<enclosure url="${article.imageUrl}" type="image/jpeg" />` : ''}
    </item>`
    }).join('')

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${feedTitle}</title>
    <link>${SITE_CONFIG.url}</link>
    <description>${feedDescription}</description>
    <language>tr-TR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_CONFIG.url}/logo.png</url>
      <title>${SITE_CONFIG.name}</title>
      <link>${SITE_CONFIG.url}</link>
    </image>
    <copyright>© ${new Date().getFullYear()} ${SITE_CONFIG.name}. Tüm hakları saklıdır.</copyright>
    <managingEditor>${SITE_CONFIG.email} (${SITE_CONFIG.author})</managingEditor>
    <webMaster>${SITE_CONFIG.email} (${SITE_CONFIG.author})</webMaster>
    <ttl>15</ttl>${rssItems}
  </channel>
</rss>`

    return new NextResponse(rss, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=900', // 15 minutes cache
      },
    })
  } catch (error) {
    console.error('RSS feed error:', error)
    return NextResponse.json(
      { error: 'RSS akışı oluşturulurken bir hata oluştu' },
      { status: 500 }
    )
  }
}
