import { MERMAID_SAFE_CONFIG, sanitizeMermaidSource } from './mermaid'

type MermaidThemeOptions = {
  theme?: string
  fontFamily?: string
  themeVariables?: Record<string, string>
}

export async function renderMermaidSource(source: string, id: string, options: MermaidThemeOptions = {}) {
  const clean = sanitizeMermaidSource(source)
  if (!clean) throw new Error('Mermaid source is empty')

  const { default: mermaid } = await import('mermaid')
  mermaid.initialize({
    ...MERMAID_SAFE_CONFIG,
    theme: options.theme || 'default',
    fontFamily: options.fontFamily,
    themeVariables: options.themeVariables,
    suppressErrorRendering: true
  })
  await mermaid.parse(clean, { suppressErrors: false })
  return mermaid.render(id, clean)
}
