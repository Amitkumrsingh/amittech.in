"use client"

import { useState } from 'react'
import { motion } from '../lib/motion'

type Props = {
  items: any[]
  filter?: string | null
}

export default function Timeline({ items, filter = null }: Props) {
  const [active, setActive] = useState<number | null>(null)

  return (
    <div className="space-y-6" role="list">
      {items.map((it: any, idx: number) => {
        const matchesFilter = !filter || it.tech.includes(filter)
        return (
          <motion.div
            key={it.id}
            whileHover={{ scale: 1.01 }}
            className={`p-4 rounded-2xl bg-white/3 backdrop-blur-md ${matchesFilter ? 'ring-2 ring-auroraTeal/20' : 'opacity-80'} `}
            role="listitem"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-auroraTeal">{it.company}</div>
                <h4 className="font-semibold">{it.title}</h4>
                <div className="text-sm text-slate-300">{it.role} • {it.period}</div>
              </div>
              <div>
                <button
                  onClick={() => setActive(active === idx ? null : idx)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(active === idx ? null : idx) } }}
                  aria-expanded={active === idx}
                  className="px-3 py-2 rounded-md border border-white/10"
                >
                  Details
                </button>
              </div>
            </div>

            {active === idx && (
              <div className="mt-3 text-sm text-slate-200">
                <p>{it.short}</p>
                <div className="mt-3">
                  <strong className="text-sm">Architecture</strong>
                  <div className="mt-2 p-3 rounded bg-black/30">
                    {/* Simple inline SVG architecture sketch */}
                    <svg width="100%" height="80" viewBox="0 0 600 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <rect x="10" y="18" width="120" height="44" rx="8" fill="#071827" stroke="#2dd4bf" strokeOpacity="0.25" />
                      <text x="70" y="45" fill="#9ae6b4" fontSize="12" textAnchor="middle">Ingest</text>
                      <rect x="160" y="8" width="120" height="64" rx="8" fill="#071827" stroke="#60a5fa" strokeOpacity="0.2" />
                      <text x="220" y="45" fill="#93c5fd" fontSize="12" textAnchor="middle">Stream (Kafka)</text>
                      <rect x="310" y="18" width="120" height="44" rx="8" fill="#071827" stroke="#f472b6" strokeOpacity="0.2" />
                      <text x="370" y="45" fill="#fda4af" fontSize="12" textAnchor="middle">Processing</text>
                      <rect x="460" y="18" width="120" height="44" rx="8" fill="#071827" stroke="#fde68a" strokeOpacity="0.18" />
                      <text x="520" y="45" fill="#fde68a" fontSize="12" textAnchor="middle">Storage</text>
                      <path d="M130 40 L160 40" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="2" />
                      <path d="M280 40 L310 40" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="2" />
                      <path d="M430 40 L460 40" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="2" />
                    </svg>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {it.tech.map((t: string) => <span key={t} className="px-2 py-1 text-xs rounded-full bg-white/5">{t}</span>)}
                </div>

                <div className="mt-3">
                  <strong className="text-sm">Impact</strong>
                  <ul className="mt-2 list-disc list-inside text-sm">
                    {it.impact.map((m: string) => <li key={m}>{m}</li>)}
                  </ul>
                </div>
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
