export type ParsedSseFrame = {
  event: string
  data: string
}

export function splitSseFrames(buffer: string) {
  const parts = buffer.split(/\r?\n\r?\n/)
  return {
    frames: parts.slice(0, -1),
    remainder: parts.at(-1) || ''
  }
}

export function parseSseFrame(frame: string): ParsedSseFrame | null {
  let event = ''
  const dataLines: string[] = []

  for (const line of frame.split(/\r?\n/)) {
    if (line.startsWith(':')) continue
    if (line.startsWith('event:')) event = line.slice(6).trim()
    if (line.startsWith('data:')) dataLines.push(line.slice(5).replace(/^\s/, ''))
  }

  if (!dataLines.length) return null
  return { event, data: dataLines.join('\n') }
}

export function parseSseJsonFrame(frame: string) {
  const parsed = parseSseFrame(frame)
  if (!parsed) return null
  return { ...parsed, payload: JSON.parse(parsed.data) as unknown }
}
