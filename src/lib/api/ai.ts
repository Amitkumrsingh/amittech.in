import type { NextApiRequest, NextApiResponse } from 'next'
import type { z } from 'zod'
import { canManageResource, requireUser, type AuthenticatedUser } from './auth'
import { ApiError, methodNotAllowed, ok, withApiErrorHandling } from './http'
import { prisma } from './prisma'
import { aiGenerateSchema } from './schemas'

export type AiAction =
  | 'generate-draft'
  | 'rewrite'
  | 'seo'
  | 'title-ideas'
  | 'tags'
  | 'excerpt'
  | 'linkedin-post'
  | 'image-prompt'
  | 'format-content'

type AiInput = z.infer<typeof aiGenerateSchema>

type AiBlock = {
  type: 'heading' | 'paragraph' | 'blockquote' | 'code' | 'list'
  level?: 1 | 2 | 3 | 4
  text?: string
  items?: string[]
}

export type AiStructuredResponse = {
  title?: string
  excerpt?: string
  content?: AiBlock[]
  markdown?: string
  plainText?: string
  tags?: string[]
  titleIdeas?: string[]
  metaTitle?: string
  metaDescription?: string
  coverImagePrompt?: string
  imageAltText?: string
  linkedinPost?: string
  socialSnippets?: string[]
  summary?: string
  notes?: string[]
}

type RateBucket = {
  date: string
  count: number
}

const aiRateBuckets = new Map<string, RateBucket>()

const ACTION_LABELS: Record<AiAction, string> = {
  'generate-draft': 'Generate blog draft',
  rewrite: 'Rewrite selected text',
  seo: 'Generate SEO metadata',
  'title-ideas': 'Generate title ideas',
  tags: 'Generate tags',
  excerpt: 'Generate excerpt',
  'linkedin-post': 'Generate LinkedIn post',
  'image-prompt': 'Generate cover image prompt',
  'format-content': 'Format content for readability'
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function normalizeKeywords(input: AiInput['keywords']) {
  if (Array.isArray(input)) return input.join(', ')
  return input || ''
}

function truncate(value = '', max = 6000) {
  return value.length > max ? `${value.slice(0, max)}\n[truncated]` : value
}

async function assertCanUseAiForPost(input: AiInput, user: AuthenticatedUser) {
  if (!input.postId) return

  const post = await prisma.post.findUnique({
    where: { id: input.postId },
    select: { authorId: true, deletedAt: true }
  })

  if (!post || post.deletedAt) throw new ApiError(404, 'Post not found', 'POST_NOT_FOUND')
  if (!canManageResource(user, post.authorId)) throw new ApiError(403, 'Cannot use AI on this post', 'AI_POST_FORBIDDEN')
}

function checkAiRateLimit(user: AuthenticatedUser) {
  const dailyLimit = user.role === 'SUPER_ADMIN'
    ? Number(process.env.AI_DAILY_LIMIT_ADMIN || 200)
    : Number(process.env.AI_DAILY_LIMIT_USER || 20)
  const key = `${user.id}:${todayKey()}`
  const bucket = aiRateBuckets.get(key) || { date: todayKey(), count: 0 }

  if (bucket.count >= dailyLimit) {
    throw new ApiError(429, "You have reached today's AI generation limit.", 'AI_DAILY_LIMIT_REACHED')
  }

  bucket.count += 1
  aiRateBuckets.set(key, bucket)
}

function buildPrompt(action: AiAction, input: AiInput) {
  const actionLabel = ACTION_LABELS[action]
  const keywords = normalizeKeywords(input.keywords)

  return `
You are an AI writing assistant inside a private engineering blog CMS.
You only help draft editable content. Never publish, never claim final authority, and never invent incidents, metrics, companies, outages, or personal stories.

Writing style:
- Human sounding, practical, experience-backed senior engineer tone.
- Simple but not shallow.
- Opinionated where useful.
- No corporate jargon, textbook tone, inflated claims, or obvious AI phrases.
- Prefer real-world tradeoffs and production engineering notes.

Task: ${actionLabel}

Context:
- Topic: ${input.topic || input.title || 'Not provided'}
- Title: ${input.title || 'Not provided'}
- Category: ${input.category || 'Not provided'}
- Target audience: ${input.targetAudience || 'Backend/platform engineers'}
- Tone: ${input.tone || 'Practical, direct, senior engineer'}
- Desired length: ${input.desiredLength || 'Medium'}
- Keywords: ${keywords || 'Not provided'}
- Notes: ${truncate(input.notes || '') || 'Not provided'}
- Selected text: ${truncate(input.selectedText || '') || 'Not provided'}
- Excerpt: ${truncate(input.excerpt || '') || 'Not provided'}
- Article text: ${truncate(input.contentText || '') || 'Not provided'}
- HTML context: ${truncate(input.html || '', 3000) || 'Not provided'}
- Visual style: ${input.visualStyle || 'Premium dark engineering visual'}
- Color palette: ${input.colorPalette || 'cyan, slate, white, subtle accent'}

Return JSON only. No markdown fences. Use this shape when useful:
{
  "title": "string",
  "excerpt": "string",
  "content": [
    { "type": "heading", "level": 2, "text": "string" },
    { "type": "paragraph", "text": "string" },
    { "type": "list", "items": ["string"] }
  ],
  "plainText": "string",
  "markdown": "string",
  "tags": ["string"],
  "titleIdeas": ["string"],
  "metaTitle": "string",
  "metaDescription": "string",
  "coverImagePrompt": "string",
  "imageAltText": "string",
  "linkedinPost": "string",
  "socialSnippets": ["string"],
  "summary": "string",
  "notes": ["string"]
}

Action-specific guidance:
- generate-draft: include title, excerpt, content blocks, tags, metaTitle, metaDescription, coverImagePrompt.
- rewrite / format-content: focus on selectedText when provided, otherwise article text. Return content blocks and plainText.
- seo: return metaTitle, metaDescription, tags, excerpt.
- title-ideas: return 8 titleIdeas.
- tags: return 6-10 concise tags.
- excerpt: return one excerpt under 240 characters.
- linkedin-post: return linkedinPost and socialSnippets.
- image-prompt: return coverImagePrompt and imageAltText. Do not generate image binary.
`.trim()
}

function stripJsonFence(value: string) {
  return value
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim()
}

function parseGeminiJson(text: string): AiStructuredResponse {
  const cleaned = stripJsonFence(text)
  try {
    return JSON.parse(cleaned) as AiStructuredResponse
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (!match) return { plainText: cleaned }
    try {
      return JSON.parse(match[0]) as AiStructuredResponse
    } catch {
      return { plainText: cleaned }
    }
  }
}

function normalizeAiResponse(value: AiStructuredResponse): AiStructuredResponse {
  return {
    ...value,
    title: value.title?.slice(0, 180),
    excerpt: value.excerpt?.slice(0, 320),
    metaTitle: value.metaTitle?.slice(0, 80),
    metaDescription: value.metaDescription?.slice(0, 180),
    tags: value.tags?.map(tag => tag.trim()).filter(Boolean).slice(0, 12),
    titleIdeas: value.titleIdeas?.map(title => title.trim()).filter(Boolean).slice(0, 10),
    socialSnippets: value.socialSnippets?.slice(0, 5),
    notes: value.notes?.slice(0, 8),
    content: value.content?.slice(0, 40)
  }
}

async function callGemini(prompt: string): Promise<AiStructuredResponse> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new ApiError(501, 'Gemini API is not configured. Set GEMINI_API_KEY.', 'AI_NOT_CONFIGURED')

  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.72,
        topP: 0.9,
        maxOutputTokens: 2400,
        responseMimeType: 'application/json'
      }
    })
  })

  if (!response.ok) {
    throw new ApiError(response.status >= 500 ? 502 : response.status, 'AI generation failed. Please try again.', 'AI_PROVIDER_ERROR')
  }

  const payload = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const text = payload.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('\n').trim()
  if (!text) throw new ApiError(502, 'AI returned an empty response. Please try again.', 'AI_EMPTY_RESPONSE')

  return normalizeAiResponse(parseGeminiJson(text))
}

function logAiUsage(action: AiAction, user: AuthenticatedUser, input: AiInput) {
  // Keep usage metadata lightweight; do not store prompts or generated content.
  // eslint-disable-next-line no-console
  console.info('[ai-usage]', {
    action,
    userId: user.id,
    role: user.role,
    postId: input.postId || null,
    hasSelectedText: Boolean(input.selectedText),
    hasNotes: Boolean(input.notes)
  })
}

export function createAiRoute(action: AiAction) {
  return withApiErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

    const user = await requireUser(req)
    const input = aiGenerateSchema.parse(req.body)

    await assertCanUseAiForPost(input, user)
    checkAiRateLimit(user)

    const result = await callGemini(buildPrompt(action, input))
    logAiUsage(action, user, input)

    return ok(res, {
      action,
      generatedAt: new Date().toISOString(),
      result
    })
  })
}
