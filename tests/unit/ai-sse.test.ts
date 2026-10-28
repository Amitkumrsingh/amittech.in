import assert from 'node:assert/strict'
import test from 'node:test'
import { createAiSseParser, parseAiSseFrame } from '../../src/lib/ai-sse.ts'

test('parses event frames with comments and multiple data lines', () => {
  assert.deepEqual(parseAiSseFrame(': keep-alive\nevent: delta\ndata: first\ndata: second'), {
    event: 'delta',
    data: 'first\nsecond'
  })
  assert.equal(parseAiSseFrame(': keep-alive'), null)
})

test('reassembles arbitrary byte chunks without splitting Unicode', () => {
  const source = 'event: delta\ndata: {"text":"नमस्ते 🌍"}\n\n'
  const bytes = new TextEncoder().encode(source)
  const parser = createAiSseParser()
  const events = []

  for (let index = 0; index < bytes.length; index += 1) {
    events.push(...parser.push(bytes.slice(index, index + 1)))
  }
  events.push(...parser.finish())

  assert.deepEqual(events, [{ event: 'delta', data: '{"text":"नमस्ते 🌍"}' }])
})

test('flushes a final frame without a trailing blank line', () => {
  const parser = createAiSseParser()
  const bytes = new TextEncoder().encode('event: complete\ndata: {"ok":true}')
  assert.deepEqual(parser.push(bytes), [])
  assert.deepEqual(parser.finish(), [{ event: 'complete', data: '{"ok":true}' }])
})
