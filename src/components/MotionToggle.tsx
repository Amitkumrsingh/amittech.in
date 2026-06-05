"use client"

import { useMotion } from '../lib/motionContext'
import { trackMotionToggle } from '../lib/analytics'

export default function MotionToggle() {
  const { enabled, toggle } = useMotion()

  function handleToggle() {
    toggle()
    const newState = !enabled
    trackMotionToggle(newState)
  }

  return (
    <div className="fixed right-4 top-4 z-[999]">
      <button
        onClick={handleToggle}
        aria-pressed={!enabled}
        title={enabled ? 'Animations on - click to reduce motion' : 'Reduced motion - click to enable animations'}
        className="magnetic-btn inline-flex items-center gap-3 rounded-full bg-white/5 px-3 py-2 text-sm font-medium text-white/90 shadow-sm focus-visible:ring-2 focus-visible:ring-auroraTeal/50 transition-all duration-300"
      >
        <div className="relative w-5 h-5 flex items-center justify-center">
          {/* Visual state indicator dot */}
          <div
            className={`absolute w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              enabled ? 'bg-emerald-400 scale-100' : 'bg-orange-400 scale-0'
            }`}
          />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${enabled ? 'text-white' : 'text-slate-400'} transition-colors duration-300`}>
            <path d="M12 3v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 19v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4.2 4.2l1.4 1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18.4 18.4l1.4 1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M1 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4.2 19.8l1.4-1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18.4 5.6l1.4-1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="hidden sm:inline text-xs">{enabled ? 'On' : 'Off'}</span>
      </button>
    </div>
  )
}
