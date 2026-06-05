"use client"

import { useRef } from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>

export default function MicroButton(props: Props) {
  const ref = useRef<HTMLButtonElement | null>(null)

  function handleMouseDown(e: React.MouseEvent<HTMLButtonElement>) {
    const btn = ref.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ripple = document.createElement('span')
    ripple.className = 'ripple'
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`
    btn.appendChild(ripple)
    ripple.addEventListener('animationend', () => ripple.remove())
  }

  return (
    <button
      {...props}
      ref={ref}
      onMouseDown={(e) => { handleMouseDown(e); props.onMouseDown?.(e) }}
      onFocus={(e) => { ref.current?.classList.add('focus-expand'); props.onFocus?.(e) }}
      onBlur={(e) => { ref.current?.classList.remove('focus-expand'); props.onBlur?.(e) }}
      className={(props.className ?? '') + ' relative overflow-hidden'}
    />
  )
}
