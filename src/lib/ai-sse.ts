export type AiSseEvent = {
  event: string
  data: string
}

export function parseAiSseFrame(frame: string): AiSseEvent | null {
  let event = 'message'
  const dataLines: string[] = []

  for (const line of frame.split(/\r?\n/)) {
    if (!line || line.startsWith(':')) continue
    if (line.startsWith('event:')) {
      event = line.slice(6).trim()
      continue
    }
    if (line.startsWith('data:')) {
      const value = line.slice(5)
      dataLines.push(value.startsWith(' ') ? value.slice(1) : value)
    }
  }

  if (!dataLines.length) return null
  return { event, data: dataLines.join('\n') }
}

export function createAiSseParser() {
  let buffer = ''
  const decoder = new TextDecoder()

  function consume(chunk: Uint8Array, done = false) {
    buffer += decoder.decode(chunk, { stream: !done })
    const frames = buffer.split(/\r?\n\r?\n/)
    buffer = frames.pop() || ''

    const events = frames
      .map(parseAiSseFrame)
      .filter((event): event is AiSseEvent => Boolean(event))

    if (done && buffer.trim()) {
      const finalEvent = parseAiSseFrame(buffer)
      if (finalEvent) events.push(finalEvent)
      buffer = ''
    }

    return events
  }

  return {
    push(chunk: Uint8Array) {
      return consume(chunk)
    },
    finish() {
      return consume(new Uint8Array(), true)
    }
  }
}
