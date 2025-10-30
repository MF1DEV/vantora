'use client'

import { useState } from 'react'
import { Calendar, Clock } from 'lucide-react'

interface LinkSchedulerProps {
  isScheduled: boolean
  scheduledStart?: string
  scheduledEnd?: string
  onScheduleChange: (data: {
    is_scheduled: boolean
    scheduled_start?: string
    scheduled_end?: string
  }) => void
}

export default function LinkScheduler({
  isScheduled,
  scheduledStart,
  scheduledEnd,
  onScheduleChange,
}: LinkSchedulerProps) {
  const [enabled, setEnabled] = useState(isScheduled)
  const [startDate, setStartDate] = useState(
    scheduledStart ? new Date(scheduledStart).toISOString().slice(0, 16) : ''
  )
  const [endDate, setEndDate] = useState(
    scheduledEnd ? new Date(scheduledEnd).toISOString().slice(0, 16) : ''
  )

  const handleToggle = () => {
    const newEnabled = !enabled
    setEnabled(newEnabled)
    
    if (!newEnabled) {
      // Clear scheduling
      setStartDate('')
      setEndDate('')
      onScheduleChange({
        is_scheduled: false,
        scheduled_start: undefined,
        scheduled_end: undefined,
      })
    }
  }

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartDate(value)
    } else {
      setEndDate(value)
    }

    const updatedData = {
      is_scheduled: enabled,
      scheduled_start: type === 'start' ? value : startDate,
      scheduled_end: type === 'end' ? value : endDate,
    }

    // Only call onChange if we have valid dates or scheduling is disabled
    if (!enabled || (updatedData.scheduled_start && updatedData.scheduled_end)) {
      onScheduleChange(updatedData)
    }
  }

  return (
    <div className="space-y-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-400" />
          <span className="font-medium text-white">Schedule Link</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={handleToggle}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {enabled && (
        <div className="space-y-3 pt-2">
          <p className="text-sm text-slate-400">
            Set when this link should be visible on your profile
          </p>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => handleDateChange('start', e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500 transition"
              required={enabled}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              End Date & Time
            </label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => handleDateChange('end', e.target.value)}
              min={startDate}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500 transition"
              required={enabled}
            />
          </div>

          {startDate && endDate && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-blue-400">
              <p className="font-medium">Scheduled Period:</p>
              <p className="text-xs mt-1">
                {new Date(startDate).toLocaleString()} → {new Date(endDate).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
