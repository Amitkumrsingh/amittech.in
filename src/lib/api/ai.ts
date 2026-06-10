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
  | 'system-diagram'

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

type AiImageResponse = {
  imageDataUrl?: string
  mimeType?: string
  prompt?: string
  text?: string
}

type AiDiagramNode = {
  id: string
  label: string
  type?: string
  group?: string
  description?: string
}

type AiDiagramEdge = {
  from: string
  to: string
  label?: string
}

export type AiDiagramResponse = {
  diagramTitle?: string
  summary?: string
  nodes: AiDiagramNode[]
  edges: AiDiagramEdge[]
  groups?: string[]
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
  'format-content': 'Format content for readability',
  'system-diagram': 'Generate system design diagram'
}

const AI_OUTPUT_TOKEN_BUDGET: Record<AiAction, number> = {
  'generate-draft': 8192,
  rewrite: 4096,
  seo: 2048,
  'title-ideas': 1600,
  tags: 1200,
  excerpt: 1200,
  'linkedin-post': 2400,
  'image-prompt': 1800,
  'format-content': 6144,
  'system-diagram': 4096
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

function buildDiagramPrompt(input: AiInput) {
  const keywords = normalizeKeywords(input.keywords)

  return `
You are a senior system design diagram assistant inside a private engineering blog CMS.
Read the article context and extract a clean architecture diagram that can be edited in Excalidraw.

Goal:
- Build a readable system design diagram from the written content.
- Prefer concrete components mentioned or strongly implied by the article.
- Do not invent companies, metrics, or unrelated infrastructure.
- If the article is conceptual, create a generic but useful architecture for that topic.

Diagram rules:
- 6 to 12 nodes.
- 7 to 16 directional edges.
- Every edge must have a short label like "HTTP", "event", "lookup", "write", "cache hit", "redirect".
- Use stable lowercase ids with hyphens.
- Group nodes into simple layers when useful: client, edge, services, data, async, observability.
- Keep labels short enough to fit in boxes.

Context:
- Topic: ${input.topic || input.title || 'Not provided'}
- Title: ${input.title || 'Not provided'}
- Category: ${input.category || 'Not provided'}
- Keywords: ${keywords || 'Not provided'}
- Notes: ${truncate(input.notes || '') || 'Not provided'}
- Excerpt: ${truncate(input.excerpt || '') || 'Not provided'}
- Article text: ${truncate(input.contentText || '', 9000) || 'Not provided'}
- HTML context: ${truncate(input.html || '', 4000) || 'Not provided'}

Return JSON only. No markdown fences. Shape:
{
  "diagramTitle": "Short diagram title",
  "summary": "One sentence explaining the diagram",
  "groups": ["client", "edge", "services", "data"],
  "nodes": [
    { "id": "client", "label": "Client", "type": "client", "group": "client", "description": "Who starts the flow" }
  ],
  "edges": [
    { "from": "client", "to": "api-gateway", "label": "HTTP request" }
  ],
  "notes": ["Any assumption or missing detail"]
}
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
    const parsed = JSON.parse(cleaned)
    if (typeof parsed === 'string') return parseGeminiJson(parsed)
    return parsed as AiStructuredResponse
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (!match) return parsePartialGeminiJson(cleaned) || { plainText: cleaned }
    try {
      const parsed = JSON.parse(match[0])
      if (typeof parsed === 'string') return parseGeminiJson(parsed)
      return parsed as AiStructuredResponse
    } catch {
      return parsePartialGeminiJson(cleaned) || { plainText: cleaned }
    }
  }
}

function parsePartialGeminiJson(text: string): AiStructuredResponse | null {
  const trimmed = stripJsonFence(text)
  if (!trimmed.startsWith('{')) return null

  const result: AiStructuredResponse = {}
  result.title = extractJsonStringField(trimmed, 'title')
  result.excerpt = extractJsonStringField(trimmed, 'excerpt')
  result.plainText = extractJsonStringField(trimmed, 'plainText')
  result.markdown = extractJsonStringField(trimmed, 'markdown')
  result.metaTitle = extractJsonStringField(trimmed, 'metaTitle')
  result.metaDescription = extractJsonStringField(trimmed, 'metaDescription')
  result.coverImagePrompt = extractJsonStringField(trimmed, 'coverImagePrompt')
  result.imageAltText = extractJsonStringField(trimmed, 'imageAltText')
  result.linkedinPost = extractJsonStringField(trimmed, 'linkedinPost')
  result.summary = extractJsonStringField(trimmed, 'summary')
  result.tags = extractJsonStringArrayField(trimmed, 'tags')
  result.titleIdeas = extractJsonStringArrayField(trimmed, 'titleIdeas')
  result.socialSnippets = extractJsonStringArrayField(trimmed, 'socialSnippets')
  result.notes = extractJsonStringArrayField(trimmed, 'notes')
  result.content = extractJsonContentBlocks(trimmed)

  const hasUsefulContent = Object.entries(result).some(([, value]) => Array.isArray(value) ? value.length > 0 : Boolean(value))
  return hasUsefulContent ? result : null
}

function extractJsonStringField(text: string, field: keyof AiStructuredResponse) {
  const match = text.match(new RegExp(`"${field}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`))
  if (!match) return undefined
  try {
    return JSON.parse(`"${match[1]}"`) as string
  } catch {
    return match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n')
  }
}

function extractJsonStringArrayField(text: string, field: keyof AiStructuredResponse) {
  const value = extractBalancedJsonValue(text, String(field), '[', ']')
  if (!value) return undefined
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : undefined
  } catch {
    const matches = Array.from(value.matchAll(/"((?:\\.|[^"\\])*)"/g))
    return matches.map(match => {
      try {
        return JSON.parse(`"${match[1]}"`) as string
      } catch {
        return match[1]
      }
    }).filter(Boolean)
  }
}

function extractJsonContentBlocks(text: string): AiBlock[] | undefined {
  const contentValue = extractBalancedJsonValue(text, 'content', '[', ']') || extractUnclosedJsonArray(text, 'content')
  if (!contentValue) return undefined

  try {
    const parsed = JSON.parse(contentValue)
    if (Array.isArray(parsed)) return parsed.filter(isAiBlock).slice(0, 40)
  } catch {
    // Fall through to per-object recovery for truncated JSON.
  }

  const blocks = extractCompleteJsonObjects(contentValue)
    .map(block => {
      try {
        return JSON.parse(block)
      } catch {
        return null
      }
    })
    .filter(isAiBlock)

  return blocks.length ? blocks.slice(0, 40) : undefined
}

function extractBalancedJsonValue(text: string, field: string, open: '[' | '{', close: ']' | '}') {
  const fieldIndex = text.indexOf(`"${field}"`)
  if (fieldIndex === -1) return undefined
  const valueStart = text.indexOf(open, fieldIndex)
  if (valueStart === -1) return undefined

  let depth = 0
  let inString = false
  let escaped = false

  for (let index = valueStart; index < text.length; index += 1) {
    const char = text[index]
    if (escaped) {
      escaped = false
      continue
    }
    if (char === '\\') {
      escaped = true
      continue
    }
    if (char === '"') {
      inString = !inString
      continue
    }
    if (inString) continue
    if (char === open) depth += 1
    if (char === close) depth -= 1
    if (depth === 0) return text.slice(valueStart, index + 1)
  }

  return undefined
}

function extractUnclosedJsonArray(text: string, field: string) {
  const fieldIndex = text.indexOf(`"${field}"`)
  if (fieldIndex === -1) return undefined
  const valueStart = text.indexOf('[', fieldIndex)
  if (valueStart === -1) return undefined
  return text.slice(valueStart)
}

function extractCompleteJsonObjects(text: string) {
  const objects: string[] = []
  let start = -1
  let depth = 0
  let inString = false
  let escaped = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    if (escaped) {
      escaped = false
      continue
    }
    if (char === '\\') {
      escaped = true
      continue
    }
    if (char === '"') {
      inString = !inString
      continue
    }
    if (inString) continue

    if (char === '{') {
      if (depth === 0) start = index
      depth += 1
    }
    if (char === '}') {
      depth -= 1
      if (depth === 0 && start !== -1) {
        objects.push(text.slice(start, index + 1))
        start = -1
      }
    }
  }

  return objects
}

function isAiBlock(value: unknown): value is AiBlock {
  if (!value || typeof value !== 'object') return false
  const block = value as AiBlock
  return ['heading', 'paragraph', 'blockquote', 'code', 'list'].includes(block.type)
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

function normalizeDiagramResponse(value: unknown): AiDiagramResponse {
  const source = value && typeof value === 'object' ? value as Partial<AiDiagramResponse> : {}
  const nodes = Array.isArray(source.nodes)
    ? source.nodes
        .map((node, index) => ({
          id: normalizeDiagramId(node?.id || node?.label || `node-${index + 1}`),
          label: String(node?.label || node?.id || `Node ${index + 1}`).slice(0, 42),
          type: node?.type ? String(node.type).slice(0, 32) : undefined,
          group: node?.group ? String(node.group).slice(0, 32) : undefined,
          description: node?.description ? String(node.description).slice(0, 140) : undefined
        }))
        .filter(node => node.id && node.label)
        .slice(0, 14)
    : []

  const nodeIds = new Set(nodes.map(node => node.id))
  const edges = Array.isArray(source.edges)
    ? source.edges
        .map(edge => ({
          from: normalizeDiagramId(edge?.from || ''),
          to: normalizeDiagramId(edge?.to || ''),
          label: edge?.label ? String(edge.label).slice(0, 38) : undefined
        }))
        .filter(edge => edge.from && edge.to && edge.from !== edge.to && nodeIds.has(edge.from) && nodeIds.has(edge.to))
        .slice(0, 20)
    : []

  return {
    diagramTitle: source.diagramTitle ? String(source.diagramTitle).slice(0, 120) : 'System design diagram',
    summary: source.summary ? String(source.summary).slice(0, 260) : undefined,
    groups: Array.isArray(source.groups) ? source.groups.map(group => String(group).slice(0, 32)).filter(Boolean).slice(0, 8) : undefined,
    nodes,
    edges,
    notes: Array.isArray(source.notes) ? source.notes.map(note => String(note).slice(0, 180)).filter(Boolean).slice(0, 6) : undefined
  }
}

function normalizeDiagramId(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

async function callGemini(prompt: string, action: AiAction): Promise<AiStructuredResponse> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new ApiError(501, 'Gemini API is not configured. Set GEMINI_API_KEY.', 'AI_NOT_CONFIGURED')

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.72,
        topP: 0.9,
        maxOutputTokens: AI_OUTPUT_TOKEN_BUDGET[action],
        responseMimeType: 'application/json'
      }
    })
  })

  if (!response.ok) {
    const providerError = await response.json().catch(() => null) as { error?: { message?: string; status?: string } } | null
    const providerMessage = providerError?.error?.message || ''
    const providerStatus = providerError?.error?.status || ''

    if (response.status === 400 && /model/i.test(providerMessage)) {
      throw new ApiError(502, `Gemini model is not available. Set GEMINI_MODEL to an available model such as gemini-2.5-flash.`, 'AI_MODEL_UNAVAILABLE')
    }
    if (response.status === 400 || response.status === 403) {
      throw new ApiError(502, 'Gemini rejected the request. Check the API key, model, and project access.', 'AI_PROVIDER_CONFIG_ERROR')
    }
    if (response.status === 429 || /quota|rate/i.test(`${providerStatus} ${providerMessage}`)) {
      throw new ApiError(429, 'Gemini quota or rate limit reached. Please try again later.', 'AI_PROVIDER_RATE_LIMIT')
    }

    throw new ApiError(response.status >= 500 ? 502 : response.status, 'AI generation failed. Please try again.', 'AI_PROVIDER_ERROR')
  }

  const payload = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const text = payload.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('\n').trim()
  if (!text) throw new ApiError(502, 'AI returned an empty response. Please try again.', 'AI_EMPTY_RESPONSE')

  return normalizeAiResponse(parseGeminiJson(text))
}

async function callGeminiImage(prompt: string): Promise<AiImageResponse> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new ApiError(501, 'Gemini API is not configured. Set GEMINI_API_KEY.', 'AI_NOT_CONFIGURED')

  const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image'
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Generate a blog cover image for this engineering article. No text in the image. Use this prompt:\n\n${truncate(prompt, 1400)}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 1024
      }
    })
  })

  if (!response.ok) {
    if (response.status === 429) throw new ApiError(429, 'Gemini image quota or rate limit reached. Please try again later.', 'AI_PROVIDER_RATE_LIMIT')
    throw new ApiError(502, 'Image generation is not available for this Gemini key/model.', 'AI_IMAGE_UNAVAILABLE')
  }

  const payload = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string; inlineData?: { mimeType?: string; data?: string } }> } }>
  }
  const parts = payload.candidates?.[0]?.content?.parts || []
  const image = parts.find(part => part.inlineData?.data)?.inlineData
  const text = parts.map(part => part.text).filter(Boolean).join('\n').trim()

  if (!image?.data) {
    return { prompt, text: text || 'Gemini did not return an image. Use the prompt instead.' }
  }

  return {
    prompt,
    mimeType: image.mimeType || 'image/png',
    imageDataUrl: `data:${image.mimeType || 'image/png'};base64,${image.data}`,
    text
  }
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

    const result = await callGemini(buildPrompt(action, input), action)
    logAiUsage(action, user, input)

    return ok(res, {
      action,
      generatedAt: new Date().toISOString(),
      result
    })
  })
}

export function createAiImageRoute() {
  return withApiErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

    const user = await requireUser(req)
    const input = aiGenerateSchema.parse(req.body)

    await assertCanUseAiForPost(input, user)
    checkAiRateLimit(user)

    const prompt = input.notes || input.topic || input.title || input.contentText || 'Premium dark engineering blog cover image'
    const result = await callGeminiImage(prompt)
    logAiUsage('image-prompt', user, input)

    return ok(res, {
      action: 'generate-image',
      generatedAt: new Date().toISOString(),
      result
    })
  })
}

export function createAiDiagramRoute() {
  return withApiErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

    const user = await requireUser(req)
    const input = aiGenerateSchema.parse(req.body)

    await assertCanUseAiForPost(input, user)
    checkAiRateLimit(user)

    const result = normalizeDiagramResponse(await callGemini(buildDiagramPrompt(input), 'system-diagram'))
    logAiUsage('system-diagram', user, input)

    return ok(res, {
      action: 'system-diagram',
      generatedAt: new Date().toISOString(),
      result
    })
  })
}
