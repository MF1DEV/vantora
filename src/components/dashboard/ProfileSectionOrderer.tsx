'use client'

import { useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, User, Link2, Puzzle, Share2, Check } from 'lucide-react'

interface Section {
  id: string
  name: string
  icon: any
  enabled: boolean
}

interface ProfileSectionOrdererProps {
  initialOrder: string[]
  onSave: (order: string[]) => void
}

const defaultSections: Section[] = [
  { id: 'bio', name: 'Bio', icon: User, enabled: true },
  { id: 'links', name: 'Links', icon: Link2, enabled: true },
  { id: 'widgets', name: 'Widgets', icon: Puzzle, enabled: true },
  { id: 'social', name: 'Social Media', icon: Share2, enabled: true },
]

function SortableSection({ section }: { section: Section }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const Icon = section.icon

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-4 bg-slate-900/50 border border-slate-700 rounded-lg"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-move touch-none"
      >
        <GripVertical className="w-5 h-5 text-slate-500" />
      </div>
      <Icon className="w-5 h-5 text-blue-400" />
      <span className="flex-1 font-medium text-white">{section.name}</span>
      <span className="text-sm text-slate-400">
        {section.enabled ? 'Visible' : 'Hidden'}
      </span>
    </div>
  )
}

export default function ProfileSectionOrderer({ initialOrder, onSave }: ProfileSectionOrdererProps) {
  const [sections, setSections] = useState<Section[]>(() => {
    if (initialOrder && initialOrder.length > 0) {
      return initialOrder.map(id => defaultSections.find(s => s.id === id)!).filter(Boolean)
    }
    return defaultSections
  })
  const [isSaving, setIsSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    setSections((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)
      return arrayMove(items, oldIndex, newIndex)
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    const order = sections.map(s => s.id)
    await onSave(order)
    setIsSaving(false)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">Section Order</h3>
        <p className="text-sm text-slate-400">
          Drag to reorder how sections appear on your profile
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {sections.map((section) => (
              <SortableSection key={section.id} section={section} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition"
      >
        {isSaving ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Saving...</span>
          </>
        ) : (
          <>
            <Check className="w-4 h-4" />
            <span>Save Order</span>
          </>
        )}
      </button>

      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-sm text-blue-300">
          💡 Tip: Place your most important sections at the top for better visibility
        </p>
      </div>
    </div>
  )
}
