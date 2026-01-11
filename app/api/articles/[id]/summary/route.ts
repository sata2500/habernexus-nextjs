import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GoogleGenAI } from '@google/genai'

// Initialize the Gemini client
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
})

const MODEL_NAME = 'gemini-2.0-flash'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/articles/[id]/summary
 * Generate AI summary for an article
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params

    // Get article from database
    const article = await prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        excerpt: true,
      },
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Makale bulunamadı' },
        { status: 404 }
      )
    }

    // Check if Gemini API is configured
    if (!process.env.GEMINI_API_KEY) {
      // Return excerpt as fallback
      return NextResponse.json({
        summary: article.excerpt || article.content.substring(0, 300) + '...',
        source: 'excerpt',
      })
    }

    // Generate AI summary
    const prompt = `Sen profesyonel bir haber editörüsün. Aşağıdaki haber makalesini okuyucular için kısa ve öz bir şekilde özetle.

BAŞLIK: ${article.title}

İÇERİK:
${article.content}

GÖREV:
- Makalenin ana noktalarını 3-4 maddede özetle
- Her madde 1-2 cümle olsun
- Tarafsız ve bilgilendirici ol
- Türkçe yaz

ÇIKTI FORMATI (JSON):
{
  "summary": "Genel özet (2-3 cümle)",
  "keyPoints": ["Madde 1", "Madde 2", "Madde 3"],
  "readingTime": "X dakika"
}`

    const response = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.5,
        topP: 0.9,
        maxOutputTokens: 512,
      },
    })

    const text = response.text || ''
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      // Return excerpt as fallback
      return NextResponse.json({
        summary: article.excerpt || article.content.substring(0, 300) + '...',
        keyPoints: [],
        source: 'excerpt',
      })
    }

    const result = JSON.parse(jsonMatch[0])
    
    return NextResponse.json({
      summary: result.summary || article.excerpt,
      keyPoints: result.keyPoints || [],
      readingTime: result.readingTime || '3 dakika',
      source: 'ai',
    })
  } catch (error) {
    console.error('AI Summary error:', error)
    return NextResponse.json(
      { error: 'Özet oluşturulurken bir hata oluştu' },
      { status: 500 }
    )
  }
}
