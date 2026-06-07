"use client"

import { useState, useRef, useEffect } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react'
import type { Project } from '../features/projects'

type Node = { id: string; x: number; y: number; w?: number; h?: number; label: string }

export default function ArchitectureDiagram({ project }: { project: Project }) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [nodes, setNodes] = useState<Node[]>(() => [
    { id: 'client', x: 60, y: 40, label: 'Client UI' },
    { id: 'api', x: 220, y: 30, label: 'API / Orchestration' },
    { id: 'stream', x: 220, y: 90, label: 'Stream (Kafka)' },
    { id: 'proc', x: 380, y: 40, label: 'Processing' },
    { id: 'store', x: 520, y: 40, label: 'Storage' }
  ])

  const [dragging, setDragging] = useState<string | null>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [focused, setFocused] = useState<string | null>(null)

  useEffect(() => {
    function onPointerMove(e: PointerEvent) {
      if (!dragging) return
      const rect = svgRef.current?.getBoundingClientRect()
      if (!rect) return
      const nx = e.clientX - rect.left - offset.x
      const ny = e.clientY - rect.top - offset.y
      setNodes(n => n.map(node => node.id === dragging ? { ...node, x: nx, y: ny } : node))
    }
    function onPointerUp() { setDragging(null) }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => { window.removeEventListener('pointermove', onPointerMove); window.removeEventListener('pointerup', onPointerUp) }
  }, [dragging, offset])

  function handlePointerDown(e: ReactPointerEvent, id: string) {
    const rect = (e.target as Element).getBoundingClientRect()
    setDragging(id)
    setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  function handleKeyDown(e: ReactKeyboardEvent, id: string) {
    const step = e.shiftKey ? 10 : 4
    if (!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) return
    e.preventDefault()
    setNodes(n => n.map(node => {
      if (node.id !== id) return node
      if (e.key === 'ArrowUp') return { ...node, y: node.y - step }
      if (e.key === 'ArrowDown') return { ...node, y: node.y + step }
      if (e.key === 'ArrowLeft') return { ...node, x: node.x - step }
      return { ...node, x: node.x + step }
    }))
  }

  return (
    <svg ref={svgRef} width="100%" height={140} viewBox="0 0 680 140" role="img" aria-label={`Architecture diagram for ${project.title}`}>
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Links */}
      {nodes.map((n, i) => i < nodes.length - 1 ? (
        <line key={`l-${n.id}`} x1={n.x + 80} y1={n.y + 22} x2={nodes[i+1].x} y2={nodes[i+1].y + 22} stroke="#ffffff" strokeOpacity={0.12} strokeWidth={2} />
      ) : null)}

      {/* Nodes */}
      {nodes.map(n => (
        <g key={n.id} transform={`translate(${n.x}, ${n.y})`}>
          <rect
            x={0} y={0} width={140} height={44} rx={8}
            fill="#071827" stroke={focused === n.id ? '#4EE1C1' : '#ffffff'} strokeOpacity={focused === n.id ? 0.22 : 0.06}
            style={{ filter: focused === n.id ? 'url(#glow)' : undefined }}
            onPointerDown={(e) => handlePointerDown(e, n.id)}
            tabIndex={0}
            onFocus={() => setFocused(n.id)}
            onBlur={() => setFocused(null)}
            onKeyDown={(e) => handleKeyDown(e, n.id)}
            role="button"
            aria-label={n.label}
          />
          <text x={70} y={28} fill="#c7f9ec" fontSize={12} textAnchor="middle" pointerEvents="none">{n.label}</text>
        </g>
      ))}
    </svg>
  )
}
