"use client"

import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import dynamic from 'next/dynamic'
import { Extension, Node, mergeAttributes, type Editor } from '@tiptap/core'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import { EditorContent, NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer, useEditor, type ReactNodeViewProps } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  CheckSquare,
  Code2,
  Columns3,
  Eraser,
  Eye,
  FileCode2,
  Focus,
  Highlighter,
  ImagePlus,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Link2,
  List,
  ListOrdered,
  Maximize2,
  Minus,
  Pilcrow,
  Plus,
  Quote,
  Redo2,
  RefreshCw,
  Save,
  Sparkles,
  Strikethrough,
  Table2,
  Underline as UnderlineIcon,
  Undo2,
  Upload,
  WandSparkles,
  Workflow,
  X,
  type LucideIcon
} from 'lucide-react'
import { createPortal } from 'react-dom'
import { cn } from '../lib/classes'
import { sanitizeMermaidSource } from '../lib/mermaid'
import { renderMermaidSource } from '../lib/mermaid-client'
import { parseSseJsonFrame, splitSseFrames } from '../lib/sse'
import MicroButton from './MicroButton'
import type { AppState, BinaryFiles, ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import type { ExcalidrawElement, NonDeleted } from '@excalidraw/excalidraw/element/types'

const ExcalidrawCanvas = dynamic(async () => (await import('@excalidraw/excalidraw')).Excalidraw, {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center bg-white text-sm font-semibold text-slate-500">Loading Excalidraw...</div>
})

type RichTextEditorProps = {
  value: string
  onChange: (html: string) => void
  onUploadImage?: (file: File) => Promise<string>
  onSave?: () => Promise<void> | void
  autoSaveKey?: string
  documentTitle?: string
  postId?: string
  aiUserId?: string
  aiContext?: {
    title?: string
    excerpt?: string
    category?: string
    tags?: string
  }
  onApplyAiMetadata?: (metadata: Partial<{ title: string; excerpt: string; tags: string[]; metaTitle: string; metaDescription: string; coverImagePrompt: string }>) => void
}

type FontSizeOptions = {
  types: string[]
}

type FontFamilyOptions = {
  types: string[]
}

type EditorMode = 'compact' | 'focus'
type SaveState = 'idle' | 'pending' | 'saved'

type OutlineItem = {
  id: string
  level: number
  text: string
}

type AiAction =
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

const aiMetadataActions: AiAction[] = ['seo', 'title-ideas', 'tags', 'excerpt', 'linkedin-post']

function isMetadataAction(action: AiAction) {
  return aiMetadataActions.includes(action)
}

type AiBlock = {
  type: 'heading' | 'paragraph' | 'blockquote' | 'code' | 'list'
  level?: 1 | 2 | 3 | 4
  text?: string
  items?: string[]
}

type AiResult = {
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

type AiDiagramResult = {
  diagramTitle?: string
  summary?: string
  nodes: AiDiagramNode[]
  edges: AiDiagramEdge[]
  groups?: string[]
  notes?: string[]
}

type AiForm = {
  action: AiAction
  topic: string
  targetAudience: string
  tone: string
  category: string
  keywords: string
  notes: string
  desiredLength: string
}

const FontSize = Extension.create<FontSizeOptions>({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize?.replace(/['"]+/g, '') || null,
            renderHTML: attributes => (attributes.fontSize ? { style: `font-size: ${attributes.fontSize}` } : {})
          }
        }
      }
    ]
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }) => chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize: () => ({ chain }) => chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run()
    }
  }
})

const FontFamily = Extension.create<FontFamilyOptions>({
  name: 'fontFamily',
  addOptions() {
    return { types: ['textStyle'] }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontFamily: {
            default: null,
            parseHTML: element => element.style.fontFamily?.replace(/['"]+/g, '') || null,
            renderHTML: attributes => (attributes.fontFamily ? { style: `font-family: ${attributes.fontFamily}` } : {})
          }
        }
      }
    ]
  },
  addCommands() {
    return {
      setFontFamily: (fontFamily: string) => ({ chain }) => chain().setMark('textStyle', { fontFamily }).run(),
      unsetFontFamily: () => ({ chain }) => chain().setMark('textStyle', { fontFamily: null }).removeEmptyTextStyle().run()
    }
  }
})

const DiagramBlock = Node.create({
  name: 'diagramBlock',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      src: {
        default: 'https://excalidraw.com'
      },
      title: {
        default: 'System design diagram'
      }
    }
  },
  parseHTML() {
    return [{ tag: 'figure[data-diagram="excalidraw"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    const src = HTMLAttributes.src || 'https://excalidraw.com'
    const title = HTMLAttributes.title || 'System design diagram'

    return [
      'figure',
      mergeAttributes(HTMLAttributes, { class: 'excalidraw-diagram', 'data-diagram': 'excalidraw' }),
      [
        'iframe',
        {
          src,
          title,
          loading: 'lazy',
          width: '100%',
          height: '520',
          sandbox: 'allow-scripts allow-same-origin allow-popups allow-forms',
          referrerpolicy: 'no-referrer-when-downgrade',
          allowfullscreen: 'true'
        }
      ],
      ['figcaption', title]
    ]
  }
})

const MermaidBlock = Node.create({
  priority: 1100,
  name: 'mermaidBlock',
  group: 'block',
  content: 'text*',
  code: true,
  defining: true,
  isolating: true,
  parseHTML() {
    return [{
      tag: 'pre',
      getAttrs: element => {
        const code = element.querySelector('code')
        const marked = element.classList.contains('mermaid')
          || code?.classList.contains('mermaid')
          || code?.classList.contains('language-mermaid')
          || code?.classList.contains('lang-mermaid')
        return marked ? {} : false
      }
    }]
  },
  renderHTML() {
    return ['pre', ['code', { class: 'language-mermaid' }, 0]]
  },
  addNodeView() {
    return ReactNodeViewRenderer(MermaidBlockView)
  }
})

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (fontSize: string) => ReturnType
      unsetFontSize: () => ReturnType
    }
    fontFamily: {
      setFontFamily: (fontFamily: string) => ReturnType
      unsetFontFamily: () => ReturnType
    }
  }
}

const colorSwatches = ['#0F172A', '#475569', '#0891B2', '#0F766E', '#BE185D', '#B45309']
const highlightSwatches = ['#BAE6FD', '#CCFBF1', '#FCE7F3', '#FEF3C7', '#E9D5FF']
const fontFamilies = [
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Sora', value: 'Sora, sans-serif' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Mono', value: 'JetBrains Mono, monospace' }
]
const fontSizes = ['0.875rem', '1rem', '1.125rem', '1.375rem', '1.75rem']
const mermaidTemplate = `flowchart LR
    Client[Client] --> API[API Gateway]
    API --> Service[Application Service]
    Service --> Database[(Database)]`

export default function RichTextEditor({ value, onChange, onUploadImage, onSave, autoSaveKey, documentTitle, postId, aiUserId, aiContext, onApplyAiMetadata }: RichTextEditorProps) {
  const [sourceMode, setSourceMode] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [insertMenuOpen, setInsertMenuOpen] = useState(false)
  const [diagramOpen, setDiagramOpen] = useState(false)
  const [diagramLoading, setDiagramLoading] = useState(false)
  const [diagramError, setDiagramError] = useState('')
  const [diagramSpec, setDiagramSpec] = useState<AiDiagramResult | null>(null)
  const [aiOpen, setAiOpen] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [aiResult, setAiResult] = useState<AiResult | null>(null)
  const [aiStreamText, setAiStreamText] = useState('')
  const [aiStreamType, setAiStreamType] = useState<'markdown' | 'mermaid'>('markdown')
  const [aiStreaming, setAiStreaming] = useState(false)
  const [aiStreamError, setAiStreamError] = useState('')
  const [aiMermaidValid, setAiMermaidValid] = useState(false)
  const [aiCacheHit, setAiCacheHit] = useState(false)
  const [aiHintDismissed, setAiHintDismissed] = useState(false)
  const aiAbortRef = useRef<AbortController | null>(null)
  const editorRef = useRef<Editor | null>(null)
  const aiAnchorRef = useRef<{ from: number; to: number; selectedText: string } | null>(null)
  const [aiForm, setAiForm] = useState<AiForm>({
    action: 'generate-draft',
    topic: '',
    targetAudience: 'Backend and platform engineers',
    tone: 'Practical, direct, senior engineer',
    category: '',
    keywords: '',
    notes: '',
    desiredLength: 'Medium'
  })
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [revision, setRevision] = useState(0)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] }
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      FontSize,
      FontFamily,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }),
      Image.configure({
        HTMLAttributes: { loading: 'lazy' }
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      MermaidBlock,
      DiagramBlock,
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Placeholder.configure({
        placeholder: 'Start with the production problem. Then write what changed, what broke, and what you learned.'
      })
    ],
    content: value || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'text-base leading-8 outline-none'
      },
      handleKeyDown: (view, event) => {
        if (sourceMode || event.key !== ' ') return false
        const state = view.state
        const paragraph = state.selection.$from.parent
        if (paragraph.type.name !== 'paragraph' || !/^\/(?:ai|generate)$/i.test(paragraph.textContent.trim())) return false
        event.preventDefault()
        const from = state.selection.$from.start()
        view.dispatch(state.tr.delete(from, state.selection.$from.pos))
        openAiAssistant()
        return true
      }
    },
    onUpdate({ editor }) {
      setSaveState('pending')
      setRevision(current => current + 1)
      onChange(editor.getHTML())
    },
    onSelectionUpdate() {
      setRevision(current => current + 1)
    },
    onTransaction({ transaction }) {
      if (!transaction.docChanged || !aiAnchorRef.current) return
      aiAnchorRef.current = {
        ...aiAnchorRef.current,
        from: transaction.mapping.map(aiAnchorRef.current.from),
        to: transaction.mapping.map(aiAnchorRef.current.to)
      }
    }
  })

  useEffect(() => {
    editorRef.current = editor
  }, [editor])

  useEffect(() => {
    setMounted(true)
    setAiHintDismissed(window.localStorage.getItem(`amittech-ai-hint:${aiUserId || 'anonymous'}`) === 'dismissed')
  }, [aiUserId])

  useEffect(() => {
    if (!editor || sourceMode) return
    const currentHtml = editor.getHTML()
    const nextHtml = value || ''
    if (currentHtml !== nextHtml) editor.commands.setContent(nextHtml, { emitUpdate: false })
  }, [editor, sourceMode, value])

  useEffect(() => {
    if (!focusMode) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [focusMode])

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (focusMode && event.key === 'Escape') setFocusMode(false)
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        void saveDraftSnapshot()
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  })

  useEffect(() => {
    if (!autoSaveKey || saveState === 'saved') return
    setSaveState('pending')
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(autoSaveKey, value || '')
      setSaveState('saved')
    }, 1200)

    return () => window.clearTimeout(timer)
  }, [autoSaveKey, saveState, value])

  async function saveDraftSnapshot() {
    if (autoSaveKey) window.localStorage.setItem(autoSaveKey, editor?.getHTML() || value || '')
    setSaveState('saved')
    await onSave?.()
  }

  function setLink() {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Paste link URL', previousUrl || 'https://')
    if (url === null) return
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
  }

  function addImageByUrl() {
    if (!editor) return
    const url = window.prompt('Paste image URL')
    if (!url?.trim()) return
    editor.chain().focus().setImage({ src: url.trim() }).run()
  }

  async function uploadImage(file?: File) {
    if (!file || !editor || !onUploadImage) return
    setUploading(true)
    try {
      const url = await onUploadImage(file)
      editor.chain().focus().setImage({ src: url }).run()
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function insertDiagram() {
    if (!editor) return
    editor.chain().focus().insertContent({ type: 'diagramBlock', attrs: { src: 'https://excalidraw.com', title: 'System design diagram' } }).run()
    setDiagramOpen(false)
  }

  function openDiagramAssistant() {
    setDiagramOpen(true)
    if (!diagramSpec) void generateSystemDiagram()
  }

  async function generateSystemDiagram() {
    if (!editor) return
    setDiagramLoading(true)
    setDiagramError('')
    try {
      const response = await fetch('/api/ai/system-diagram', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          postId,
          topic: aiContext?.title || documentTitle,
          category: aiContext?.category,
          keywords: aiContext?.tags,
          title: aiContext?.title || documentTitle,
          excerpt: aiContext?.excerpt,
          html: editor.getHTML(),
          contentText: editor.getText()
        })
      })
      const payload = await response.json() as { ok: boolean; error?: string; data?: { result: AiDiagramResult } }
      if (!response.ok || !payload.ok) throw new Error(payload.error || 'Diagram generation failed')
      setDiagramSpec(payload.data?.result || null)
    } catch (error) {
      setDiagramError(error instanceof Error ? error.message : 'Diagram generation failed')
    } finally {
      setDiagramLoading(false)
    }
  }

  async function insertDiagramImage(blob: Blob) {
    if (!editor) return
    const file = new File([blob], `system-design-diagram-${Date.now()}.png`, { type: blob.type || 'image/png' })

    if (onUploadImage) {
      await uploadImage(file)
      return
    }

    const dataUrl = await blobToDataUrl(blob)
    editor.chain().focus().setImage({ src: dataUrl }).run()
  }

  function getSelectedText() {
    if (!editor) return ''
    const { from, to } = editor.state.selection
    return editor.state.doc.textBetween(from, to, '\n').trim()
  }

  function openAiAssistant() {
    const activeEditor = editorRef.current || editor
    const selectedText = activeEditor ? activeEditor.state.doc.textBetween(activeEditor.state.selection.from, activeEditor.state.selection.to, '\n').trim() : ''
    aiAnchorRef.current = activeEditor ? {
      from: activeEditor.state.selection.from,
      to: activeEditor.state.selection.to,
      selectedText
    } : null
    setAiForm(current => ({ ...current, action: selectedText ? 'rewrite' : 'generate-draft' }))
    setAiStreamText('')
    setAiStreamError('')
    setAiCacheHit(false)
    setAiResult(null)
    setAiError('')
    setAiOpen(true)
  }

  function closeInlineAi() {
    aiAbortRef.current?.abort()
    aiAbortRef.current = null
    aiAnchorRef.current = null
    setAiStreaming(false)
    setAiOpen(false)
  }

  async function runInlineAi(action: AiAction = aiForm.action, bypassCache = false) {
    const streamActions: AiAction[] = ['generate-draft', 'rewrite', 'format-content', 'system-diagram', 'seo', 'title-ideas', 'tags', 'excerpt', 'linkedin-post']
    if (!editor || !streamActions.includes(action)) return
    aiAbortRef.current?.abort()
    const controller = new AbortController()
    aiAbortRef.current = controller
    const selectedText = getSelectedText()
    aiAnchorRef.current = { from: editor.state.selection.from, to: editor.state.selection.to, selectedText }
    setAiForm(current => ({ ...current, action }))
    setAiStreamText('')
    setAiStreamError('')
    setAiMermaidValid(false)
    setAiStreamType(action === 'system-diagram' ? 'mermaid' : 'markdown')
    setAiResult(null)
    if (isMetadataAction(action)) setAiLoading(true)
    setAiStreaming(true)

    try {
      const response = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        signal: controller.signal,
        body: JSON.stringify({
          action,
          instruction: aiForm.notes,
          postId,
          topic: aiForm.topic || aiContext?.title || documentTitle,
          targetAudience: aiForm.targetAudience,
          tone: aiForm.tone,
          category: aiForm.category || aiContext?.category,
          keywords: aiForm.keywords,
          notes: aiForm.notes,
          desiredLength: aiForm.desiredLength,
          selectedText: boundAiContext(selectedText, 4000),
          title: aiContext?.title || documentTitle,
          excerpt: aiContext?.excerpt,
          html: boundAiContext(editor.getHTML()),
          contentText: nearbyEditorContext(editor),
          bypassCache
        })
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(payload?.error || 'AI request failed')
      }
      if (!response.body) throw new Error('AI did not return a stream')
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      const processFrame = (frame: string) => {
        const parsed = parseSseJsonFrame(frame)
        if (!parsed) return
        const eventName = parsed.event
        const data = parsed.payload as { text?: string; error?: string; contentType?: 'markdown' | 'mermaid' | 'metadata'; cached?: boolean; result?: AiResult }
        if (eventName === 'start') setAiCacheHit(Boolean(data.cached))
        if (eventName === 'start' && data.contentType === 'mermaid') setAiStreamType('mermaid')
        if (eventName === 'delta' && data.text) setAiStreamText(current => current + data.text)
        if (eventName === 'complete') {
          if (data.text) setAiStreamText(data.text)
          if (data.result) setAiResult(data.result)
        }
        if (eventName === 'error') throw new Error(data.error || 'AI generation failed')
      }
      while (true) {
        const { done, value } = await reader.read()
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done })
        const parsedFrames = splitSseFrames(buffer)
        const frames = parsedFrames.frames
        buffer = parsedFrames.remainder
        for (const frame of frames) processFrame(frame)
        if (done) {
          if (buffer.trim()) processFrame(buffer)
          break
        }
      }
    } catch (error) {
      const wasAborted = controller.signal.aborted
      if (!wasAborted) {
        controller.abort()
        setAiStreamError(error instanceof Error ? error.message : 'AI request failed')
      }
    } finally {
      if (aiAbortRef.current === controller) aiAbortRef.current = null
      setAiStreaming(false)
      if (isMetadataAction(action)) setAiLoading(false)
    }
  }

  function acceptInlineAi() {
    if (!editor || !aiStreamText.trim() || (aiStreamType === 'mermaid' && !aiMermaidValid)) return
    const anchor = aiAnchorRef.current
    if (!anchor) return
    if (anchor.selectedText) {
      const currentSelection = editor.state.selection
      if (currentSelection.from !== anchor.from || currentSelection.to !== anchor.to) {
        setAiStreamError('The target selection changed. Select the original text again before replacing it.')
        return
      }
      const current = editor.state.doc.textBetween(anchor.from, anchor.to, '\n').trim()
      if (current !== anchor.selectedText.trim()) {
        setAiStreamError('The selected text changed. Select it again before replacing it.')
        return
      }
    }
    const html = aiStreamType === 'mermaid' ? mermaidSourceToHtml(aiStreamText) : markdownToEditorHtml(aiStreamText)
    editor.chain().focus().insertContentAt({ from: anchor.from, to: anchor.to }, html).run()
    aiAnchorRef.current = null
    setAiOpen(false)
    setAiStreamText('')
  }

  function dismissAiHint() {
    setAiHintDismissed(true)
    window.localStorage.setItem(`amittech-ai-hint:${aiUserId || 'anonymous'}`, 'dismissed')
  }

  function applyAiMetadata() {
    if (!aiResult || !onApplyAiMetadata) return
    onApplyAiMetadata({
      title: aiResult.title || aiResult.titleIdeas?.[0],
      excerpt: aiResult.excerpt,
      tags: aiResult.tags,
      metaTitle: aiResult.metaTitle,
      metaDescription: aiResult.metaDescription,
      coverImagePrompt: aiResult.coverImagePrompt
    })
  }

  if (!editor) {
    return (
      <div className="min-h-[560px] rounded-[24px] border border-white/10 bg-black/20 p-5 text-sm text-slate-400">
        Loading editor...
      </div>
    )
  }

  const stats = getTextStats(editor.getText())
  const outline = getOutline(editor)
  const title = documentTitle?.trim() || 'Untitled article'
  const shell = (
    <EditorShell
      editor={editor}
      mode={focusMode ? 'focus' : 'compact'}
      sourceMode={sourceMode}
      title={title}
      stats={stats}
      outline={outline}
      value={value}
      revision={revision}
      uploading={uploading}
      saveState={saveState}
      hasUploader={Boolean(onUploadImage)}
      insertMenuOpen={insertMenuOpen}
      fileInputRef={fileInputRef}
      onSourceChange={html => {
        setSaveState('pending')
        onChange(html)
      }}
      onToggleSource={() => setSourceMode(current => !current)}
      onToggleFocus={() => setFocusMode(current => !current)}
      onSetLink={setLink}
      onAddImageByUrl={addImageByUrl}
      onUploadImage={uploadImage}
      onSave={saveDraftSnapshot}
      onToggleInsertMenu={() => setInsertMenuOpen(current => !current)}
      onCloseInsertMenu={() => setInsertMenuOpen(false)}
      onOpenDiagram={openDiagramAssistant}
      onOpenAi={openAiAssistant}
      aiPanel={aiOpen ? (
        <InlineAiBlock
          form={aiForm}
          streaming={aiStreaming}
          streamText={aiStreamText}
          streamType={aiStreamType}
          hasSelection={Boolean(getSelectedText())}
          contextLabel={getSelectedText() ? 'Using the current selection as context.' : 'Using nearby article context.'}
          error={aiStreamError || aiError}
          showHint={!aiHintDismissed}
          mermaidValid={aiMermaidValid}
          cacheHit={aiCacheHit}
          metadataText={aiResult ? aiResultToPlainText(aiResult) : ''}
          metadataLoading={aiLoading}
          onChange={setAiForm}
          onGenerate={runInlineAi}
          onStreamTextChange={setAiStreamText}
          onMetadata={action => { setAiForm(current => ({ ...current, action })); setAiResult(null); setAiError(''); setAiStreamError(''); void runInlineAi(action) }}
          onApplyMetadata={applyAiMetadata}
          onStop={() => { aiAbortRef.current?.abort() }}
          onAccept={acceptInlineAi}
          onDismiss={closeInlineAi}
          onDismissHint={dismissAiHint}
          onMermaidValid={setAiMermaidValid}
        />
      ) : null}
    />
  )

  return (
    <>
      {focusMode && mounted ? (
        <>
          <div className="grid min-h-[180px] place-items-center rounded-[24px] border border-cyan-400/20 bg-cyan-400/10 p-6 text-sm font-semibold text-cyan-100">
            Focus editor is open. Press Escape or Done to return.
          </div>
          {createPortal(
            <div className="fixed inset-0 z-[999] bg-[#0b0f14]" role="dialog" aria-modal="true" aria-label="Focused article editor">
              {shell}
            </div>,
            document.body
          )}
        </>
      ) : (
        shell
      )}
      {diagramOpen && mounted
        ? createPortal(
            <SystemDiagramModal
              spec={diagramSpec}
              loading={diagramLoading}
              error={diagramError}
              onGenerate={generateSystemDiagram}
              onInsertBlank={insertDiagram}
              onInsertImage={insertDiagramImage}
              onClose={() => setDiagramOpen(false)}
            />,
            document.body
          )
        : null}
    </>
  )
}

function EditorShell({
  editor,
  mode,
  sourceMode,
  title,
  stats,
  outline,
  value,
  revision,
  uploading,
  saveState,
  hasUploader,
  insertMenuOpen,
  fileInputRef,
  onSourceChange,
  onToggleSource,
  onToggleFocus,
  onSetLink,
  onAddImageByUrl,
  onUploadImage,
  onSave,
  onToggleInsertMenu,
  onCloseInsertMenu,
  onOpenDiagram,
  onOpenAi,
  aiPanel
}: {
  editor: Editor
  mode: EditorMode
  sourceMode: boolean
  title: string
  stats: { words: number; characters: number; minutes: number }
  outline: OutlineItem[]
  value: string
  revision: number
  uploading: boolean
  saveState: SaveState
  hasUploader: boolean
  insertMenuOpen: boolean
  fileInputRef: RefObject<HTMLInputElement | null>
  onSourceChange: (html: string) => void
  onToggleSource: () => void
  onToggleFocus: () => void
  onSetLink: () => void
  onAddImageByUrl: () => void
  onUploadImage: (file?: File) => Promise<void>
  onSave: () => Promise<void>
  onToggleInsertMenu: () => void
  onCloseInsertMenu: () => void
  onOpenDiagram: () => void
  onOpenAi: () => void
  aiPanel?: ReactNode
}) {
  return (
    <div
      className={cn(
        'overflow-hidden border border-white/10 bg-[#111827] shadow-[0_28px_120px_-80px_rgba(6,182,212,0.8)]',
        mode === 'focus' ? 'flex h-screen flex-col rounded-none' : 'rounded-[24px]'
      )}
    >
      <div className="border-b border-slate-200/80 bg-[#f8fafc] text-slate-950">
        <div className="flex min-h-14 items-center gap-2 border-b border-slate-200 px-3 text-[12px] font-semibold text-slate-700">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-cyan-500 text-white shadow-sm">
              <Pilcrow size={18} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <MenuButton icon={Plus} onClick={onToggleInsertMenu}>Insert</MenuButton>
                <MenuButton icon={Save} onClick={onSave}>Save</MenuButton>
              </div>
            </div>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            <MicroButton
              type="button"
              onClick={onOpenAi}
              disabled={sourceMode}
              className="toolbar-tooltip inline-flex h-9 items-center gap-2 rounded-lg border border-fuchsia-200 bg-fuchsia-50 px-3 text-xs font-bold text-fuchsia-800 transition hover:bg-fuchsia-100 disabled:cursor-not-allowed disabled:opacity-50"
              data-tooltip="Write with AI"
            >
              <WandSparkles size={16} />
              Write with AI
            </MicroButton>
            <ToolbarButton icon={Undo2} label="Undo" disabled={sourceMode || !editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} />
            <ToolbarButton icon={Redo2} label="Redo" disabled={sourceMode || !editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} />
            <MicroButton
              type="button"
              onClick={onToggleFocus}
              className="toolbar-tooltip inline-flex h-9 items-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-3 text-xs font-bold text-cyan-800 transition hover:bg-cyan-100"
              data-tooltip={mode === 'focus' ? 'Exit focus mode' : 'Focus mode'}
            >
              {mode === 'focus' ? <Eye size={16} /> : <Focus size={16} />}
              {mode === 'focus' ? 'Done' : 'Focus'}
            </MicroButton>
          </div>
        </div>

        <EditorToolbar
          editor={editor}
          sourceMode={sourceMode}
          uploading={uploading}
          hasUploader={hasUploader}
          insertMenuOpen={insertMenuOpen}
          fileInputRef={fileInputRef}
          outline={outline}
          onToggleSource={onToggleSource}
          onSetLink={onSetLink}
          onAddImageByUrl={onAddImageByUrl}
          onUploadImage={onUploadImage}
          onToggleFocus={onToggleFocus}
          onCloseInsertMenu={onCloseInsertMenu}
          onOpenDiagram={onOpenDiagram}
          onOpenAi={onOpenAi}
        />
      </div>

      <div className={cn('grid min-h-0 bg-slate-200', mode === 'focus' ? 'flex-1 lg:grid-cols-[240px_1fr]' : 'h-[720px] lg:grid-cols-[220px_1fr]')}>
        <OutlineSidebar outline={outline} revision={revision} />
        <div className="rich-editor-workspace min-w-0">
          {sourceMode ? (
            <textarea
              value={value}
              onChange={event => onSourceChange(event.target.value)}
              rows={18}
              className={cn('rich-editor-source', mode === 'focus' && 'rich-editor-source--focus')}
              placeholder="<p>Raw HTML source</p>"
            />
          ) : (
            <EditorContent editor={editor} className={cn('rich-editor', mode === 'focus' ? 'rich-editor--focus' : 'rich-editor--compact')} />
          )}
        </div>
      </div>

      {aiPanel}

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600">
        <span>{stats.words} words</span>
        <span>{stats.characters} chars</span>
        <span>{stats.minutes} min read</span>
        <span className="ml-auto font-semibold text-cyan-700">{saveState === 'pending' ? 'Autosaving...' : saveState === 'saved' ? 'Draft saved' : 'Ready'}</span>
      </div>
    </div>
  )
}

function EditorToolbar({
  editor,
  sourceMode,
  uploading,
  hasUploader,
  insertMenuOpen,
  fileInputRef,
  outline,
  onToggleSource,
  onSetLink,
  onAddImageByUrl,
  onUploadImage,
  onToggleFocus,
  onCloseInsertMenu,
  onOpenDiagram,
  onOpenAi
}: {
  editor: Editor
  sourceMode: boolean
  uploading: boolean
  hasUploader: boolean
  insertMenuOpen: boolean
  fileInputRef: RefObject<HTMLInputElement | null>
  outline: OutlineItem[]
  onToggleSource: () => void
  onSetLink: () => void
  onAddImageByUrl: () => void
  onUploadImage: (file?: File) => Promise<void>
  onToggleFocus: () => void
  onCloseInsertMenu: () => void
  onOpenDiagram: () => void
  onOpenAi: () => void
}) {
  const activeSize = fontSizes.find(size => editor.isActive('textStyle', { fontSize: size })) || '1rem'

  function setBlockStyle(value: string) {
    if (value === 'p') editor.chain().focus().setParagraph().run()
    if (value === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run()
    if (value === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run()
    if (value === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run()
    if (value === 'h4') editor.chain().focus().toggleHeading({ level: 4 }).run()
    if (value === 'quote') editor.chain().focus().toggleBlockquote().run()
    if (value === 'code') editor.chain().focus().toggleCodeBlock().run()
  }

  function insertToc() {
    const items = outline.length
      ? outline.map(item => `<li style="margin-left:${(item.level - 1) * 12}px">${escapeHtml(item.text)}</li>`).join('')
      : '<li>Add headings to generate this table of contents.</li>'
    editor.chain().focus().insertContent(`<div class="cms-toc"><strong>Table of contents</strong><ol>${items}</ol></div>`).run()
    onCloseInsertMenu()
  }

  function insertCallout() {
    editor.chain().focus().insertContent('<blockquote class="cms-callout"><p><strong>Note:</strong> Add the operational context here.</p></blockquote>').run()
    onCloseInsertMenu()
  }

  function insertMermaidDiagram() {
    editor.chain().focus().insertContent({
      type: 'mermaidBlock',
      content: [{ type: 'text', text: mermaidTemplate }]
    }).run()
    onCloseInsertMenu()
  }

  return (
    <div className="relative flex flex-wrap items-center gap-1.5 border-b border-slate-200/70 px-3 py-2 shadow-[0_8px_18px_-18px_rgba(15,23,42,.8)]">
      {insertMenuOpen ? (
        <div className="absolute left-3 top-12 z-20 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 text-sm shadow-2xl">
          <InsertButton icon={Table2} onClick={() => { editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); onCloseInsertMenu() }}>Table</InsertButton>
          <InsertButton icon={Code2} onClick={() => { editor.chain().focus().toggleCodeBlock().run(); onCloseInsertMenu() }}>Code block</InsertButton>
          <InsertButton icon={Workflow} onClick={insertMermaidDiagram}>Mermaid diagram</InsertButton>
          <InsertButton icon={Quote} onClick={() => { editor.chain().focus().toggleBlockquote().run(); onCloseInsertMenu() }}>Blockquote</InsertButton>
          <InsertButton icon={Minus} onClick={() => { editor.chain().focus().setHorizontalRule().run(); onCloseInsertMenu() }}>Divider</InsertButton>
          <InsertButton icon={Highlighter} onClick={insertCallout}>Callout box</InsertButton>
          <InsertButton icon={ListOrdered} onClick={insertToc}>Table of contents</InsertButton>
        </div>
      ) : null}

      <ToolbarGroup>
        <ToolbarButton icon={Undo2} label="Undo" disabled={sourceMode || !editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} />
        <ToolbarButton icon={Redo2} label="Redo" disabled={sourceMode || !editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} />
      </ToolbarGroup>

      <ToolbarGroup>
        <select
          value={getActiveBlockStyle(editor)}
          onChange={event => setBlockStyle(event.target.value)}
          className={cn(selectClassName, 'w-[128px]')}
          aria-label="Text style"
          disabled={sourceMode}
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="quote">Quote</option>
          <option value="code">Code block</option>
        </select>
        <select
          value={fontFamilies.find(font => editor.isActive('textStyle', { fontFamily: font.value }))?.value || ''}
          onChange={event => {
            const family = event.target.value
            if (family) editor.chain().focus().setFontFamily(family).run()
            else editor.chain().focus().unsetFontFamily().run()
          }}
          className={cn(selectClassName, 'w-[112px]')}
          aria-label="Font family"
          disabled={sourceMode}
        >
          <option value="">Default</option>
          {fontFamilies.map(font => <option key={font.label} value={font.value}>{font.label}</option>)}
        </select>
        <ToolbarButton icon={Minus} label="Smaller text" disabled={sourceMode} onClick={() => setRelativeFontSize(editor, -1)} />
        <span className="w-12 text-center text-[11px] font-semibold text-slate-600">{activeSize.replace('rem', '')}</span>
        <ToolbarButton icon={Plus} label="Larger text" disabled={sourceMode} onClick={() => setRelativeFontSize(editor, 1)} />
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton icon={Bold} label="Bold" active={editor.isActive('bold')} disabled={sourceMode} onClick={() => editor.chain().focus().toggleBold().run()} />
        <ToolbarButton icon={Italic} label="Italic" active={editor.isActive('italic')} disabled={sourceMode} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <ToolbarButton icon={UnderlineIcon} label="Underline" active={editor.isActive('underline')} disabled={sourceMode} onClick={() => editor.chain().focus().toggleUnderline().run()} />
        <ToolbarButton icon={Strikethrough} label="Strikethrough" active={editor.isActive('strike')} disabled={sourceMode} onClick={() => editor.chain().focus().toggleStrike().run()} />
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton icon={List} label="Bullet list" active={editor.isActive('bulletList')} disabled={sourceMode} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <ToolbarButton icon={ListOrdered} label="Numbered list" active={editor.isActive('orderedList')} disabled={sourceMode} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <ToolbarButton icon={CheckSquare} label="Checklist" active={editor.isActive('taskList')} disabled={sourceMode} onClick={() => editor.chain().focus().toggleTaskList().run()} />
        <ToolbarButton icon={IndentDecrease} label="Outdent" disabled={sourceMode} onClick={() => editor.chain().focus().liftListItem('listItem').liftListItem('taskItem').run()} />
        <ToolbarButton icon={IndentIncrease} label="Indent" disabled={sourceMode} onClick={() => editor.chain().focus().sinkListItem('listItem').sinkListItem('taskItem').run()} />
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton icon={AlignLeft} label="Align left" active={editor.isActive({ textAlign: 'left' })} disabled={sourceMode} onClick={() => editor.chain().focus().setTextAlign('left').run()} />
        <ToolbarButton icon={AlignCenter} label="Align center" active={editor.isActive({ textAlign: 'center' })} disabled={sourceMode} onClick={() => editor.chain().focus().setTextAlign('center').run()} />
        <ToolbarButton icon={AlignRight} label="Align right" active={editor.isActive({ textAlign: 'right' })} disabled={sourceMode} onClick={() => editor.chain().focus().setTextAlign('right').run()} />
        <ToolbarButton icon={AlignJustify} label="Justify" active={editor.isActive({ textAlign: 'justify' })} disabled={sourceMode} onClick={() => editor.chain().focus().setTextAlign('justify').run()} />
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton icon={Link2} label="Add link" active={editor.isActive('link')} disabled={sourceMode} onClick={onSetLink} />
        <ToolbarButton icon={ImagePlus} label="Image from URL" disabled={sourceMode} onClick={onAddImageByUrl} />
        {hasUploader ? (
          <>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={event => onUploadImage(event.target.files?.[0])} />
            <ToolbarButton icon={Upload} label={uploading ? 'Uploading image' : 'Upload image'} disabled={sourceMode || uploading} onClick={() => fileInputRef.current?.click()} />
          </>
        ) : null}
      </ToolbarGroup>

      <ToolbarGroup>
        <Swatches label="Text color" swatches={colorSwatches} disabled={sourceMode} onPick={color => editor.chain().focus().setColor(color).run()} />
        <Swatches label="Highlight" swatches={highlightSwatches} disabled={sourceMode} onPick={color => editor.chain().focus().toggleHighlight({ color }).run()} />
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton icon={Sparkles} label="Write with AI" disabled={sourceMode} onClick={onOpenAi} />
        <ToolbarButton icon={Eraser} label="Clear formatting" disabled={sourceMode} onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} />
        <ToolbarButton icon={sourceMode ? Eye : FileCode2} label={sourceMode ? 'Visual editor' : 'HTML source'} active={sourceMode} onClick={onToggleSource} />
        <ToolbarButton icon={Maximize2} label="Focus mode" onClick={onToggleFocus} />
      </ToolbarGroup>
    </div>
  )
}

function OutlineSidebar({ outline, revision }: { outline: OutlineItem[]; revision: number }) {
  const items = useMemo(() => outline, [outline, revision])

  return (
    <aside className="hidden min-h-0 overflow-y-auto border-r border-slate-300 bg-slate-100/95 p-4 text-slate-700 lg:block">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Outline</p>
      <div className="mt-4 space-y-1">
        {items.length ? (
          items.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollHeadingIntoView(item.text)}
              className="block w-full truncate rounded-lg px-2 py-1.5 text-left text-xs font-semibold transition hover:bg-white hover:text-cyan-700"
              style={{ paddingLeft: `${(item.level - 1) * 10 + 8}px` }}
              title={item.text}
            >
              {item.text}
            </button>
          ))
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 p-3 text-xs leading-5 text-slate-500">
            Add headings to build an outline.
          </p>
        )}
      </div>
    </aside>
  )
}

function SystemDiagramModal({
  spec,
  loading,
  error,
  onGenerate,
  onInsertBlank,
  onInsertImage,
  onClose
}: {
  spec: AiDiagramResult | null
  loading: boolean
  error: string
  onGenerate: () => Promise<void>
  onInsertBlank: () => void
  onInsertImage: (blob: Blob) => Promise<void>
  onClose: () => void
}) {
  const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null)
  const [elements, setElements] = useState<readonly NonDeleted<ExcalidrawElement>[]>([])
  const [appState, setAppState] = useState<Partial<AppState>>(getDiagramAppState())
  const [files, setFiles] = useState<BinaryFiles>({})
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadScene() {
      if (!spec?.nodes?.length) return
      const nextElements = await buildDiagramElements(spec)
      if (cancelled) return
      const nextAppState = getDiagramAppState()
      setElements(nextElements)
      setAppState(nextAppState)
      api?.updateScene({ elements: nextElements, appState: nextAppState as AppState })
      window.setTimeout(() => api?.scrollToContent(nextElements, { fitToContent: true }), 80)
    }

    void loadScene()
    return () => {
      cancelled = true
    }
  }, [api, spec])

  async function exportImage() {
    const sceneElements = api?.getSceneElements() || elements
    if (!sceneElements.length) return

    setExporting(true)
    try {
      const { exportToBlob } = await import('@excalidraw/excalidraw')
      const blob = await exportToBlob({
        elements: sceneElements,
        appState: {
          ...api?.getAppState(),
          ...getDiagramAppState(),
          exportBackground: true,
          viewBackgroundColor: '#ffffff'
        },
        files: api?.getFiles() || files,
        mimeType: 'image/png',
        exportPadding: 36
      })
      await onInsertImage(blob)
      onClose()
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/80 p-3 backdrop-blur" role="dialog" aria-modal="true" aria-label="AI generated Excalidraw system design diagram">
      <div className="flex h-[92vh] w-[96vw] flex-col overflow-hidden rounded-2xl border border-white/15 bg-slate-950 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-400/15 text-cyan-200">
              <Columns3 size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300">AI system design diagram</p>
              <h3 className="mt-1 truncate text-sm font-semibold">{spec?.diagramTitle || 'Generate from article content'}</h3>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <MicroButton type="button" onClick={onGenerate} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/30 px-3 py-2 text-xs font-bold text-cyan-100 transition hover:bg-cyan-300/10 disabled:opacity-50">
              <RefreshCw size={15} />
              {loading ? 'Generating...' : spec ? 'Regenerate' : 'Generate'}
            </MicroButton>
            <MicroButton type="button" onClick={exportImage} disabled={!elements.length || exporting} className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-50">
              <ImagePlus size={15} />
              {exporting ? 'Inserting...' : 'Insert as image'}
            </MicroButton>
            <MicroButton type="button" onClick={onInsertBlank} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10">
              Blank frame
            </MicroButton>
            <MicroButton type="button" onClick={onClose} className="toolbar-tooltip grid h-9 w-9 place-items-center rounded-xl border border-white/15 text-slate-200 transition hover:bg-white/10" data-tooltip="Close">
              <X size={15} />
            </MicroButton>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 lg:grid-cols-[310px_1fr]">
          <aside className="min-h-0 overflow-y-auto border-r border-white/10 bg-white/[0.025] p-4">
            {error ? <p className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</p> : null}
            {spec?.summary ? (
              <div className="rounded-xl border border-white/10 bg-black/25 p-3 text-sm leading-6 text-slate-300">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Summary</p>
                <p className="mt-2">{spec.summary}</p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 bg-black/25 p-4 text-sm leading-6 text-slate-400">
                Generate a diagram from the current article, review it here, edit anything on the canvas, then insert it as an image.
              </div>
            )}

            {spec?.nodes?.length ? (
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Components</p>
                <div className="mt-2 space-y-2">
                  {spec.nodes.map(node => (
                    <div key={node.id} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                      <p className="text-sm font-semibold text-slate-100">{node.label}</p>
                      <p className="mt-1 text-xs text-cyan-200">{node.group || node.type || 'component'}</p>
                      {node.description ? <p className="mt-2 text-xs leading-5 text-slate-400">{node.description}</p> : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {spec?.notes?.length ? (
              <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.035] p-3">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Assumptions</p>
                <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-400">
                  {spec.notes.map(note => <li key={note}>{note}</li>)}
                </ul>
              </div>
            ) : null}
          </aside>

          <div className="min-h-0 bg-white">
            {spec?.nodes?.length || elements.length ? (
              <ExcalidrawCanvas
                initialData={{ elements, appState }}
                excalidrawAPI={setApi}
                onChange={(nextElements, nextAppState, nextFiles) => {
                  setElements(nextElements as readonly NonDeleted<ExcalidrawElement>[])
                  setAppState(nextAppState)
                  setFiles(nextFiles)
                }}
              />
            ) : (
              <div className="grid h-full place-items-center bg-slate-50 p-8 text-center text-slate-600">
                <div>
                  <Columns3 className="mx-auto text-cyan-600" size={34} />
                  <h4 className="mt-4 text-2xl font-semibold text-slate-950">Diagram will appear here</h4>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-6">Click Generate to turn the current article into an editable Excalidraw system design diagram.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function AiMetadataPreview({ result }: { result: AiResult | null }) {
  if (!result) return null

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-sm leading-7 text-slate-200">
      {result.title ? <PreviewField label="Title">{result.title}</PreviewField> : null}
      {result.titleIdeas?.length ? <PreviewField label="Title ideas">{result.titleIdeas.join('\n')}</PreviewField> : null}
      {result.excerpt ? <PreviewField label="Excerpt">{result.excerpt}</PreviewField> : null}
      {result.metaTitle ? <PreviewField label="Meta title">{result.metaTitle}</PreviewField> : null}
      {result.metaDescription ? <PreviewField label="Meta description">{result.metaDescription}</PreviewField> : null}
      {result.tags?.length ? <PreviewField label="Tags">{result.tags.join(', ')}</PreviewField> : null}
      {result.coverImagePrompt ? <PreviewField label="Cover image prompt">{result.coverImagePrompt}</PreviewField> : null}
      {result.imageAltText ? <PreviewField label="Image alt text">{result.imageAltText}</PreviewField> : null}
      {result.linkedinPost ? <PreviewField label="LinkedIn post">{result.linkedinPost}</PreviewField> : null}
      {result.summary ? <PreviewField label="Summary">{result.summary}</PreviewField> : null}
      {result.socialSnippets?.length ? <PreviewField label="Social snippets">{result.socialSnippets.join('\n\n')}</PreviewField> : null}
      {result.notes?.length ? <PreviewField label="Notes">{result.notes.join('\n')}</PreviewField> : null}
    </div>
  )
}

function PreviewField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-fuchsia-300">{label}</p>
      <p className="whitespace-pre-wrap text-slate-200">{children}</p>
    </div>
  )
}

function ToolbarGroup({ children }: { children: ReactNode }) {
  return <div className="flex min-h-9 max-w-full flex-wrap items-center gap-0.5 rounded-lg border border-slate-200 bg-white px-1 py-1 shadow-sm">{children}</div>
}

function ToolbarButton({
  children,
  icon: Icon,
  label,
  active,
  disabled,
  onClick
}: {
  children?: ReactNode
  icon?: LucideIcon
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <MicroButton
      type="button"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      data-tooltip={label}
      className={cn(
        'toolbar-tooltip inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-[11px] font-semibold text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-35',
        active ? 'bg-cyan-100 text-cyan-800' : 'hover:bg-slate-100 hover:text-cyan-800'
      )}
    >
      {Icon ? <Icon size={16} strokeWidth={2.2} /> : children}
    </MicroButton>
  )
}

function MenuButton({ children, icon: Icon, disabled, onClick }: { children: ReactNode; icon?: LucideIcon; disabled?: boolean; onClick: () => void }) {
  return (
    <MicroButton type="button" disabled={disabled} onClick={onClick} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40">
      {Icon ? <Icon size={14} /> : null}
      {children}
    </MicroButton>
  )
}

function InsertButton({ children, icon: Icon, onClick }: { children: ReactNode; icon: LucideIcon; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 px-4 py-2 text-left font-semibold text-slate-700 transition hover:bg-cyan-50 hover:text-cyan-800">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-500">
        <Icon size={16} />
      </span>
      <span>{children}</span>
    </button>
  )
}

function Swatches({ label, swatches, disabled, onPick }: { label: string; swatches: string[]; disabled?: boolean; onPick: (color: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1 pl-1" aria-label={label}>
      <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{label === 'Text color' ? 'Text' : 'Mark'}</span>
      {swatches.map(color => (
        <MicroButton
          key={color}
          type="button"
          aria-label={`${label}: ${color}`}
          disabled={disabled}
          onClick={() => onPick(color)}
          data-tooltip={`${label}: ${color}`}
          className="toolbar-tooltip h-6 w-6 rounded-md border border-slate-300 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  )
}

function getDiagramAppState(): Partial<AppState> {
  return {
    theme: 'light',
    viewBackgroundColor: '#ffffff',
    currentItemStrokeColor: '#0f172a',
    currentItemBackgroundColor: '#e0f2fe'
  }
}

async function buildDiagramElements(spec: AiDiagramResult): Promise<readonly NonDeleted<ExcalidrawElement>[]> {
  const { convertToExcalidrawElements } = await import('@excalidraw/excalidraw')
  const groups = getDiagramGroups(spec)
  const nodePositions = new Map<string, { x: number; y: number; width: number; height: number }>()
  const laneWidth = 245
  const cardWidth = 184
  const cardHeight = 82
  const top = 145
  const left = 64

  groups.forEach((group, groupIndex) => {
    const groupNodes = spec.nodes.filter(node => (node.group || 'system') === group)
    groupNodes.forEach((node, nodeIndex) => {
      nodePositions.set(node.id, {
        x: left + groupIndex * laneWidth,
        y: top + nodeIndex * 134,
        width: cardWidth,
        height: cardHeight
      })
    })
  })

  const skeleton: Array<Record<string, unknown>> = [
    {
      type: 'text',
      x: left,
      y: 42,
      width: Math.max(520, groups.length * laneWidth - 40),
      text: spec.diagramTitle || 'System design diagram',
      fontSize: 28,
      strokeColor: '#0f172a'
    },
    ...(spec.summary ? [{
      type: 'text',
      x: left,
      y: 82,
      width: Math.max(520, groups.length * laneWidth - 40),
      text: spec.summary,
      fontSize: 15,
      strokeColor: '#475569'
    }] : [])
  ]

  spec.edges.forEach((edge, index) => {
    const from = nodePositions.get(edge.from)
    const to = nodePositions.get(edge.to)
    if (!from || !to) return
    const startX = from.x + from.width
    const startY = from.y + from.height / 2
    const endX = to.x
    const endY = to.y + to.height / 2
    skeleton.push({
      type: 'arrow',
      id: `edge-${index}-${edge.from}-${edge.to}`,
      x: startX,
      y: startY,
      points: [[0, 0], [endX - startX, endY - startY]],
      strokeColor: '#0f766e',
      strokeWidth: 2,
      roughness: 1,
      endArrowhead: 'arrow',
      label: edge.label ? {
        text: edge.label,
        fontSize: 13,
        strokeColor: '#0f766e',
        backgroundColor: '#ecfeff'
      } : undefined
    })
  })

  groups.forEach((group, groupIndex) => {
    const groupNodes = spec.nodes.filter(node => (node.group || 'system') === group)
    const maxY = top + Math.max(groupNodes.length - 1, 0) * 134 + cardHeight + 26
    const laneX = left + groupIndex * laneWidth - 18
    skeleton.push({
      type: 'rectangle',
      x: laneX,
      y: 118,
      width: cardWidth + 36,
      height: Math.max(160, maxY - 118),
      strokeColor: '#cbd5e1',
      backgroundColor: '#f8fafc',
      fillStyle: 'solid',
      strokeStyle: 'dashed',
      roughness: 0.8,
      opacity: 65
    })
    skeleton.push({
      type: 'text',
      x: laneX + 14,
      y: 126,
      width: cardWidth + 10,
      text: toTitleCase(group),
      fontSize: 14,
      strokeColor: '#0369a1'
    })
  })

  spec.nodes.forEach(node => {
    const position = nodePositions.get(node.id)
    if (!position) return
    const colors = getNodeColors(node)
    skeleton.push({
      type: 'rectangle',
      id: node.id,
      x: position.x,
      y: position.y,
      width: position.width,
      height: position.height,
      strokeColor: colors.stroke,
      backgroundColor: colors.fill,
      fillStyle: 'solid',
      roundness: { type: 3 },
      roughness: 1.15,
      strokeWidth: 2
    })
    skeleton.push({
      type: 'text',
      x: position.x + 14,
      y: position.y + 14,
      width: position.width - 28,
      text: node.label,
      fontSize: node.label.length > 22 ? 15 : 17,
      strokeColor: '#0f172a'
    })
    if (node.type || node.description) {
      skeleton.push({
        type: 'text',
        x: position.x + 14,
        y: position.y + 46,
        width: position.width - 28,
        text: node.type || truncateLabel(node.description || '', 34),
        fontSize: 11,
        strokeColor: '#64748b'
      })
    }
  })

  return convertToExcalidrawElements(skeleton as never, { regenerateIds: false }) as readonly NonDeleted<ExcalidrawElement>[]
}

function getDiagramGroups(spec: AiDiagramResult) {
  const groups = [
    ...(spec.groups || []),
    ...spec.nodes.map(node => node.group || 'system')
  ].map(group => group || 'system')
  return Array.from(new Set(groups)).slice(0, 8)
}

function getNodeColors(node: AiDiagramNode) {
  const key = `${node.group || ''} ${node.type || ''}`.toLowerCase()
  if (/client|user|browser|mobile/.test(key)) return { stroke: '#0284c7', fill: '#e0f2fe' }
  if (/edge|gateway|cdn|load/.test(key)) return { stroke: '#0891b2', fill: '#cffafe' }
  if (/queue|event|kafka|async|stream/.test(key)) return { stroke: '#7c3aed', fill: '#ede9fe' }
  if (/data|db|database|cache|redis|store|postgres/.test(key)) return { stroke: '#0f766e', fill: '#ccfbf1' }
  if (/observability|monitor|log|metric/.test(key)) return { stroke: '#b45309', fill: '#fef3c7' }
  return { stroke: '#475569', fill: '#f1f5f9' }
}

function toTitleCase(value: string) {
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
}

function truncateLabel(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max - 1)}...` : value
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error || new Error('Could not read image blob'))
    reader.readAsDataURL(blob)
  })
}

function InlineAiBlock({ form, streaming, streamText, streamType, hasSelection, contextLabel, error, showHint, mermaidValid, cacheHit, metadataText, metadataLoading, onChange, onGenerate, onStreamTextChange, onMetadata, onApplyMetadata, onStop, onAccept, onDismiss, onDismissHint, onMermaidValid }: {
  form: AiForm
  streaming: boolean
  streamText: string
  streamType: 'markdown' | 'mermaid'
  hasSelection: boolean
  contextLabel: string
  error: string
  showHint: boolean
  mermaidValid: boolean
  cacheHit: boolean
  metadataText: string
  metadataLoading: boolean
  onChange: (form: AiForm) => void
  onGenerate: (action: AiAction, bypassCache?: boolean) => Promise<void>
  onStreamTextChange: (text: string) => void
  onMetadata: (action: AiAction) => void
  onApplyMetadata: () => void
  onStop: () => void
  onAccept: () => void
  onDismiss: () => void
  onDismissHint: () => void
  onMermaidValid: (valid: boolean) => void
}) {
  const [codeMode, setCodeMode] = useState(false)
  const hasOutput = Boolean(streamText.trim())
  const diagramMode = form.action === 'system-diagram'

  return (
    <section className="border-t border-cyan-200 bg-white px-4 py-4 text-slate-900 shadow-inner" aria-label="Inline AI writing assistant">
      <div className="mx-auto max-w-5xl">
        {showHint ? (
          <div className="mb-3 flex items-start justify-between gap-3 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs leading-5 text-cyan-950">
            <p><strong>Tip:</strong> type <code>/ai</code> in an empty paragraph to write, improve selected text, or generate a diagram.</p>
            <button type="button" className="text-cyan-700 underline" onClick={onDismissHint}>Got it</button>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-700">Write with AI</span>
          <button type="button" onClick={() => onGenerate('generate-draft')} disabled={streaming || metadataLoading} className={cn('rounded-lg px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50', form.action === 'generate-draft' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700')}>Write</button>
          <button type="button" onClick={() => onGenerate('rewrite')} disabled={streaming || metadataLoading || !hasSelection} className={cn('rounded-lg px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50', form.action === 'rewrite' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700')}>Improve selection</button>
          <button type="button" aria-pressed={diagramMode} onClick={() => onGenerate('system-diagram')} disabled={streaming || metadataLoading} className={cn('rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50', diagramMode ? 'bg-cyan-600 text-white shadow-sm ring-2 ring-cyan-200' : 'border border-cyan-200 bg-cyan-50 text-cyan-800 hover:bg-cyan-100')}>Generate diagram</button>
          <select defaultValue="" disabled={streaming || metadataLoading} onChange={event => { if (event.target.value) onMetadata(event.target.value as AiAction); event.target.value = '' }} className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
            <option value="">More AI actions</option>
            <option value="seo">SEO metadata</option>
            <option value="title-ideas">Title ideas</option>
            <option value="tags">Tags</option>
            <option value="excerpt">Excerpt</option>
            <option value="linkedin-post">LinkedIn post</option>
          </select>
          <button type="button" onClick={onDismiss} className="ml-auto rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close AI assistant"><X size={16} /></button>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
          <textarea
            value={form.notes}
            onChange={event => onChange({ ...form, notes: event.target.value })}
            rows={2}
            placeholder={form.action === 'system-diagram' ? 'Describe the flow or architecture to diagram...' : 'Tell AI what to write or change...'}
            className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 outline-none focus:border-cyan-500"
          />
          <div className="grid gap-2">
            <input value={form.tone} onChange={event => onChange({ ...form, tone: event.target.value })} placeholder="Tone" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs" />
            <input value={form.targetAudience} onChange={event => onChange({ ...form, targetAudience: event.target.value })} placeholder="Audience" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs" />
            <input value={form.desiredLength} onChange={event => onChange({ ...form, desiredLength: event.target.value })} placeholder="Length" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs" />
          </div>
        </div>
        {diagramMode ? (
          <div className="mt-3 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-3 text-xs text-cyan-950">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">Live Mermaid diagram</p>
                <p className="mt-1 leading-5 text-cyan-800">Describe the flow in plain English. You can review the rendered diagram, edit its code, or repair it before accepting.</p>
              </div>
              <span className="rounded-full bg-white/70 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-700">Preview first</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={() => onChange({ ...form, notes: 'Create a flowchart showing Client → API → Database.' })} className="rounded-lg border border-cyan-200 bg-white px-2.5 py-1.5 font-semibold text-cyan-800 hover:bg-cyan-100">Use flowchart example</button>
              <button type="button" onClick={() => onChange({ ...form, notes: 'Create a sequence diagram showing Client, API, and Database handling a request.' })} className="rounded-lg border border-cyan-200 bg-white px-2.5 py-1.5 font-semibold text-cyan-800 hover:bg-cyan-100">Use sequence example</button>
            </div>
          </div>
        ) : null}
        <p className="mt-2 text-[11px] font-medium text-slate-500">{contextLabel}</p>
        <p className="mt-1 text-[11px] text-slate-400">Help: type <code>/ai</code> or <code>/generate</code> in an empty paragraph to reopen this block.</p>
        {metadataLoading ? <p className="mt-3 rounded-lg bg-violet-50 px-3 py-2 text-xs text-violet-700">Generating metadata…</p> : null}
        {error ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p> : null}
        {metadataLoading && !metadataText ? <p className="mt-3 rounded-lg bg-violet-50 px-3 py-2 text-xs text-violet-700">Generating validated metadata…</p> : null}
        {metadataText ? <div className="mt-3 rounded-xl border border-violet-200 bg-violet-50 p-3"><div className="flex flex-wrap items-center justify-between gap-3"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700">{metadataLoading ? 'Generating metadata' : cacheHit ? 'Reused metadata' : 'Metadata preview'}</span><div className="flex items-center gap-2"><button type="button" onClick={() => onGenerate(form.action, true)} disabled={metadataLoading} className="rounded-lg border border-violet-300 px-2.5 py-1 text-xs font-semibold text-violet-800 disabled:opacity-40">Regenerate</button><button type="button" onClick={onApplyMetadata} disabled={metadataLoading} className="rounded-lg bg-violet-600 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-40">Apply</button></div></div><pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs leading-5 text-violet-950">{metadataText}</pre></div> : null}
        {hasOutput ? (
          <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{streaming ? 'Generating live' : cacheHit ? 'Reused result' : streamType === 'mermaid' ? 'Diagram preview' : 'AI preview'}</span>
                {streamType === 'mermaid' && !streaming ? <p className="mt-0.5 text-[11px] text-slate-500">Review the rendering or switch to Code to edit the source.</p> : null}
              </div>
              <div className="flex items-center gap-2">
                {streamType === 'mermaid' ? <button type="button" onClick={() => setCodeMode(current => !current)} className="text-xs font-semibold text-cyan-700">{codeMode ? 'Preview' : 'Code'}</button> : null}
                {streaming ? <button type="button" onClick={onStop} className="rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">Stop</button> : <button type="button" onClick={() => onGenerate(form.action, true)} className="rounded-lg bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700"><RefreshCw size={12} className="mr-1 inline" />Regenerate</button>}
                <button type="button" onClick={onDismiss} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Discard</button>
                <button type="button" onClick={onAccept} disabled={streaming || (streamType === 'mermaid' && !mermaidValid)} className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-40">Accept</button>
              </div>
            </div>
            {streamType === 'mermaid' ? (
              <>
                <div className={codeMode ? 'hidden' : undefined}>
                  <LiveMermaidPreview source={streamText} onValidChange={onMermaidValid} />
                </div>
                {codeMode ? <div contentEditable={!streaming} suppressContentEditableWarning onInput={event => { onStreamTextChange(event.currentTarget.textContent || ''); onMermaidValid(false) }} className="max-h-72 overflow-auto whitespace-pre-wrap px-4 py-3 text-sm leading-6 text-slate-800 outline-none">{streamText}</div> : null}
              </>
            ) : (
              <div contentEditable={!streaming} suppressContentEditableWarning onInput={event => onStreamTextChange(event.currentTarget.textContent || '')} className="max-h-72 overflow-auto whitespace-pre-wrap px-4 py-3 text-sm leading-6 text-slate-800 outline-none">{streamText}</div>
            )}
            {streamType === 'mermaid' && !mermaidValid && !streaming ? <div className="flex items-center justify-between gap-3 border-t border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"><span>Mermaid is still invalid. Edit the code or repair it before accepting.</span><button type="button" onClick={() => onGenerate('system-diagram', true)} className="rounded-lg bg-amber-200 px-2 py-1 font-semibold text-amber-950">Repair with AI</button></div> : null}
          </div>
        ) : (
          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
            <p>The response will appear here and stay temporary until you accept it.</p>
            {streaming ? <button type="button" onClick={onStop} className="rounded-lg bg-amber-100 px-2.5 py-1 font-semibold text-amber-800">Stop</button> : null}
          </div>
        )}
      </div>
    </section>
  )
}

function LiveMermaidPreview({ source, onValidChange }: { source: string; onValidChange: (valid: boolean) => void }) {
  const [svg, setSvg] = useState('')
  const [error, setError] = useState('')
  const renderId = useRef(0)

  useEffect(() => {
    const currentId = ++renderId.current
    const timer = window.setTimeout(() => {
      void (async () => {
        const clean = sanitizeMermaidSource(source)
        if (!clean) {
          setSvg('')
          setError('')
          onValidChange(false)
          return
        }
        try {
          const rendered = await renderMermaidSource(clean, `inline-mermaid-${Date.now()}`)
          if (currentId !== renderId.current) return
          setSvg(rendered.svg)
          setError('')
          onValidChange(true)
        } catch (renderError) {
          if (currentId !== renderId.current) return
          const message = renderError instanceof Error ? renderError.message : 'Invalid Mermaid syntax'
          setError(message)
          onValidChange(false)
        }
      })()
    }, 450)
    return () => window.clearTimeout(timer)
  }, [source, onValidChange])

  return (
    <div className="min-h-40 overflow-auto bg-white p-4">
      {svg ? <div className="mermaid-diagram__canvas" dangerouslySetInnerHTML={{ __html: svg }} /> : <p className="text-xs text-slate-500">{error || 'Waiting for a complete diagram...'}</p>}
      {svg && error ? <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">{error}</p> : null}
    </div>
  )
}

function MermaidBlockView({ node }: ReactNodeViewProps) {
  const [codeMode, setCodeMode] = useState(false)
  const source = node.textContent

  return (
    <NodeViewWrapper className="my-5 overflow-hidden rounded-xl border border-cyan-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-cyan-100 bg-cyan-50 px-3 py-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-700">Mermaid diagram</span>
        <button type="button" onClick={() => setCodeMode(current => !current)} className="text-xs font-semibold text-cyan-700">
          {codeMode ? 'Preview' : 'Code'}
        </button>
      </div>
      <NodeViewContent
        as="div"
        className={cn(
          'block whitespace-pre-wrap px-4 py-3 font-mono text-xs leading-5 text-slate-800 outline-none',
          codeMode ? 'min-h-28' : 'pointer-events-none max-h-0 overflow-hidden p-0 opacity-0'
        )}
      />
      {!codeMode ? <LiveMermaidPreview source={source} onValidChange={() => undefined} /> : null}
    </NodeViewWrapper>
  )
}

function mermaidSourceToHtml(source: string) {
  return `<pre><code class="language-mermaid">${escapeHtml(sanitizeMermaidSource(source))}</code></pre>`
}

function markdownToEditorHtml(markdown: string) {
  const lines = markdown.replace(/\r/g, '').split('\n')
  const html: string[] = []
  let list: string[] = []
  let code: string[] = []
  let inCode = false
  const flushList = () => {
    if (list.length) html.push(`<ul>${list.map(item => `<li>${formatInlineMarkdown(item)}</li>`).join('')}</ul>`)
    list = []
  }
  const flushCode = () => {
    if (code.length) html.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`)
    code = []
  }
  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (inCode) flushCode()
      else { flushList(); inCode = true }
      continue
    }
    if (inCode) { code.push(line); continue }
    const heading = line.match(/^(#{1,4})\s+(.+)$/)
    if (heading) { flushList(); html.push(`<h${heading[1].length}>${formatInlineMarkdown(heading[2])}</h${heading[1].length}>`); continue }
    const item = line.match(/^\s*[-*]\s+(.+)$/)
    if (item) { list.push(item[1]); continue }
    if (!line.trim()) { flushList(); continue }
    flushList(); html.push(`<p>${formatInlineMarkdown(line)}</p>`)
  }
  if (inCode) flushCode()
  flushList()
  return html.join('') || '<p></p>'
}

function boundAiContext(value: string, max = 5600) {
  return value.length > max ? `${value.slice(0, max)}\n[truncated]` : value
}

function nearbyEditorContext(editor: Editor, max = 5600) {
  const text = editor.getText()
  if (text.length <= max) return text
  const cursorOffset = editor.state.doc.textBetween(0, editor.state.selection.from, '\n').length
  const half = Math.floor(max / 2)
  const start = Math.max(0, Math.min(cursorOffset - half, text.length - max))
  return `${start > 0 ? '[earlier text omitted]\n' : ''}${text.slice(start, start + max)}${start + max < text.length ? '\n[later text omitted]' : ''}`
}

function aiResultToPlainText(result: AiResult) {
  const blockText = result.content?.map(block => block.items?.join('\n') || block.text || '').filter(Boolean).join('\n\n')
  return [
    result.title,
    result.titleIdeas?.join('\n'),
    result.excerpt,
    blockText,
    result.plainText,
    result.markdown,
    result.metaTitle,
    result.metaDescription,
    result.tags?.join(', '),
    result.coverImagePrompt,
    result.imageAltText,
    result.linkedinPost,
    result.socialSnippets?.join('\n\n'),
    result.summary,
    result.notes?.join('\n')
  ].filter(Boolean).join('\n\n')
}

function getTextStats(text: string) {
  const trimmed = text.trim()
  const words = trimmed ? trimmed.split(/\s+/).length : 0
  return {
    words,
    characters: text.replace(/\s/g, '').length,
    minutes: Math.max(1, Math.ceil(words / 220))
  }
}

function getActiveBlockStyle(editor: Editor) {
  if (editor.isActive('heading', { level: 1 })) return 'h1'
  if (editor.isActive('heading', { level: 2 })) return 'h2'
  if (editor.isActive('heading', { level: 3 })) return 'h3'
  if (editor.isActive('heading', { level: 4 })) return 'h4'
  if (editor.isActive('blockquote')) return 'quote'
  if (editor.isActive('codeBlock')) return 'code'
  return 'p'
}

function setRelativeFontSize(editor: Editor, direction: -1 | 1) {
  const current = fontSizes.findIndex(size => editor.isActive('textStyle', { fontSize: size }))
  const nextIndex = Math.min(Math.max((current === -1 ? 1 : current) + direction, 0), fontSizes.length - 1)
  editor.chain().focus().setFontSize(fontSizes[nextIndex]).run()
}

function getOutline(editor: Editor): OutlineItem[] {
  const items: OutlineItem[] = []

  editor.state.doc.descendants((node, pos) => {
    if (node.type.name !== 'heading') return
    const text = node.textContent.trim()
    if (!text) return
    items.push({ id: `${pos}-${text}`, level: node.attrs.level || 2, text })
  })

  return items
}

function scrollHeadingIntoView(text: string) {
  const headings = Array.from(document.querySelectorAll('.rich-editor .ProseMirror h1, .rich-editor .ProseMirror h2, .rich-editor .ProseMirror h3, .rich-editor .ProseMirror h4'))
  const match = headings.find(heading => heading.textContent?.trim() === text)
  match?.scrollIntoView({ block: 'center', behavior: 'smooth' })
}

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function formatInlineMarkdown(value: string) {
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
}

const selectClassName = 'h-8 rounded-lg border-0 bg-transparent px-2 text-[11px] font-semibold text-slate-700 outline-none transition hover:bg-slate-100 focus:bg-slate-100 disabled:opacity-40'
