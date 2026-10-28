"use client"

import { useEffect, useRef, useState } from 'react'

type MermaidArticleContentProps = {
  html: string
}

const mermaidDiagramStart = /^(?:---[\s\S]*?---\s*)?(?:(?:%%\{[\s\S]*?\}%%|%%[^\n]*)\s*)*(?:architecture(?:-beta)?|block(?:-beta)?|c4context|c4container|c4component|c4deployment|c4dynamic|classDiagram|erDiagram|flowchart|gantt|gitGraph|graph|journey|mindmap|packet-beta|pie|quadrantChart|radar-beta|requirementDiagram|sankey-beta|sequenceDiagram|stateDiagram(?:-v2)?|timeline|treemap-beta|xychart-beta|zenuml)\b/i

function isMermaidSource(source: HTMLElement, code: string) {
  const host = source.matches('code') ? source.closest('pre') : source
  const explicitlyMarked = [source, host]
    .filter((element): element is HTMLElement => element instanceof HTMLElement)
    .some(element => (
      element.classList.contains('mermaid')
      || element.classList.contains('language-mermaid')
      || element.classList.contains('lang-mermaid')
      || element.dataset.mermaid !== undefined
      || element.dataset.language === 'mermaid'
    ))

  return explicitlyMarked || mermaidDiagramStart.test(code.trim())
}

export default function MermaidArticleContent({ html }: MermaidArticleContentProps) {
  const contentRef = useRef<HTMLDivElement | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const readTheme = () => setTheme(document.documentElement.dataset.editorialTheme === 'dark' ? 'dark' : 'light')
    readTheme()
    const observer = new MutationObserver(readTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-editorial-theme'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const root = contentRef.current
    if (!root) return

    let cancelled = false

    async function renderMermaidDiagrams(contentRoot: HTMLDivElement) {
      const { default: mermaid } = await import('mermaid')
      if (cancelled) return

      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme,
        fontFamily: 'var(--font-sans), Inter, ui-sans-serif, system-ui, sans-serif',
        suppressErrorRendering: true,
        themeVariables: {
          background: theme === 'dark' ? '#171b18' : '#ffffff',
          primaryColor: theme === 'dark' ? '#173530' : '#e2f2ef',
          primaryTextColor: theme === 'dark' ? '#f2f3ef' : '#171918',
          primaryBorderColor: theme === 'dark' ? '#65c9be' : '#087f78',
          lineColor: theme === 'dark' ? '#65c9be' : '#087f78',
          secondaryColor: theme === 'dark' ? '#1c211d' : '#f1f2ed',
          tertiaryColor: theme === 'dark' ? '#111412' : '#faf9f6',
          clusterBkg: theme === 'dark' ? '#1c211d' : '#f1f2ed',
          clusterBorder: theme === 'dark' ? '#485149' : '#c5c8c2',
          edgeLabelBackground: theme === 'dark' ? '#171b18' : '#ffffff',
          fontFamily: 'var(--font-sans), Inter, ui-sans-serif, system-ui, sans-serif'
        }
      })

      const sources = Array.from(contentRoot.querySelectorAll<HTMLElement>(
        'pre > code, pre.mermaid, pre[data-mermaid], div.mermaid, div[data-mermaid]'
      ))
      const processedHosts = new Set<HTMLElement>()

      for (const source of sources) {
        if (cancelled) return

        const host = (source.matches('code') ? source.closest('pre') : source) as HTMLElement | null
        if (!host || processedHosts.has(host)) continue
        processedHosts.add(host)
        if (host.dataset.mermaidError === 'true') continue

        const code = source.textContent?.trim() || ''
        if (!code || !isMermaidSource(source, code)) continue

        try {
          const diagramId = `mermaid-blog-${crypto.randomUUID()}`
          const { svg, bindFunctions } = await mermaid.render(diagramId, code)
          if (cancelled) return

          const figure = document.createElement('figure')
          figure.className = 'mermaid-diagram'
          figure.setAttribute('aria-label', 'System diagram')

          const canvas = document.createElement('div')
          canvas.className = 'mermaid-diagram__canvas'
          canvas.innerHTML = svg

          const renderedSvg = canvas.querySelector('svg')
          renderedSvg?.setAttribute('role', 'img')
          if (renderedSvg && !renderedSvg.hasAttribute('aria-label')) {
            renderedSvg.setAttribute('aria-label', 'Diagram rendered from Mermaid code')
          }

          figure.appendChild(canvas)
          host.replaceWith(figure)
          bindFunctions?.(canvas)
        } catch (error) {
          host.classList.add('mermaid-source-error')
          host.setAttribute('data-mermaid-error', 'true')

          const message = document.createElement('p')
          message.className = 'mermaid-source-error__message'
          message.textContent = 'This diagram could not be rendered. Check the Mermaid syntax.'
          host.insertAdjacentElement('afterend', message)

          if (process.env.NODE_ENV !== 'production') {
            console.error('Unable to render Mermaid diagram', error)
          }
        }
      }
    }

    void renderMermaidDiagrams(root)

    return () => {
      cancelled = true
    }
  }, [html, theme])

  return (
    <div
      ref={contentRef}
      className="cms-rich-content mt-10 space-y-6 text-lg leading-9 text-slate-300 [&_figure]:my-8 [&_h2]:scroll-mt-28 [&_h2]:pt-4 [&_h3]:scroll-mt-28 [&_h3]:pt-3 [&_table]:w-full [&_table]:overflow-hidden [&_table]:rounded-2xl [&_td]:border [&_td]:border-white/10 [&_td]:p-3 [&_th]:border [&_th]:border-white/10 [&_th]:p-3"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
