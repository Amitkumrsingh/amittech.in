import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/classes'

type ButtonVariant = 'gradient' | 'secondary' | 'ghost'
type ButtonSize = 'hero' | 'contact'
type ButtonRadius = '3xl' | 'full'

type ButtonClassOptions = {
  variant?: ButtonVariant
  size?: ButtonSize
  radius?: ButtonRadius
  className?: string
}

const variantClasses: Record<ButtonVariant, string> = {
  gradient: 'magnetic-btn bg-gradient-to-r from-secondary to-accent text-black shadow-[0_20px_80px_-40px_rgba(236,72,153,0.65)]',
  secondary: 'bg-secondary text-black',
  ghost: 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
}

const sizeClasses: Record<ButtonSize, string> = {
  hero: 'px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm',
  contact: 'h-11 px-6 text-sm leading-none'
}

const radiusClasses: Record<ButtonRadius, string> = {
  '3xl': 'rounded-3xl',
  full: 'rounded-full'
}

export function buttonClassName({
  variant = 'ghost',
  size = 'hero',
  radius = '3xl',
  className
}: ButtonClassOptions = {}) {
  return cn(
    'inline-flex items-center justify-center whitespace-nowrap font-semibold transition',
    radiusClasses[radius],
    variantClasses[variant],
    sizeClasses[size],
    className
  )
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  ButtonClassOptions & {
    children: ReactNode
  }

export default function ButtonLink({
  children,
  variant,
  size,
  radius,
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <a className={buttonClassName({ variant, size, radius, className })} {...props}>
      {children}
    </a>
  )
}
