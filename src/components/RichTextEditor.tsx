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

export default function RichTextEditor({ value, onChange, onUploadImage, onSave, autoSaveKey, documentTitle }: RichTextEditorProps) {
  const [sourceMode, setSourceMode] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [insertMenuOpen, setInsertMenuOpen] = useState(false)
  const [diagramOpen, setDiagramOpen] = useState(false)
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
                    <MicroButton type="button" onClick={insertDiagram} className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950">
                      Insert into post
                    </MicroButton>
                    <MicroButton type="button" onClick={() => setDiagramOpen(false)} className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-slate-200">
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
  onOpenDiagram
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
}) {
  return (
    <div
      className={cn(
        'overflow-hidden border border-white/10 bg-[#111827] shadow-[0_28px_120px_-80px_rgba(6,182,212,0.8)]',
        mode === 'focus' ? 'flex h-screen flex-col rounded-none' : 'rounded-[24px]'
      )}
    >
      <div className="border-b border-slate-200/80 bg-slate-50 text-slate-950">
        <div className="flex min-h-12 items-center gap-2 border-b border-slate-200 px-3 text-[12px] font-semibold text-slate-700">
          <MenuButton onClick={onToggleInsertMenu}>Insert</MenuButton>
          <MenuButton onClick={() => editor.chain().focus().undo().run()} disabled={sourceMode || !editor.can().undo()}>Undo</MenuButton>
          <MenuButton onClick={() => editor.chain().focus().redo().run()} disabled={sourceMode || !editor.can().redo()}>Redo</MenuButton>
          <MenuButton onClick={onSave}>Save</MenuButton>
          <span className="ml-auto truncate text-slate-500">{title}</span>
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
  onOpenDiagram
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
    <div className="relative flex flex-wrap items-center gap-2 px-3 py-2">
      {insertMenuOpen ? (
        <div className="absolute left-3 top-11 z-20 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 text-sm shadow-2xl">
          <InsertButton onClick={() => { editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); onCloseInsertMenu() }}>Table</InsertButton>
          <InsertButton onClick={() => { editor.chain().focus().toggleCodeBlock().run(); onCloseInsertMenu() }}>Code block</InsertButton>
          <InsertButton onClick={() => { editor.chain().focus().toggleBlockquote().run(); onCloseInsertMenu() }}>Blockquote</InsertButton>
          <InsertButton onClick={() => { editor.chain().focus().setHorizontalRule().run(); onCloseInsertMenu() }}>Divider</InsertButton>
          <InsertButton onClick={insertCallout}>Callout box</InsertButton>
          <InsertButton onClick={insertToc}>Table of contents</InsertButton>
          <InsertButton onClick={() => { onOpenDiagram(); onCloseInsertMenu() }}>System design diagram</InsertButton>
        </div>
      ) : null}

      <ToolbarGroup>
        <ToolbarButton label="Undo" disabled={sourceMode || !editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>Undo</ToolbarButton>
        <ToolbarButton label="Redo" disabled={sourceMode || !editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>Redo</ToolbarButton>
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
        <ToolbarButton label="Smaller text" disabled={sourceMode} onClick={() => setRelativeFontSize(editor, -1)}>-</ToolbarButton>
        <span className="w-12 text-center text-[11px] font-semibold text-slate-600">{activeSize.replace('rem', '')}</span>
        <ToolbarButton label="Larger text" disabled={sourceMode} onClick={() => setRelativeFontSize(editor, 1)}>+</ToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton label="Bold" active={editor.isActive('bold')} disabled={sourceMode} onClick={() => editor.chain().focus().toggleBold().run()}>B</ToolbarButton>
        <ToolbarButton label="Italic" active={editor.isActive('italic')} disabled={sourceMode} onClick={() => editor.chain().focus().toggleItalic().run()}>I</ToolbarButton>
        <ToolbarButton label="Underline" active={editor.isActive('underline')} disabled={sourceMode} onClick={() => editor.chain().focus().toggleUnderline().run()}>U</ToolbarButton>
        <ToolbarButton label="Strikethrough" active={editor.isActive('strike')} disabled={sourceMode} onClick={() => editor.chain().focus().toggleStrike().run()}>S</ToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton label="Bullet list" active={editor.isActive('bulletList')} disabled={sourceMode} onClick={() => editor.chain().focus().toggleBulletList().run()}>Bullets</ToolbarButton>
        <ToolbarButton label="Numbered list" active={editor.isActive('orderedList')} disabled={sourceMode} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1.</ToolbarButton>
        <ToolbarButton label="Checklist" active={editor.isActive('taskList')} disabled={sourceMode} onClick={() => editor.chain().focus().toggleTaskList().run()}>Check</ToolbarButton>
        <ToolbarButton label="Outdent" disabled={sourceMode} onClick={() => editor.chain().focus().liftListItem('listItem').liftListItem('taskItem').run()}>Out</ToolbarButton>
        <ToolbarButton label="Indent" disabled={sourceMode} onClick={() => editor.chain().focus().sinkListItem('listItem').sinkListItem('taskItem').run()}>In</ToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton label="Align left" active={editor.isActive({ textAlign: 'left' })} disabled={sourceMode} onClick={() => editor.chain().focus().setTextAlign('left').run()}>Left</ToolbarButton>
        <ToolbarButton label="Align center" active={editor.isActive({ textAlign: 'center' })} disabled={sourceMode} onClick={() => editor.chain().focus().setTextAlign('center').run()}>Center</ToolbarButton>
        <ToolbarButton label="Align right" active={editor.isActive({ textAlign: 'right' })} disabled={sourceMode} onClick={() => editor.chain().focus().setTextAlign('right').run()}>Right</ToolbarButton>
        <ToolbarButton label="Justify" active={editor.isActive({ textAlign: 'justify' })} disabled={sourceMode} onClick={() => editor.chain().focus().setTextAlign('justify').run()}>Justify</ToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton label="Add link" active={editor.isActive('link')} disabled={sourceMode} onClick={onSetLink}>Link</ToolbarButton>
        <ToolbarButton label="Image from URL" disabled={sourceMode} onClick={onAddImageByUrl}>Image URL</ToolbarButton>
        {hasUploader ? (
          <>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={event => onUploadImage(event.target.files?.[0])} />
            <ToolbarButton label="Upload image" disabled={sourceMode || uploading} onClick={() => fileInputRef.current?.click()}>
              {uploading ? 'Uploading' : 'Upload'}
            </ToolbarButton>
          </>
        ) : null}
      </ToolbarGroup>

      <ToolbarGroup>
        <Swatches label="Text color" swatches={colorSwatches} disabled={sourceMode} onPick={color => editor.chain().focus().setColor(color).run()} />
        <Swatches label="Highlight" swatches={highlightSwatches} disabled={sourceMode} onPick={color => editor.chain().focus().toggleHighlight({ color }).run()} />
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton label="Clear formatting" disabled={sourceMode} onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>Clear</ToolbarButton>
        <ToolbarButton label={sourceMode ? 'Visual editor' : 'HTML source'} active={sourceMode} onClick={onToggleSource}>{sourceMode ? 'Visual' : 'HTML'}</ToolbarButton>
        <ToolbarButton label="Focus mode" onClick={onToggleFocus}>Focus</ToolbarButton>
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

function ToolbarGroup({ children }: { children: ReactNode }) {
  return <div className="flex min-h-9 max-w-full flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-white px-1.5 py-1 shadow-sm">{children}</div>
}

function ToolbarButton({ children, label, active, disabled, onClick }: { children: ReactNode; label: string; active?: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <MicroButton
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-[11px] font-semibold text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-35',
        active ? 'bg-cyan-100 text-cyan-800' : 'hover:bg-slate-100 hover:text-cyan-800'
      )}
    >
      {children}
    </MicroButton>
  )
}

function MenuButton({ children, disabled, onClick }: { children: ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <MicroButton type="button" disabled={disabled} onClick={onClick} className="rounded-md px-2 py-1 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40">
      {children}
    </MicroButton>
  )
}

function InsertButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="block w-full px-4 py-2 text-left font-semibold text-slate-700 transition hover:bg-cyan-50 hover:text-cyan-800">
      {children}
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
          title={`${label}: ${color}`}
          aria-label={`${label}: ${color}`}
          disabled={disabled}
          onClick={() => onPick(color)}
          className="h-6 w-6 rounded-md border border-slate-300 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  )
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
