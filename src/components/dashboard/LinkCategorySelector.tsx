'use client'

import { Folder, Plus } from 'lucide-react'

interface LinkCategorySelectorProps {
  category: string
  existingCategories: string[]
  onCategoryChange: (category: string) => void
}

export default function LinkCategorySelector({
  category,
  existingCategories,
  onCategoryChange,
}: LinkCategorySelectorProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
        <Folder className="w-4 h-4" />
        Category (Optional)
      </label>

      <div className="flex items-center gap-2">
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm outline-none focus:border-blue-500 transition"
        >
          <option value="">No Category</option>
          {existingCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Or create new category */}
      <div className="flex items-center gap-2">
        <Plus className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={category && !existingCategories.includes(category) ? category : ''}
          onChange={(e) => onCategoryChange(e.target.value)}
          placeholder="Or create new category"
          className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm outline-none focus:border-blue-500 transition"
        />
      </div>

      <p className="text-xs text-slate-500">
        Group links into categories for better organization
      </p>
    </div>
  )
}
