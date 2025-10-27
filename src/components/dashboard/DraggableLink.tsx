'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'

interface DraggableLinkProps {
  link: {
    id: string
    title: string
    url: string
    is_active: boolean
    icon?: string
  }
  onToggle: () => void
  onDelete: () => void
}

export default function DraggableLink({ link, onToggle, onDelete }: DraggableLinkProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-600 transition group"
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div
          {...attributes}
          {...listeners}
          className="cursor-move touch-none"
        >
          <GripVertical className="w-5 h-5 text-slate-500 flex-shrink-0" />
        </div>
<div className="flex-1 min-w-0">
          <div className={`font-medium truncate flex items-center gap-2 ${link.is_active ? 'text-white' : 'text-slate-500'}`}>
            {link.icon && <span className="text-lg flex-shrink-0">{link.icon}</span>}
            <span>{link.title}</span>
            {!link.is_active && (
              <span className="ml-2 text-xs px-2 py-0.5 bg-slate-700 rounded text-slate-400">Hidden</span>
            )}
          </div>
          <div className="text-sm text-slate-400 truncate">{link.url}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={onToggle}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            link.is_active
              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {link.is_active ? 'Hide' : 'Show'}
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}