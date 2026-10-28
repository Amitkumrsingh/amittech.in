import assert from 'node:assert/strict'
import test from 'node:test'
import { extractMermaidSource, sanitizeMermaidSource } from '../../src/lib/mermaid.ts'
import { parseSseFrame, parseSseJsonFrame, splitSseFrames } from '../../src/lib/sse.ts'

test('SSE frames survive arbitrary boundaries and Unicode payloads', () => {
  const input = 'event: delta\ndata: {"text":"नमस्ते"}\n\nevent: complete\ndata: {"text":"done"}\n\npartial'
  const first = splitSseFrames(input.slice(0, 63))
  const second = splitSseFrames(first.remainder + input.slice(63))

  assert.equal(first.frames.length, 1)
  assert.equal(second.frames.length, 1)
  assert.equal(second.remainder, 'partial')
  assert.deepEqual(parseSseJsonFrame(first.frames[0]), {
    event: 'delta',
    data: '{"text":"नमस्ते"}',
    payload: { text: 'नमस्ते' }
  })
  assert.deepEqual(parseSseJsonFrame(second.frames[0]), {
    event: 'complete',
    data: '{"text":"done"}',
    payload: { text: 'done' }
  })
})

test('SSE heartbeat comments are ignored and multiline data is preserved', () => {
  assert.equal(parseSseFrame(': keep-alive\n\n'), null)
  assert.deepEqual(parseSseFrame('event: complete\ndata: {"a":\ndata: 1}'), {
    event: 'complete',
    data: '{"a":\n1}'
  })
})

test('Gemini SSE payloads are parsed as complete frames', () => {
  const frame = [
    'event: message',
    'data: {"candidates":[{"content":',
    'data: {"parts":[{"text":"first"},{"text":" second"}]}}]}'
  ].join('\n')
  const parsed = parseSseJsonFrame(frame)
  assert.deepEqual(parsed?.payload, { candidates: [{ content: { parts: [{ text: 'first' }, { text: ' second' }] } }] })
  assert.equal(parseSseFrame('data: [DONE]')?.data, '[DONE]')
})

test('Mermaid source extraction removes trailing prose and unsafe directives', () => {
  const source = extractMermaidSource('```mermaid\nsequenceDiagram\nparticipant Web UI\nAuthor->>Web UI: Submit Draft\n```\nThis explanation must not be cached.')
  assert.equal(source, 'sequenceDiagram\nparticipant Web UI\nAuthor->>Web UI: Submit Draft')
  assert.equal(sanitizeMermaidSource('graph TD\nA-->B\nclick A "javascript:alert(1)"'), 'graph TD\nA-->B')
})

