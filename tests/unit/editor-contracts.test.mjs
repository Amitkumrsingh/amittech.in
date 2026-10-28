import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const editorSource = fs.readFileSync(new URL('../../src/components/RichTextEditor.tsx', import.meta.url), 'utf8')

test('editor uses the inline streaming AI workflow', () => {
  assert.match(editorSource, /fetch\('\/api\/ai\/stream'/)
  assert.match(editorSource, /function InlineAiBlock\(/)
  assert.match(editorSource, /Inline AI writing assistant/)
  assert.match(editorSource, /type <code>\/ai<\/code>/)
  assert.match(editorSource, /<code>\/generate<\/code>/)
})

test('editor exposes Mermaid preview and code review without the legacy image drawer', () => {
  assert.match(editorSource, /function LiveMermaidPreview\(/)
  assert.match(editorSource, /function MermaidBlockView\(/)
  assert.match(editorSource, /Repair with AI/)
  assert.doesNotMatch(editorSource, /function AiAssistantDrawer\(/)
  assert.doesNotMatch(editorSource, /\/api\/ai\/generate-image/)
  assert.doesNotMatch(editorSource, /Generate a cover image preview/)
})
