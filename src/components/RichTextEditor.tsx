"use client"

import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { Extension, type Editor } from '@tiptap/core'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
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
  documentTitle?: string
}

type FontSizeOptions = {
  types: string[]
}

type EditorMode = 'compact' | 'focus'

const FontSize = Extension.create<FontSizeOptions>({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle']
    }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize?.replace(/['"]+/g, '') || null,
            renderHTML: attributes => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}` }
            }
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

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (fontSize: string) => ReturnType
      unsetFontSize: () => ReturnType
    }
  }
}

const colorSwatches = ['#0F172A', '#475569', '#0891B2', '#0F766E', '#BE185D', '#B45309']
const highlightSwatches = ['#BAE6FD', '#CCFBF1', '#FCE7F3', '#FEF3C7', '#E9D5FF']
const fontSizes = [
  { label: 'Normal', value: '' },
  { label: 'Small', value: '0.875rem' },
  { label: 'Lead', value: '1.125rem' },
  { label: 'Large', value: '1.375rem' }
]

export default function RichTextEditor({ value, onChange, onUploadImage, documentTitle }: RichTextEditorProps) {
  const [sourceMode, setSourceMode] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3]
        }
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      FontSize,
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
        HTMLAttributes: {
          loading: 'lazy'
        }
      }),
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
      onChange(editor.getHTML())
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
    if (!focusMode) return
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setFocusMode(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [focusMode])

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

  if (!editor) {
    return (
      <div className="min-h-[560px] rounded-[24px] border border-white/10 bg-black/20 p-5 text-sm text-slate-400">
        Loading editor...
      </div>
    )
  }

  const stats = getTextStats(editor.getText())
  const title = documentTitle?.trim() || 'Untitled article'
  const shell = (
    <EditorShell
      editor={editor}
      mode={focusMode ? 'focus' : 'compact'}
      sourceMode={sourceMode}
      title={title}
      stats={stats}
      value={value}
      uploading={uploading}
      hasUploader={Boolean(onUploadImage)}
      fileInputRef={fileInputRef}
      onSourceChange={onChange}
      onToggleSource={() => setSourceMode(current => !current)}
      onToggleFocus={() => setFocusMode(current => !current)}
      onSetLink={setLink}
      onAddImageByUrl={addImageByUrl}
      onUploadImage={uploadImage}
    />
  )

  if (focusMode && mounted) {
    return (
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
    )
  }

  return shell
}

function EditorShell({
  editor,
  mode,
  sourceMode,
  title,
  stats,
  value,
  uploading,
  hasUploader,
  fileInputRef,
  onSourceChange,
  onToggleSource,
  onToggleFocus,
  onSetLink,
  onAddImageByUrl,
  onUploadImage
}: {
  editor: Editor
  mode: EditorMode
  sourceMode: boolean
  title: string
  stats: { words: number; characters: number }
  value: string
  uploading: boolean
  hasUploader: boolean
  fileInputRef: RefObject<HTMLInputElement | null>
  onSourceChange: (html: string) => void
  onToggleSource: () => void
  onToggleFocus: () => void
  onSetLink: () => void
  onAddImageByUrl: () => void
  onUploadImage: (file?: File) => Promise<void>
}) {
  return (
    <div
      className={cn(
        'overflow-hidden border border-white/10 bg-[#111827] shadow-[0_28px_120px_-80px_rgba(6,182,212,0.8)]',
        mode === 'focus' ? 'flex h-screen flex-col rounded-none' : 'rounded-[24px]'
      )}
    >
      <div className="border-b border-slate-200/80 bg-slate-50 text-slate-950">
        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-700">Document editor</p>
            <h3 className="mt-1 truncate text-sm font-semibold text-slate-950 sm:text-base">{title}</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1">{stats.words} words</span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1">{stats.characters} chars</span>
            <MicroButton
              type="button"
              onClick={onToggleFocus}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
            >
              {mode === 'focus' ? 'Done' : 'Focus mode'}
            </MicroButton>
          </div>
        </div>

        <EditorToolbar
          editor={editor}
          sourceMode={sourceMode}
          uploading={uploading}
          hasUploader={hasUploader}
          fileInputRef={fileInputRef}
          onToggleSource={onToggleSource}
          onSetLink={onSetLink}
          onAddImageByUrl={onAddImageByUrl}
          onUploadImage={onUploadImage}
        />
      </div>

      <div className={cn('rich-editor-workspace', mode === 'focus' ? 'flex-1' : 'h-[620px]')}>
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
  )
}

function EditorToolbar({
  editor,
  sourceMode,
  uploading,
  hasUploader,
  fileInputRef,
  onToggleSource,
  onSetLink,
  onAddImageByUrl,
  onUploadImage
}: {
  editor: Editor
  sourceMode: boolean
  uploading: boolean
  hasUploader: boolean
  fileInputRef: RefObject<HTMLInputElement | null>
  onToggleSource: () => void
  onSetLink: () => void
  onAddImageByUrl: () => void
  onUploadImage: (file?: File) => Promise<void>
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-slate-200/80 px-3 py-2">
      <ToolbarGroup>
        <ToolbarButton label="Undo" disabled={sourceMode || !editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>Undo</ToolbarButton>
        <ToolbarButton label="Redo" disabled={sourceMode || !editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>Redo</ToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <select
          value={editor.isActive('heading', { level: 2 }) ? 'h2' : editor.isActive('heading', { level: 3 }) ? 'h3' : 'p'}
          onChange={event => {
            const value = event.target.value
            if (value === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run()
            else if (value === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run()
            else editor.chain().focus().setParagraph().run()
          }}
          className={selectClassName}
          aria-label="Text style"
          disabled={sourceMode}
        >
          <option value="p">Paragraph</option>
          <option value="h2">Heading</option>
          <option value="h3">Subheading</option>
        </select>

        <select
          value={fontSizes.find(size => size.value && editor.isActive('textStyle', { fontSize: size.value }))?.value || ''}
          onChange={event => {
            const size = event.target.value
            if (size) editor.chain().focus().setFontSize(size).run()
            else editor.chain().focus().unsetFontSize().run()
          }}
          className={cn(selectClassName, 'w-[92px]')}
          aria-label="Font size"
          disabled={sourceMode}
        >
          {fontSizes.map(size => (
            <option key={size.label} value={size.value}>{size.label}</option>
          ))}
        </select>
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton label="Bold" active={editor.isActive('bold')} disabled={sourceMode} onClick={() => editor.chain().focus().toggleBold().run()}>B</ToolbarButton>
        <ToolbarButton label="Italic" active={editor.isActive('italic')} disabled={sourceMode} onClick={() => editor.chain().focus().toggleItalic().run()}>I</ToolbarButton>
        <ToolbarButton label="Underline" active={editor.isActive('underline')} disabled={sourceMode} onClick={() => editor.chain().focus().toggleUnderline().run()}>U</ToolbarButton>
        <ToolbarButton label="Inline code" active={editor.isActive('code')} disabled={sourceMode} onClick={() => editor.chain().focus().toggleCode().run()}>{`<>`}</ToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton label="Bullet list" active={editor.isActive('bulletList')} disabled={sourceMode} onClick={() => editor.chain().focus().toggleBulletList().run()}>Bullets</ToolbarButton>
        <ToolbarButton label="Numbered list" active={editor.isActive('orderedList')} disabled={sourceMode} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1.</ToolbarButton>
        <ToolbarButton label="Quote" active={editor.isActive('blockquote')} disabled={sourceMode} onClick={() => editor.chain().focus().toggleBlockquote().run()}>Quote</ToolbarButton>
        <ToolbarButton label="Code block" active={editor.isActive('codeBlock')} disabled={sourceMode} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>{`{ }`}</ToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton label="Align left" active={editor.isActive({ textAlign: 'left' })} disabled={sourceMode} onClick={() => editor.chain().focus().setTextAlign('left').run()}>Left</ToolbarButton>
        <ToolbarButton label="Align center" active={editor.isActive({ textAlign: 'center' })} disabled={sourceMode} onClick={() => editor.chain().focus().setTextAlign('center').run()}>Center</ToolbarButton>
        <ToolbarButton label="Align right" active={editor.isActive({ textAlign: 'right' })} disabled={sourceMode} onClick={() => editor.chain().focus().setTextAlign('right').run()}>Right</ToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton label="Add link" active={editor.isActive('link')} disabled={sourceMode} onClick={onSetLink}>Link</ToolbarButton>
        <ToolbarButton label="Image from URL" disabled={sourceMode} onClick={onAddImageByUrl}>Image URL</ToolbarButton>
        {hasUploader ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={event => onUploadImage(event.target.files?.[0])}
            />
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
        <ToolbarButton label={sourceMode ? 'Visual editor' : 'HTML source'} active={sourceMode} onClick={onToggleSource}>
          {sourceMode ? 'Visual' : 'HTML'}
        </ToolbarButton>
      </ToolbarGroup>
    </div>
  )
}

function ToolbarGroup({ children }: { children: ReactNode }) {
  return <div className="flex min-h-9 max-w-full flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-white px-1.5 py-1 shadow-sm">{children}</div>
}

function ToolbarButton({
  children,
  label,
  active,
  disabled,
  onClick
}: {
  children: ReactNode
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
}) {
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

function Swatches({
  label,
  swatches,
  disabled,
  onPick
}: {
  label: string
  swatches: string[]
  disabled?: boolean
  onPick: (color: string) => void
}) {
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
  return {
    words: trimmed ? trimmed.split(/\s+/).length : 0,
    characters: text.replace(/\s/g, '').length
  }
}

const selectClassName = 'h-8 rounded-lg border-0 bg-transparent px-2 text-[11px] font-semibold text-slate-700 outline-none transition hover:bg-slate-100 focus:bg-slate-100 disabled:opacity-40'
