'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Edit2, X, Check } from 'lucide-react'
import EmojiPicker from './EmojiPicker'
import LinkScheduler from './LinkScheduler'

interface DraggableLinkProps {
  link: {
    id: string
    title: string
    url: string
    is_active: boolean
    icon?: string
    is_scheduled?: boolean
    scheduled_start?: string | null
    scheduled_end?: string | null
    click_count?: number
  }
  onToggle: () => void
  onDelete: () => void
  onEdit: (data: {
    title: string
    url: string
    icon?: string
    is_scheduled: boolean
    scheduled_start?: string | null
    scheduled_end?: string | null
  }) => void
}

export default function DraggableLink({ link, onToggle, onDelete, onEdit }: DraggableLinkProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: link.title,
    url: link.url,
    icon: link.icon || '',
    is_scheduled: link.is_scheduled || false,
    scheduled_start: link.scheduled_start || '',
    scheduled_end: link.scheduled_end || '',
  })

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id })

  const handleSave = () => {
    if (!editData.title.trim() || !editData.url.trim()) return
    
    onEdit({
      title: editData.title.trim(),
      url: editData.url.trim(),
      icon: editData.icon || undefined,
      is_scheduled: editData.is_scheduled,
      scheduled_start: editData.is_scheduled && editData.scheduled_start ? editData.scheduled_start : null,
      scheduled_end: editData.is_scheduled && editData.scheduled_end ? editData.scheduled_end : null,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData({
      title: link.title,
      url: link.url,
      icon: link.icon || '',
      is_scheduled: link.is_scheduled || false,
      scheduled_start: link.scheduled_start || '',
      scheduled_end: link.scheduled_end || '',
    })
    setIsEditing(false)
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        className="p-4 bg-slate-900/50 rounded-lg border border-blue-500"
      >
        <div className="space-y-3">
          <div className="flex gap-2">
            <EmojiPicker 
              onSelect={(emoji) => setEditData({ ...editData, icon: emoji })}
              currentIcon={editData.icon}
            />
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition"
              placeholder="Link Title"
              maxLength={50}
            />
          </div>
          <input
            type="url"
            value={editData.url}
            onChange={(e) => setEditData({ ...editData, url: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition"
            placeholder="https://example.com"
          />
          <LinkScheduler
            isScheduled={editData.is_scheduled}
            scheduledStart={editData.scheduled_start}
            scheduledEnd={editData.scheduled_end}
            onScheduleChange={(data) => 
              setEditData({ 
                ...editData, 
                is_scheduled: data.is_scheduled, 
                scheduled_start: data.scheduled_start || '', 
                scheduled_end: data.scheduled_end || '' 
              })
            }
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition"
            >
              <Check className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm font-medium transition"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      </div>
    )
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
            {link.click_count !== undefined && link.click_count > 0 && (
              <span className="ml-2 text-xs px-2 py-0.5 bg-blue-600/20 rounded text-blue-400">
                {link.click_count} {link.click_count === 1 ? 'click' : 'clicks'}
              </span>
            )}
          </div>
          <div className="text-sm text-slate-400 truncate">{link.url}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={() => setIsEditing(true)}
          className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
        >
          <Edit2 className="w-4 h-4" />
        </button>
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