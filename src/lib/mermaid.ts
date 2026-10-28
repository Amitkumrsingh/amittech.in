export const MERMAID_SAFE_CONFIG = {
  startOnLoad: false,
  securityLevel: 'strict' as const,
  suppressErrorRendering: true
}

export function sanitizeMermaidSource(value: string) {
  return value
    .replace(/^\s*%%\{[\s\S]*?\}\%%\s*/gm, '')
    .split('\n')
    .filter(line => !/^\s*(click|href)\b/i.test(line) && !/(?:javascript:|<script)/i.test(line))
    .join('\n')
    .replace(/^```(?:mermaid)?/i, '')
    .replace(/```$/i, '')
    .trim()
}

const mermaidHeader = /^(?:flowchart|graph|sequenceDiagram)\b/i
const flowStatement = /^(?:subgraph\b|end\b|direction\b|classDef\b|class\b|style\b|linkStyle\b|[A-Za-z][\w-]*\s*(?:\[[^\n]*\]|\{[^\n]*\}|\(\([^\n]*\)\)|\([^\n]*\)))/i
const flowEdge = /(?:-->|---|-.->|==>|--\|[^|]+\|-->)/
const sequenceStatement = /^(?:participant|actor|activate|deactivate|autonumber|title|note|loop|alt|else|opt|par|and|critical|break|rect|end|box|\s*[A-Za-z][\w-]*\s*(?:-[-.]*>>?|<<[-.]*-|--?>|->)\s*[A-Za-z][\w-]*\s*:)/i

/**
 * Gemini occasionally appends an explanation after an otherwise valid diagram.
 * Keep the Mermaid header and contiguous Mermaid statements, discarding any
 * trailing prose before the source is cached or shown to the editor.
 */
export function extractMermaidSource(value: string) {
  const clean = sanitizeMermaidSource(value)
  const lines = clean.split(/\r?\n/)
  const headerIndex = lines.findIndex(line => mermaidHeader.test(line.trim()))
  if (headerIndex < 0) return clean

  const header = lines[headerIndex].trim()
  const isSequence = /^sequenceDiagram\b/i.test(header)
  const output: string[] = [header]
  let sawStatement = false
  let blankLines = 0

  for (const rawLine of lines.slice(headerIndex + 1)) {
    const line = rawLine.trim()
    if (!line) {
      if (sawStatement) blankLines += 1
      continue
    }

    const safeComment = line.startsWith('%%') && !line.startsWith('%%{')
    const matches = safeComment || (isSequence ? sequenceStatement.test(line) : flowStatement.test(line) || flowEdge.test(line))
    if (!matches) break

    if (blankLines) {
      output.push('')
      blankLines = 0
    }
    output.push(line)
    sawStatement = true
  }

  return output.join('\n').trim()
}
