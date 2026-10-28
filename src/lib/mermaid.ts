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
