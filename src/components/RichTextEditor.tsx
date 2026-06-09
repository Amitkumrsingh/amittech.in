"use client"

import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
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
import { EditorContent, useEditor } from '@tiptap/react'
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
  Clipboard,
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
  X,
  type LucideIcon
} from 'lucide-react'
import { createPortal } from 'react-dom'
import { cn } from '../lib/classes'
import MicroButton from './MicroButton'

type RichTextEditorProps = {
  value: string
  onChange: (html: string) => void
  onUploadImage?: (file: File) => Promise<string>
  onSave?: () => Promise<void> | void
  autoSaveKey?: string
  documentTitle?: string
  postId?: string
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

type AiImageResult = {
  imageDataUrl?: string
  mimeType?: string
  prompt?: string
  text?: string
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

export default function RichTextEditor({ value, onChange, onUploadImage, onSave, autoSaveKey, documentTitle, postId, aiContext, onApplyAiMetadata }: RichTextEditorProps) {
  const [sourceMode, setSourceMode] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [insertMenuOpen, setInsertMenuOpen] = useState(false)
  const [diagramOpen, setDiagramOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiImageLoading, setAiImageLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [aiResult, setAiResult] = useState<AiResult | null>(null)
  const [aiDraftHtml, setAiDraftHtml] = useState('')
  const [aiImage, setAiImage] = useState<AiImageResult | null>(null)
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
      }
    },
    onUpdate({ editor }) {
      setSaveState('pending')
      setRevision(current => current + 1)
      onChange(editor.getHTML())
    },
    onSelectionUpdate() {
      setRevision(current => current + 1)
    }
  })

  useEffect(() => {
    setMounted(true)
  }, [])

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

  function getSelectedText() {
    if (!editor) return ''
    const { from, to } = editor.state.selection
    return editor.state.doc.textBetween(from, to, '\n').trim()
  }

  async function runAi(nextAction = aiForm.action) {
    if (!editor) return
    setAiLoading(true)
    setAiError('')
    try {
      const response = await fetch(`/api/ai/${nextAction}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          postId,
          topic: aiForm.topic || aiContext?.title || documentTitle,
          targetAudience: aiForm.targetAudience,
          tone: aiForm.tone,
          category: aiForm.category || aiContext?.category,
          keywords: aiForm.keywords,
          notes: aiForm.notes,
          desiredLength: aiForm.desiredLength,
          selectedText: getSelectedText(),
          title: aiContext?.title || documentTitle,
          excerpt: aiContext?.excerpt,
          html: value,
          contentText: editor.getText()
        })
      })
      const payload = await response.json() as { ok: boolean; error?: string; data?: { result: AiResult } }
      if (!response.ok || !payload.ok) throw new Error(payload.error || 'AI request failed')
      const result = payload.data?.result || null
      setAiResult(result)
      setAiDraftHtml(result ? aiResultToDraftHtml(result) : '')
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'AI request failed')
    } finally {
      setAiLoading(false)
    }
  }

  async function runAiImage() {
    if (!editor) return
    const prompt = aiResult?.coverImagePrompt || aiForm.notes || aiForm.topic || aiContext?.title || documentTitle || editor.getText().slice(0, 400)
    setAiImageLoading(true)
    setAiError('')
    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          postId,
          topic: aiForm.topic || aiContext?.title || documentTitle,
          category: aiForm.category || aiContext?.category,
          notes: prompt,
          title: aiContext?.title || documentTitle,
          contentText: editor.getText()
        })
      })
      const payload = await response.json() as { ok: boolean; error?: string; data?: { result: AiImageResult } }
      if (!response.ok || !payload.ok) throw new Error(payload.error || 'Image generation failed')
      setAiImage(payload.data?.result || null)
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Image generation failed')
    } finally {
      setAiImageLoading(false)
    }
  }

  function insertAiResult(mode: 'insert' | 'append' | 'replace') {
    if (!editor) return
    const html = aiDraftHtml.trim()
    if (!html.trim()) return

    if (mode === 'replace') {
      const selectedText = getSelectedText()
      if (!selectedText) {
        setAiError('Select text in the editor before replacing it.')
        return
      }
      if (!window.confirm('Replace the selected text with this AI draft? Please review it before publishing.')) return
      editor.chain().focus().insertContent(html).run()
      return
    }

    if (mode === 'append') {
      editor.chain().focus().setTextSelection(editor.state.doc.content.size).insertContent(html).run()
      return
    }

    editor.chain().focus().insertContent(html).run()
  }

  async function copyAiResult() {
    if (!aiResult && !aiDraftHtml) return
    await navigator.clipboard.writeText(htmlToPlainText(aiDraftHtml) || (aiResult ? aiResultToPlainText(aiResult) : ''))
  }

  async function insertAiImage() {
    if (!editor || !aiImage?.imageDataUrl) return
    const blob = await fetch(aiImage.imageDataUrl).then(response => response.blob())
    const file = new File([blob], `ai-cover-${Date.now()}.${(aiImage.mimeType || 'image/png').split('/')[1] || 'png'}`, { type: aiImage.mimeType || 'image/png' })

    if (onUploadImage) {
      await uploadImage(file)
      return
    }

    editor.chain().focus().setImage({ src: aiImage.imageDataUrl }).run()
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
      onOpenDiagram={() => setDiagramOpen(true)}
      onOpenAi={() => setAiOpen(true)}
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
            <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/80 p-3 backdrop-blur" role="dialog" aria-modal="true" aria-label="Excalidraw diagram editor">
              <div className="flex h-[90vh] w-[95vw] flex-col overflow-hidden rounded-2xl border border-white/15 bg-slate-950 shadow-2xl">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300">System design diagram</p>
                    <h3 className="mt-1 text-sm font-semibold">Excalidraw workspace</h3>
                  </div>
                  <div className="flex gap-2">
                    <MicroButton type="button" onClick={insertDiagram} className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950">
                      <Columns3 size={15} />
                      Insert into post
                    </MicroButton>
                    <MicroButton type="button" onClick={() => setDiagramOpen(false)} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-slate-200">
                      <X size={15} />
                      Close
                    </MicroButton>
                  </div>
                </div>
                <iframe title="Excalidraw" src="https://excalidraw.com" className="min-h-0 flex-1 bg-white" />
              </div>
            </div>,
            document.body
          )
        : null}
      {aiOpen && mounted
        ? createPortal(
            <AiAssistantModal
              form={aiForm}
              result={aiResult}
              draftHtml={aiDraftHtml}
              image={aiImage}
              loading={aiLoading}
              imageLoading={aiImageLoading}
              error={aiError}
              selectedText={getSelectedText()}
              canApplyMetadata={Boolean(onApplyAiMetadata)}
              onChange={setAiForm}
              onDraftChange={setAiDraftHtml}
              onRun={runAi}
              onGenerateImage={runAiImage}
              onInsert={() => insertAiResult('insert')}
              onAppend={() => insertAiResult('append')}
              onReplace={() => insertAiResult('replace')}
              onInsertImage={insertAiImage}
              onCopy={copyAiResult}
              onApplyMetadata={applyAiMetadata}
              onClose={() => setAiOpen(false)}
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
  onOpenAi
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
              className="toolbar-tooltip inline-flex h-9 items-center gap-2 rounded-lg border border-fuchsia-200 bg-fuchsia-50 px-3 text-xs font-bold text-fuchsia-800 transition hover:bg-fuchsia-100"
              data-tooltip="Ask AI"
            >
              <WandSparkles size={16} />
              Ask AI
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

  return (
    <div className="relative flex flex-wrap items-center gap-1.5 border-b border-slate-200/70 px-3 py-2 shadow-[0_8px_18px_-18px_rgba(15,23,42,.8)]">
      {insertMenuOpen ? (
        <div className="absolute left-3 top-12 z-20 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 text-sm shadow-2xl">
          <InsertButton icon={Table2} onClick={() => { editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); onCloseInsertMenu() }}>Table</InsertButton>
          <InsertButton icon={Code2} onClick={() => { editor.chain().focus().toggleCodeBlock().run(); onCloseInsertMenu() }}>Code block</InsertButton>
          <InsertButton icon={Quote} onClick={() => { editor.chain().focus().toggleBlockquote().run(); onCloseInsertMenu() }}>Blockquote</InsertButton>
          <InsertButton icon={Minus} onClick={() => { editor.chain().focus().setHorizontalRule().run(); onCloseInsertMenu() }}>Divider</InsertButton>
          <InsertButton icon={Highlighter} onClick={insertCallout}>Callout box</InsertButton>
          <InsertButton icon={ListOrdered} onClick={insertToc}>Table of contents</InsertButton>
          <InsertButton icon={Columns3} onClick={() => { onOpenDiagram(); onCloseInsertMenu() }}>System design diagram</InsertButton>
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
        <ToolbarButton icon={Sparkles} label="Ask AI" disabled={sourceMode} onClick={onOpenAi} />
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

function AiAssistantModal({
  form,
  result,
  draftHtml,
  image,
  loading,
  imageLoading,
  error,
  selectedText,
  canApplyMetadata,
  onChange,
  onDraftChange,
  onRun,
  onGenerateImage,
  onInsert,
  onAppend,
  onReplace,
  onInsertImage,
  onCopy,
  onApplyMetadata,
  onClose
}: {
  form: AiForm
  result: AiResult | null
  draftHtml: string
  image: AiImageResult | null
  loading: boolean
  imageLoading: boolean
  error: string
  selectedText: string
  canApplyMetadata: boolean
  onChange: (form: AiForm) => void
  onDraftChange: (html: string) => void
  onRun: (action?: AiAction) => Promise<void>
  onGenerateImage: () => Promise<void>
  onInsert: () => void
  onAppend: () => void
  onReplace: () => void
  onInsertImage: () => Promise<void>
  onCopy: () => Promise<void>
  onApplyMetadata: () => void
  onClose: () => void
}) {
  const actions: Array<{ label: string; value: AiAction }> = [
    { label: 'Generate Draft', value: 'generate-draft' },
    { label: 'Improve Selected Text', value: 'rewrite' },
    { label: 'Generate SEO', value: 'seo' },
    { label: 'Title Ideas', value: 'title-ideas' },
    { label: 'Tags', value: 'tags' },
    { label: 'Excerpt', value: 'excerpt' },
    { label: 'LinkedIn Post', value: 'linkedin-post' },
    { label: 'Cover Image Prompt', value: 'image-prompt' },
    { label: 'Format Content', value: 'format-content' }
  ]

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/70 p-3 backdrop-blur" role="dialog" aria-modal="true" aria-label="AI writing assistant">
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-slate-950 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-fuchsia-400/15 text-fuchsia-200">
              <WandSparkles size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-fuchsia-300">AI writing assistant</p>
              <h3 className="mt-1 text-sm font-semibold">Draft helper, never auto-publish</h3>
            </div>
          </div>
          <MicroButton type="button" onClick={onClose} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-slate-200">
            <X size={15} />
            Close
          </MicroButton>
        </div>

        <div className="grid min-h-0 flex-1 gap-0 overflow-hidden lg:grid-cols-[360px_1fr]">
          <div className="min-h-0 overflow-y-auto border-r border-white/10 p-4">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Action</span>
              <select
                value={form.action}
                onChange={event => onChange({ ...form, action: event.target.value as AiAction })}
                className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white"
              >
                {actions.map(action => <option key={action.value} value={action.value}>{action.label}</option>)}
              </select>
            </label>

            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Quick presets</p>
              <div className="grid grid-cols-2 gap-2">
                <PresetButton onClick={() => onChange({ ...form, action: 'rewrite', tone: 'Human, natural, practical', notes: `${form.notes}\nHumanize the selected text without making it casual or vague.`.trim() })}>Humanize</PresetButton>
                <PresetButton onClick={() => onChange({ ...form, action: 'rewrite', tone: 'More technical, precise, senior engineer', notes: `${form.notes}\nMake the selected text more technical and precise, but keep it readable.`.trim() })}>Technical</PresetButton>
                <PresetButton onClick={() => onChange({ ...form, action: 'rewrite', tone: 'Simple, clear, not shallow', notes: `${form.notes}\nSimplify the explanation without removing important engineering nuance.`.trim() })}>Simplify</PresetButton>
                <PresetButton onClick={() => onChange({ ...form, action: 'linkedin-post', tone: 'LinkedIn engineering post, direct, experience-backed' })}>LinkedIn</PresetButton>
                <PresetButton onClick={() => onChange({ ...form, action: 'rewrite', desiredLength: 'Expanded', notes: `${form.notes}\nExpand the selected paragraph with practical context, tradeoffs, and examples. Do not invent metrics.`.trim() })}>Expand</PresetButton>
                <PresetButton onClick={() => onChange({ ...form, action: 'format-content', notes: `${form.notes}\nFormat for readability with clear sections, short paragraphs, and scannable flow.`.trim() })}>Format</PresetButton>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              <AiInput label="Topic" value={form.topic} onChange={topic => onChange({ ...form, topic })} placeholder="Kafka retries, idempotency, system design..." />
              <AiInput label="Audience" value={form.targetAudience} onChange={targetAudience => onChange({ ...form, targetAudience })} />
              <AiInput label="Tone" value={form.tone} onChange={tone => onChange({ ...form, tone })} />
              <AiInput label="Category" value={form.category} onChange={category => onChange({ ...form, category })} />
              <AiInput label="Keywords" value={form.keywords} onChange={keywords => onChange({ ...form, keywords })} placeholder="Kafka, retries, backend" />
              <AiInput label="Length" value={form.desiredLength} onChange={desiredLength => onChange({ ...form, desiredLength })} />
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Rough notes</span>
                <textarea
                  value={form.notes}
                  onChange={event => onChange({ ...form, notes: event.target.value })}
                  rows={5}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm leading-6 text-white placeholder:text-slate-600"
                  placeholder="Paste rough bullets, context, constraints, or personal notes."
                />
              </label>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.035] p-3 text-xs leading-5 text-slate-400">
              <p className="font-semibold text-slate-300">Selected text</p>
              <p className="mt-1 line-clamp-4">{selectedText || 'Select text in the editor to rewrite or replace it.'}</p>
            </div>

            <div className="mt-4 flex gap-2">
              <MicroButton
                type="button"
                onClick={() => onRun(form.action)}
                disabled={loading}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-fuchsia-300 px-4 text-sm font-bold text-slate-950 transition hover:bg-fuchsia-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Sparkles size={16} />
                {loading ? 'Generating...' : 'Generate'}
              </MicroButton>
              <MicroButton
                type="button"
                onClick={() => onRun(form.action)}
                disabled={loading || !result}
                className="toolbar-tooltip grid min-h-11 w-11 place-items-center rounded-xl border border-white/10 text-slate-200 transition hover:border-fuchsia-300/50 hover:text-fuchsia-200 disabled:opacity-45"
                data-tooltip="Regenerate"
              >
                <RefreshCw size={16} />
              </MicroButton>
            </div>
            {error ? <p className="mt-3 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</p> : null}
          </div>

          <div className="flex min-h-0 flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Generated draft</p>
              <div className="flex flex-wrap gap-2">
                <AiActionButton onClick={onInsert} disabled={!draftHtml}>Insert</AiActionButton>
                <AiActionButton onClick={onAppend} disabled={!draftHtml}>Append</AiActionButton>
                <AiActionButton onClick={onReplace} disabled={!draftHtml}>Replace selection</AiActionButton>
                <AiActionButton onClick={onCopy} disabled={!draftHtml && !result} icon={Clipboard}>Copy</AiActionButton>
                {canApplyMetadata ? <AiActionButton onClick={onApplyMetadata} disabled={!result}>Apply metadata</AiActionButton> : null}
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {draftHtml || result ? (
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-white">
                    <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      Editable article body
                    </div>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="ai-draft-editor min-h-[460px] px-8 py-7 text-slate-950 outline-none"
                      dangerouslySetInnerHTML={{ __html: draftHtml || '<p></p>' }}
                      onInput={event => onDraftChange(event.currentTarget.innerHTML)}
                    />
                  </div>
                  <div className="space-y-4">
                    <AiMetadataPreview result={result} />
                    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-fuchsia-300">Image</p>
                        <MicroButton
                          type="button"
                          onClick={onGenerateImage}
                          disabled={imageLoading}
                          className="inline-flex items-center gap-2 rounded-lg border border-fuchsia-300/30 px-3 py-1.5 text-xs font-semibold text-fuchsia-100 transition hover:bg-fuchsia-300/10 disabled:opacity-50"
                        >
                          <ImagePlus size={14} />
                          {imageLoading ? 'Generating...' : 'Generate'}
                        </MicroButton>
                      </div>
                      {image?.imageDataUrl ? (
                        <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-black/30">
                          <img src={image.imageDataUrl} alt={image.prompt || 'AI generated blog cover'} className="aspect-video w-full object-cover" />
                          <div className="flex flex-wrap gap-2 p-3">
                            <AiActionButton onClick={onInsertImage}>Insert image</AiActionButton>
                            <AiActionButton onClick={() => navigator.clipboard.writeText(image.prompt || '')} icon={Clipboard}>Copy prompt</AiActionButton>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 rounded-xl border border-dashed border-white/10 p-4 text-sm leading-6 text-slate-400">
                          {image?.text || result?.coverImagePrompt || 'Generate a cover image preview here, or copy the image prompt from metadata.'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid min-h-[360px] place-items-center rounded-2xl border border-dashed border-white/10 bg-white/[0.025] p-8 text-center">
                  <div>
                    <WandSparkles className="mx-auto text-fuchsia-300" size={30} />
                    <h4 className="mt-4 font-display text-2xl font-semibold text-white">Ask Gemini for a draft assist.</h4>
                    <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400">
                      Output appears here first. You choose whether to insert, append, replace selected text, copy, or discard.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AiInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</span>
      <input
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-10 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white placeholder:text-slate-600"
      />
    </label>
  )
}

function PresetButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <MicroButton
      type="button"
      onClick={onClick}
      className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-fuchsia-300/40 hover:text-fuchsia-200"
    >
      {children}
    </MicroButton>
  )
}

function AiActionButton({ children, icon: Icon, disabled, onClick }: { children: ReactNode; icon?: LucideIcon; disabled?: boolean; onClick: () => void | Promise<void> }) {
  return (
    <MicroButton
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-fuchsia-300/50 hover:text-fuchsia-200 disabled:cursor-not-allowed disabled:opacity-45"
    >
      {Icon ? <Icon size={14} /> : null}
      {children}
    </MicroButton>
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

function aiBlocksToHtml(blocks: AiBlock[] = []) {
  return blocks.map(block => {
    if (block.type === 'heading') {
      const level = Math.min(Math.max(block.level || 2, 1), 4)
      return `<h${level}>${escapeHtml(block.text || '')}</h${level}>`
    }
    if (block.type === 'blockquote') return `<blockquote><p>${escapeHtml(block.text || '')}</p></blockquote>`
    if (block.type === 'code') return `<pre><code>${escapeHtml(block.text || '')}</code></pre>`
    if (block.type === 'list') {
      const items = (block.items || []).map(item => `<li>${escapeHtml(item)}</li>`).join('')
      return `<ul>${items}</ul>`
    }
    return `<p>${escapeHtml(block.text || '')}</p>`
  }).join('')
}

function textToParagraphs(text = '') {
  return text
    .split(/\n{2,}/)
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => `<p>${escapeHtml(part).replace(/\n/g, '<br>')}</p>`)
    .join('')
}

function aiResultToDraftHtml(result: AiResult) {
  if (result.content?.length) return aiBlocksToHtml(result.content)

  const jsonFromPlainText = parseAiJsonText(result.plainText || result.markdown || '')
  if (jsonFromPlainText?.content?.length) return aiBlocksToHtml(jsonFromPlainText.content)

  const parts = [
    result.plainText ? textToParagraphs(result.plainText) : '',
    result.markdown ? `<pre><code>${escapeHtml(result.markdown)}</code></pre>` : '',
    result.linkedinPost ? `<blockquote><p>${escapeHtml(result.linkedinPost).replace(/\n/g, '<br>')}</p></blockquote>` : '',
    result.summary ? `<p><strong>Summary:</strong> ${escapeHtml(result.summary)}</p>` : ''
  ]

  return parts.filter(Boolean).join('')
}

function parseAiJsonText(text: string): AiResult | null {
  const trimmed = text.trim()
  if (!trimmed.startsWith('{')) return null
  try {
    return JSON.parse(trimmed) as AiResult
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/)
    if (!match) return null
    try {
      return JSON.parse(match[0]) as AiResult
    } catch {
      return null
    }
  }
}

function htmlToPlainText(html: string) {
  if (typeof window === 'undefined') return html
  const element = document.createElement('div')
  element.innerHTML = html
  return element.textContent?.trim() || ''
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

const selectClassName = 'h-8 rounded-lg border-0 bg-transparent px-2 text-[11px] font-semibold text-slate-700 outline-none transition hover:bg-slate-100 focus:bg-slate-100 disabled:opacity-40'
