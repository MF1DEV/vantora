import { type ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-slate-900 rounded-xl shadow-lg border border-slate-800 ${className}`}>
      {children}
    </div>
  )
}
