/**
 * RSS Feed Parser Service
 * Fetches and parses RSS/Atom feeds for content aggregation
 * 
 * @version 2.0.0
 * @lastUpdated 20 January 2026
 * 
 * Supports both RSS 2.0 and Atom feed formats
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
 * Fetch and parse an RSS/Atom feed
 */
export async function fetchRssFeed(url: string): Promise<RssFeed | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'HaberNexus/1.0 RSS Aggregator',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const xml = await response.text()
    
    // Detect feed type and parse accordingly
    if (xml.includes('<feed') && xml.includes('xmlns="http://www.w3.org/2005/Atom"')) {
      return parseAtomFeed(xml)
    } else {
      return parseRssFeed(xml)
    }
  } catch (error) {
    console.error(`Error fetching RSS feed from ${url}:`, error)
    return null
  }
}

/**
 * Parse Atom feed XML content
 */
function parseAtomFeed(xml: string): RssFeed {
  const getTagContent = (text: string, tag: string): string => {
    // Handle both <tag>content</tag> and <tag type="text">content</tag>
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

  const getAtomLink = (text: string): string => {
    // Get href from <link rel="alternate" href="..."/>
    const alternateMatch = text.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["'][^>]*\/?>/i)
    if (alternateMatch) return alternateMatch[1]
    
    // Fallback to any link with href
    const hrefMatch = text.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i)
    if (hrefMatch) return hrefMatch[1]
    
    return ''
  }

  const getImageUrl = (text: string): string => {
    // Try enclosure tag
    const enclosureMatch = text.match(/<enclosure[^>]*url=["']([^"']+)["'][^>]*\/?>/i)
    if (enclosureMatch) return enclosureMatch[1]
    
    // Try media:content
    const mediaMatch = text.match(/<media:content[^>]*url=["']([^"']+)["'][^>]*\/?>/i)
    if (mediaMatch) return mediaMatch[1]
    
    // Try to extract from content
    const content = getTagContent(text, 'content')
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i)
    if (imgMatch) return imgMatch[1]
    
    return ''
  }

  // Parse feed info
  const feed: RssFeed = {
    title: decodeHtmlEntities(getTagContent(xml, 'title')),
    description: decodeHtmlEntities(getTagContent(xml, 'subtitle') || getTagContent(xml, 'summary')),
    link: getAtomLink(xml),
    items: [],
  }

  // Parse entries
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi
  let entryMatch

  while ((entryMatch = entryRegex.exec(xml)) !== null) {
    const entryContent = entryMatch[1]
    
    const title = decodeHtmlEntities(getTagContent(entryContent, 'title'))
    const link = getAtomLink(entryContent)
    const summary = decodeHtmlEntities(stripHtml(getTagContent(entryContent, 'summary')))
    const content = decodeHtmlEntities(stripHtml(getTagContent(entryContent, 'content')))
    const pubDate = getTagContent(entryContent, 'published') || getTagContent(entryContent, 'updated')
    const imageUrl = getImageUrl(entryContent)

    if (title && link) {
      feed.items.push({
        title,
        link,
        description: summary || content?.substring(0, 300) || '',
        pubDate,
        content: content || summary,
        imageUrl,
      })
    }
  }

  console.log(`[RSS] Parsed Atom feed: ${feed.title} with ${feed.items.length} entries`)
  return feed
}

/**
 * Parse RSS 2.0 XML content
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
    title: decodeHtmlEntities(getTagContent(channelContent, 'title')),
    description: decodeHtmlEntities(getTagContent(channelContent, 'description')),
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

  console.log(`[RSS] Parsed RSS feed: ${feed.title} with ${feed.items.length} items`)
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
