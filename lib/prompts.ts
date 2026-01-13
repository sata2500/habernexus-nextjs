import { prisma } from '@/lib/prisma'
import { PromptType } from '@prisma/client'

/**
 * Prompt Management Service
 * Handles AI prompt templates for content and image generation
 * 
 * @version 2.0.0
 * @lastUpdated 13 January 2026
 */

/**
 * Default prompt templates
 * These are used as fallbacks and for initial seeding
 */
export const DEFAULT_PROMPTS = {
  CONTENT: {
    name: 'content_generation',
    displayName: 'İçerik Üretim Promptu',
    description: 'RSS kaynaklarından gelen haberleri özgün içeriğe dönüştürmek için kullanılır',
    type: 'CONTENT' as PromptType,
    template: `Sen profesyonel bir haber editörüsün. Aşağıdaki haber kaynağını kullanarak özgün, SEO dostu ve okuyucu için değerli bir Türkçe haber makalesi oluştur.

KAYNAK BAŞLIK: {{title}}

KAYNAK İÇERİK: {{content}}

KATEGORİ: {{category}}

GÖREV:
1. Özgün ve dikkat çekici bir başlık yaz (maksimum 80 karakter)
2. Makale içeriğini yaz (minimum 300 kelime, maksimum 800 kelime)
3. Kısa bir özet yaz (maksimum 160 karakter, SEO meta description için)
4. URL-friendly bir slug oluştur (Türkçe karakterler olmadan, tire ile ayrılmış)

KURALLAR:
- İçerik %100 özgün olmalı, kaynak metni birebir kopyalama
- Tarafsız ve profesyonel bir dil kullan
- Gerçeklere dayalı bilgi ver, spekülasyon yapma
- Okuyucuya değer katan, bilgilendirici bir içerik oluştur

ÇIKTI FORMATI (JSON):
{
  "title": "Başlık burada",
  "content": "Makale içeriği burada (paragraflar \\n\\n ile ayrılmış)",
  "excerpt": "Kısa özet burada",
  "slug": "url-friendly-slug-burada"
}`,
    variables: JSON.stringify(['title', 'content', 'category']),
    isDefault: true,
  },
  IMAGE: {
    name: 'image_generation',
    displayName: 'Görsel Üretim Promptu',
    description: 'Haberler için AI ile görsel üretmek için kullanılır',
    type: 'IMAGE' as PromptType,
    template: `An ultra-realistic, dynamic, and emotionally resonant photograph capturing the essence of a news story.

Subject: "{{title}}"
Category: {{category}}

Scene Description:
{{style}}. The scene is rich with authentic details, conveying a powerful narrative. If people are present, their expressions and actions are natural and meaningful, reflecting the core of the news story. The environment is highly detailed and contextually appropriate.

Composition & Framing:
Masterful composition, using the rule of thirds. A compelling medium shot or a wide shot that establishes the scene. The main subject is in sharp focus, with a natural depth of field that draws the viewer's eye.

Lighting:
Dramatic and natural lighting that enhances the mood. Could be the soft glow of golden hour, the crisp light of a modern office, or the dynamic lighting of a live event. Avoid flat or artificial lighting.

Atmosphere & Mood:
The image should evoke a specific emotion relevant to the story: urgency, hope, innovation, tension, or contemplation. The overall tone is professional, suitable for a leading news publication.

Technical Details:
Shot on a Sony a7R V with a G Master lens (e.g., 50mm f/1.2 or 24-70mm f/2.8). 16:9 aspect ratio. Hyper-detailed, sharp, and clear.

Negative Prompt:
--no text, no logos, no watermarks, blurry, oversaturated, ugly, deformed, disfigured, poor details, bad hands, extra limbs, extra fingers.`,
    variables: JSON.stringify(['title', 'category', 'style']),
    isDefault: true,
  },
  SENTIMENT: {
    name: 'sentiment_analysis',
    displayName: 'Duygu Analizi Promptu',
    description: 'Haberlerin duygusal tonunu analiz etmek için kullanılır',
    type: 'SENTIMENT' as PromptType,
    template: `Sen bir duygu analizi uzmanısın. Aşağıdaki haber başlığı ve içeriğini analiz ederek haberin genel duygusal tonunu belirle.

BAŞLIK: {{title}}

İÇERİK: {{content}}

GÖREV:
1. Haberin genel duygusal tonunu belirle (POSITIVE, NEGATIVE veya NEUTRAL)
2. Güven skorunu belirle (0-1 arası, 1 en yüksek güven)
3. Kısa bir açıklama yaz (maksimum 100 karakter)

KRİTERLER:
- POSITIVE: İyi haberler, başarılar, olumlu gelişmeler, umut verici konular
- NEGATIVE: Kötü haberler, sorunlar, olumsuz gelişmeler, endişe verici konular
- NEUTRAL: Tarafsız haberler, bilgilendirici içerik, olgu aktarımı

ÇIKTI FORMATI (JSON):
{
  "sentiment": "POSITIVE" | "NEGATIVE" | "NEUTRAL",
  "score": 0.85,
  "summary": "Kısa açıklama"
}`,
    variables: JSON.stringify(['title', 'content']),
    isDefault: true,
  },
  CATEGORY: {
    name: 'category_determination',
    displayName: 'Kategori Belirleme Promptu',
    description: 'Haberlerin kategorisini otomatik belirlemek için kullanılır',
    type: 'CATEGORY' as PromptType,
    template: `Aşağıdaki haber başlığı ve içeriğine göre en uygun kategoriyi seç.

BAŞLIK: {{title}}

İÇERİK: {{content}}

KATEGORİLER: {{categories}}

Sadece kategori adını yaz, başka bir şey ekleme.`,
    variables: JSON.stringify(['title', 'content', 'categories']),
    isDefault: true,
  },
  SUMMARY: {
    name: 'summary_generation',
    displayName: 'Özet Oluşturma Promptu',
    description: 'Haber özetleri oluşturmak için kullanılır',
    type: 'SUMMARY' as PromptType,
    template: `Aşağıdaki haber makalesinin kısa bir özetini yaz (maksimum 2-3 cümle, 160 karakter):

{{content}}

Sadece özeti yaz, başka bir şey ekleme.`,
    variables: JSON.stringify(['content']),
    isDefault: true,
  },
}

/**
 * Category-specific image styles
 */
export const CATEGORY_IMAGE_STYLES: Record<string, string> = {
  'Teknoloji': 'A sleek, modern environment with glowing data visualizations and innovative gadgets. People interacting with futuristic interfaces. Clean lines, blue and silver tones, a sense of progress and innovation.',
  'Ekonomi': 'A bustling stock exchange floor with blurred screens in the background, or a sharp, professional corporate meeting. Focus on charts, financial data, and business professionals in action. Mood can be tense or optimistic.',
  'Spor': 'A high-energy, dynamic action shot of athletes in motion. Dramatic lighting, motion blur, and a focus on the intensity of the competition. The crowd is a blurred, energetic backdrop.',
  'Sağlık': 'A clean, bright, and modern medical laboratory or a serene wellness scene. Focus on scientific research, healthy lifestyles, or compassionate healthcare professionals. Colors are typically white, green, and blue.',
  'Bilim': 'A sense of discovery and wonder. Could be a researcher in a high-tech lab, a stunning view of a nebula from a telescope, or a microscopic image. Lighting is often dramatic and focused.',
  'Dünya': 'A powerful and culturally rich photograph representing a global event. Could be a cityscape, a natural landscape, or a portrait of a person that tells a story. Authentic and journalistic in style.',
  'Kültür-Sanat': 'Vibrant, creative, and expressive. An artist in their studio, a dramatic scene from a theater performance, or a colorful abstract representation of a cultural theme. Rich textures and bold colors.',
  'Gündem': 'A classic, impactful journalistic photo. Captures a key moment of a current event. Often features people and conveys a sense of immediacy and importance. Black and white can be used for dramatic effect.',
}

/**
 * Get a prompt template by type
 * Returns the active default prompt for the given type
 */
export async function getPromptByType(type: PromptType): Promise<string> {
  try {
    const prompt = await prisma.promptTemplate.findFirst({
      where: {
        type,
        isActive: true,
        isDefault: true,
      },
    })

    if (prompt) {
      return prompt.template
    }

    // Fallback to hardcoded defaults
    const defaultPrompt = DEFAULT_PROMPTS[type]
    return defaultPrompt?.template || ''
  } catch (error) {
    console.error(`[Prompts] Error getting prompt for type ${type}:`, error)
    return DEFAULT_PROMPTS[type]?.template || ''
  }
}

/**
 * Get a prompt template by name
 */
export async function getPromptByName(name: string): Promise<string | null> {
  try {
    const prompt = await prisma.promptTemplate.findUnique({
      where: { name },
    })

    return prompt?.template || null
  } catch (error) {
    console.error(`[Prompts] Error getting prompt ${name}:`, error)
    return null
  }
}

/**
 * Get all prompt templates
 */
export async function getAllPrompts() {
  try {
    return await prisma.promptTemplate.findMany({
      orderBy: [
        { type: 'asc' },
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    })
  } catch (error) {
    console.error('[Prompts] Error getting all prompts:', error)
    return []
  }
}

/**
 * Update a prompt template
 */
export async function updatePrompt(
  id: string,
  data: {
    template?: string
    displayName?: string
    description?: string
    isActive?: boolean
    isDefault?: boolean
  }
) {
  try {
    // If setting as default, unset other defaults of same type
    if (data.isDefault) {
      const prompt = await prisma.promptTemplate.findUnique({
        where: { id },
        select: { type: true },
      })

      if (prompt) {
        await prisma.promptTemplate.updateMany({
          where: {
            type: prompt.type,
            isDefault: true,
            id: { not: id },
          },
          data: { isDefault: false },
        })
      }
    }

    return await prisma.promptTemplate.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    })
  } catch (error) {
    console.error(`[Prompts] Error updating prompt ${id}:`, error)
    throw error
  }
}

/**
 * Create a new prompt template
 */
export async function createPrompt(data: {
  name: string
  displayName: string
  description?: string
  type: PromptType
  template: string
  variables: string[]
  isDefault?: boolean
}) {
  try {
    // If setting as default, unset other defaults of same type
    if (data.isDefault) {
      await prisma.promptTemplate.updateMany({
        where: {
          type: data.type,
          isDefault: true,
        },
        data: { isDefault: false },
      })
    }

    return await prisma.promptTemplate.create({
      data: {
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        type: data.type,
        template: data.template,
        variables: JSON.stringify(data.variables),
        isDefault: data.isDefault || false,
        isActive: true,
      },
    })
  } catch (error) {
    console.error('[Prompts] Error creating prompt:', error)
    throw error
  }
}

/**
 * Delete a prompt template
 * Cannot delete default prompts
 */
export async function deletePrompt(id: string) {
  try {
    const prompt = await prisma.promptTemplate.findUnique({
      where: { id },
    })

    if (prompt?.isDefault) {
      throw new Error('Cannot delete default prompt template')
    }

    return await prisma.promptTemplate.delete({
      where: { id },
    })
  } catch (error) {
    console.error(`[Prompts] Error deleting prompt ${id}:`, error)
    throw error
  }
}

/**
 * Seed default prompts into database
 * Only creates prompts that don't already exist
 */
export async function seedDefaultPrompts() {
  try {
    const results = []

    for (const [, promptData] of Object.entries(DEFAULT_PROMPTS)) {
      const existing = await prisma.promptTemplate.findUnique({
        where: { name: promptData.name },
      })

      if (!existing) {
        await prisma.promptTemplate.create({
          data: promptData,
        })
        results.push({ name: promptData.name, status: 'created' })
        console.log(`[Prompts] Created default prompt: ${promptData.name}`)
      } else {
        results.push({ name: promptData.name, status: 'exists' })
      }
    }

    return results
  } catch (error) {
    console.error('[Prompts] Error seeding default prompts:', error)
    throw error
  }
}

/**
 * Replace variables in a prompt template
 */
export function interpolatePrompt(
  template: string,
  variables: Record<string, string>
): string {
  let result = template

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    result = result.replace(regex, value)
  }

  return result
}

/**
 * Get image style for a category
 */
export function getImageStyleForCategory(category: string): string {
  return CATEGORY_IMAGE_STYLES[category] || CATEGORY_IMAGE_STYLES['Gündem']
}

/**
 * Validate prompt template variables
 */
export function validatePromptVariables(
  template: string,
  requiredVariables: string[]
): { valid: boolean; missing: string[] } {
  const missing: string[] = []

  for (const variable of requiredVariables) {
    if (!template.includes(`{{${variable}}}`)) {
      missing.push(variable)
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  }
}
