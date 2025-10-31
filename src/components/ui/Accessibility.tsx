'use client'

import { useEffect, useRef, ReactNode } from 'react'

interface FocusTrapProps {
  active: boolean
  children: ReactNode
}

export function FocusTrap({ active, children }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active) return

    // Save previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement

    // Get all focusable elements
    const getFocusableElements = () => {
      if (!containerRef.current) return []
      return Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      )
    }

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    // Focus first element
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }

    document.addEventListener('keydown', handleTab)

    return () => {
      document.removeEventListener('keydown', handleTab)
      // Restore focus
      if (previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [active])

  return <div ref={containerRef}>{children}</div>
}

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg"
    >
      Skip to main content
    </a>
  )
}

interface ScreenReaderOnlyProps {
  children: ReactNode
}

export function ScreenReaderOnly({ children }: ScreenReaderOnlyProps) {
  return (
    <span className="sr-only">
      {children}
    </span>
  )
}

interface LiveRegionProps {
  message: string
  politeness?: 'polite' | 'assertive'
}

export function LiveRegion({ message, politeness = 'polite' }: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (regionRef.current && message) {
      // Force screen reader announcement
      regionRef.current.textContent = ''
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = message
        }
      }, 100)
    }
  }, [message])

  return (
    <div
      ref={regionRef}
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    />
  )
}

interface KeyboardShortcutProps {
  shortcut: string
  onTrigger: () => void
  description?: string
}

export function useKeyboardShortcut({ shortcut, onTrigger, description }: KeyboardShortcutProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = shortcut.toLowerCase().split('+')
      const hasCtrl = keys.includes('ctrl') && (e.ctrlKey || e.metaKey)
      const hasShift = keys.includes('shift') && e.shiftKey
      const hasAlt = keys.includes('alt') && e.altKey
      const mainKey = keys[keys.length - 1]

      const ctrlMatch = keys.includes('ctrl') ? hasCtrl : !e.ctrlKey && !e.metaKey
      const shiftMatch = keys.includes('shift') ? hasShift : !e.shiftKey
      const altMatch = keys.includes('alt') ? hasAlt : !e.altKey

      if (ctrlMatch && shiftMatch && altMatch && e.key.toLowerCase() === mainKey) {
        e.preventDefault()
        onTrigger()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcut, onTrigger])

  return description
}

interface AccessibleIconButtonProps {
  icon: ReactNode
  label: string
  onClick: () => void
  className?: string
}

export function AccessibleIconButton({ icon, label, onClick, className = '' }: AccessibleIconButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`p-2 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition ${className}`}
    >
      {icon}
      <ScreenReaderOnly>{label}</ScreenReaderOnly>
    </button>
  )
}

interface AccessibleDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
}

export function AccessibleDialog({ isOpen, onClose, title, description, children }: AccessibleDialogProps) {
  const titleId = `dialog-title-${Math.random().toString(36).substr(2, 9)}`
  const descId = description ? `dialog-desc-${Math.random().toString(36).substr(2, 9)}` : undefined

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      className="fixed inset-0 z-50"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <FocusTrap active={isOpen}>
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-slate-900 rounded-2xl shadow-2xl p-6">
          <h2 id={titleId} className="text-xl font-semibold text-white mb-2">
            {title}
          </h2>
          {description && (
            <p id={descId} className="text-slate-400 mb-4">
              {description}
            </p>
          )}
          {children}
        </div>
      </FocusTrap>
    </div>
  )
}

export function FocusVisibleStyles() {
  return (
    <style jsx global>{`
      .focus-visible:focus {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }

      .focus-visible:focus:not(:focus-visible) {
        outline: none;
      }

      *:focus-visible {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }
    `}</style>
  )
}

interface AccessibleTabsProps {
  tabs: { label: string; content: ReactNode }[]
  defaultTab?: number
}

export function AccessibleTabs({ tabs, defaultTab = 0 }: AccessibleTabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const nextIndex = (index + 1) % tabs.length
      setActiveTab(nextIndex)
      tabRefs.current[nextIndex]?.focus()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const prevIndex = (index - 1 + tabs.length) % tabs.length
      setActiveTab(prevIndex)
      tabRefs.current[prevIndex]?.focus()
    } else if (e.key === 'Home') {
      e.preventDefault()
      setActiveTab(0)
      tabRefs.current[0]?.focus()
    } else if (e.key === 'End') {
      e.preventDefault()
      const lastIndex = tabs.length - 1
      setActiveTab(lastIndex)
      tabRefs.current[lastIndex]?.focus()
    }
  }

  return (
    <div>
      <div role="tablist" className="flex gap-2 border-b border-slate-800">
        {tabs.map((tab, index) => (
          <button
            key={index}
            ref={(el) => (tabRefs.current[index] = el)}
            role="tab"
            aria-selected={activeTab === index}
            aria-controls={`tabpanel-${index}`}
            id={`tab-${index}`}
            tabIndex={activeTab === index ? 0 : -1}
            onClick={() => setActiveTab(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`px-4 py-2 font-medium transition ${
              activeTab === index
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={index}
          role="tabpanel"
          id={`tabpanel-${index}`}
          aria-labelledby={`tab-${index}`}
          hidden={activeTab !== index}
          className="py-4"
        >
          {activeTab === index && tab.content}
        </div>
      ))}
    </div>
  )
}

import React from 'react'

export { React }
