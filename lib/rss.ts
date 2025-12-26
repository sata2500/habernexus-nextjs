/**
 * RSS Feed Parser Service
 * Fetches and parses RSS feeds for content aggregation
 */

export interface RssItem {
  title: string
  link: string
  description: string
  pubDate: string
  content?: string
  imageUrl?: string
}

export interface RssFeed {
  title: string
  description: string
  link: string
  items: RssItem[]
}

/**
 * Fetch and parse an RSS feed
 */
export async function fetchRssFeed(url: string): Promise<RssFeed | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'HaberNexus/1.0 RSS Aggregator',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const xml = await response.text()
    return parseRssFeed(xml)
  } catch (error) {
    console.error(`Error fetching RSS feed from ${url}:`, error)
    return null
  }
}

/**
 * Parse RSS XML content
 */
function parseRssFeed(xml: string): RssFeed {
  // Simple XML parsing without external dependencies
  const getTagContent = (text: string, tag: string): string => {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
    const match = text.match(regex)
    if (!match) return ''
    
    // Handle CDATA
    let content = match[1]
    const cdataMatch = content.match(/<!\[CDATA\[([\s\S]*?)\]\]>/)
    if (cdataMatch) {
      content = cdataMatch[1]
    }
    
    return content.trim()
  }

  const getTagAttribute = (text: string, tag: string, attr: string): string => {
    const regex = new RegExp(`<${tag}[^>]*${attr}=["']([^"']*)["'][^>]*>`, 'i')
    const match = text.match(regex)
    return match ? match[1] : ''
  }

  // Parse channel info
  const channelMatch = xml.match(/<channel>([\s\S]*?)<\/channel>/i)
  const channelContent = channelMatch ? channelMatch[1] : xml

  const feed: RssFeed = {
    title: getTagContent(channelContent, 'title'),
    description: getTagContent(channelContent, 'description'),
    link: getTagContent(channelContent, 'link'),
    items: [],
  }

  // Parse items
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi
  let itemMatch
  
  while ((itemMatch = itemRegex.exec(xml)) !== null) {
    const itemContent = itemMatch[1]
    
    // Try to find image URL from various sources
    let imageUrl = getTagAttribute(itemContent, 'media:content', 'url')
    if (!imageUrl) {
      imageUrl = getTagAttribute(itemContent, 'enclosure', 'url')
    }
    if (!imageUrl) {
      // Try to extract from content
      const imgMatch = itemContent.match(/<img[^>]+src=["']([^"']+)["']/i)
      if (imgMatch) {
        imageUrl = imgMatch[1]
      }
    }

    const item: RssItem = {
      title: decodeHtmlEntities(getTagContent(itemContent, 'title')),
      link: getTagContent(itemContent, 'link'),
      description: decodeHtmlEntities(stripHtml(getTagContent(itemContent, 'description'))),
      pubDate: getTagContent(itemContent, 'pubDate'),
      content: decodeHtmlEntities(stripHtml(
        getTagContent(itemContent, 'content:encoded') || 
        getTagContent(itemContent, 'description')
      )),
      imageUrl,
    }

    if (item.title && item.link) {
      feed.items.push(item)
    }
  }

  return feed
}

/**
 * Strip HTML tags from content
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Decode HTML entities
 */
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&#8217;': "'",
    '&#8216;': "'",
    '&#8220;': '"',
    '&#8221;': '"',
    '&#8211;': '–',
    '&#8212;': '—',
  }

  let result = text
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replace(new RegExp(entity, 'g'), char)
  }

  // Decode numeric entities
  result = result.replace(/&#(\d+);/g, (_, code) => 
    String.fromCharCode(parseInt(code, 10))
  )

  return result
}

/**
 * Validate RSS feed URL
 */
export function isValidRssUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}
