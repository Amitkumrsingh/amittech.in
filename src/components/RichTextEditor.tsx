"use client"

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Extension } from '@tiptap/core'
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
import { cn } from '../lib/classes'
import MicroButton from './MicroButton'

type RichTextEditorProps = {
  value: string
  onChange: (html: string) => void
  onUploadImage?: (file: File) => Promise<string>
}

type FontSizeOptions = {
  types: string[]
}

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

const colorSwatches = ['#FFFFFF', '#CBD5E1', '#06B6D4', '#4EE1C1', '#EC4899', '#FFD56B']
const highlightSwatches = ['#164E63', '#14532D', '#581C87', '#7F1D1D', '#713F12']
const fontSizes = [
  { label: 'Body', value: '' },
  { label: 'Small', value: '0.875rem' },
  { label: 'Lead', value: '1.125rem' },
  { label: 'Large', value: '1.375rem' }
]

export default function RichTextEditor({ value, onChange, onUploadImage }: RichTextEditorProps) {
  const [sourceMode, setSourceMode] = useState(false)
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
        placeholder: 'Write like a senior engineer explaining what actually happened in production...'
      })
    ],
    content: value || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'min-h-[420px] px-4 py-4 text-base leading-8 text-slate-200 outline-none'
      }
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    }
  })

  useEffect(() => {
    if (!editor || sourceMode) return
    const currentHtml = editor.getHTML()
    const nextHtml = value || ''
    if (currentHtml !== nextHtml) editor.commands.setContent(nextHtml, { emitUpdate: false })
  }, [editor, sourceMode, value])

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
      <div className="min-h-[480px] rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm text-slate-400">
        Loading editor...
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-white/[0.035] p-3">
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
          className={selectClassName}
          aria-label="Font size"
          disabled={sourceMode}
        >
          {fontSizes.map(size => (
            <option key={size.label} value={size.value}>{size.label}</option>
          ))}
        </select>

        <ToolbarButton label="Bold" active={editor.isActive('bold')} disabled={sourceMode} onClick={() => editor.chain().focus().toggleBold().run()}>B</ToolbarButton>
        <ToolbarButton label="Italic" active={editor.isActive('italic')} disabled={sourceMode} onClick={() => editor.chain().focus().toggleItalic().run()}>I</ToolbarButton>
        <ToolbarButton label="Underline" active={editor.isActive('underline')} disabled={sourceMode} onClick={() => editor.chain().focus().toggleUnderline().run()}>U</ToolbarButton>
        <ToolbarButton label="Code" active={editor.isActive('code')} disabled={sourceMode} onClick={() => editor.chain().focus().toggleCode().run()}>{`<>`}</ToolbarButton>

        <Divider />

        <ToolbarButton label="Bullet list" active={editor.isActive('bulletList')} disabled={sourceMode} onClick={() => editor.chain().focus().toggleBulletList().run()}>UL</ToolbarButton>
        <ToolbarButton label="Numbered list" active={editor.isActive('orderedList')} disabled={sourceMode} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1.</ToolbarButton>
        <ToolbarButton label="Quote" active={editor.isActive('blockquote')} disabled={sourceMode} onClick={() => editor.chain().focus().toggleBlockquote().run()}>" "</ToolbarButton>
        <ToolbarButton label="Code block" active={editor.isActive('codeBlock')} disabled={sourceMode} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>{`{}`}</ToolbarButton>

        <Divider />

        <ToolbarButton label="Align left" active={editor.isActive({ textAlign: 'left' })} disabled={sourceMode} onClick={() => editor.chain().focus().setTextAlign('left').run()}>L</ToolbarButton>
        <ToolbarButton label="Align center" active={editor.isActive({ textAlign: 'center' })} disabled={sourceMode} onClick={() => editor.chain().focus().setTextAlign('center').run()}>C</ToolbarButton>
        <ToolbarButton label="Align right" active={editor.isActive({ textAlign: 'right' })} disabled={sourceMode} onClick={() => editor.chain().focus().setTextAlign('right').run()}>R</ToolbarButton>
        <ToolbarButton label="Link" active={editor.isActive('link')} disabled={sourceMode} onClick={setLink}>Link</ToolbarButton>
        <ToolbarButton label="Image URL" disabled={sourceMode} onClick={addImageByUrl}>Img</ToolbarButton>

        {onUploadImage ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={event => uploadImage(event.target.files?.[0])}
            />
            <ToolbarButton label="Upload image" disabled={sourceMode || uploading} onClick={() => fileInputRef.current?.click()}>
              {uploading ? '...' : 'Up'}
            </ToolbarButton>
          </>
        ) : null}

        <Divider />

        <Swatches
          label="Text color"
          swatches={colorSwatches}
          disabled={sourceMode}
          onPick={color => editor.chain().focus().setColor(color).run()}
        />
        <Swatches
          label="Highlight"
          swatches={highlightSwatches}
          disabled={sourceMode}
          onPick={color => editor.chain().focus().toggleHighlight({ color }).run()}
        />

        <ToolbarButton label="Clear styles" disabled={sourceMode} onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>Clear</ToolbarButton>
        <ToolbarButton label={sourceMode ? 'Visual editor' : 'HTML source'} active={sourceMode} onClick={() => setSourceMode(current => !current)}>
          {sourceMode ? 'Visual' : 'HTML'}
        </ToolbarButton>
      </div>

      {sourceMode ? (
        <textarea
          value={value}
          onChange={event => onChange(event.target.value)}
          rows={18}
          className="min-h-[420px] w-full resize-y bg-black/20 px-4 py-4 font-mono text-xs leading-6 text-slate-200 outline-none placeholder:text-slate-600"
          placeholder="<p>Raw HTML source</p>"
        />
      ) : (
        <EditorContent editor={editor} className="rich-editor" />
      )}
    </div>
  )
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
        'grid h-9 min-w-9 place-items-center rounded-full border px-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-45',
        active ? 'border-secondary bg-secondary/15 text-secondary' : 'border-white/10 bg-white/[0.04] text-slate-300 hover:border-secondary/50 hover:text-secondary'
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
    <div className="flex items-center gap-1" aria-label={label}>
      {swatches.map(color => (
        <MicroButton
          key={color}
          type="button"
          title={`${label}: ${color}`}
          aria-label={`${label}: ${color}`}
          disabled={disabled}
          onClick={() => onPick(color)}
          className="h-7 w-7 rounded-full border border-white/15 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-45"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  )
}

function Divider() {
  return <span className="mx-1 h-7 w-px bg-white/10" aria-hidden="true" />
}

const selectClassName = 'h-9 rounded-full border border-white/10 bg-[#0B0F14] px-3 text-xs font-semibold text-slate-200 outline-none transition focus:border-secondary/50 disabled:opacity-45'
