'use client'

import { useState } from 'react'
import { Clock, Calendar, Repeat } from 'lucide-react'

interface EnhancedSchedulerProps {
  isScheduled: boolean
  scheduledStart?: string
  scheduledEnd?: string
  timeStart?: string
  timeEnd?: string
  recurringDays?: number[]
  onScheduleChange: (data: {
    is_scheduled: boolean
    scheduled_start?: string
    scheduled_end?: string
    time_start?: string
    time_end?: string
    recurring_days?: number[]
  }) => void
}

export default function EnhancedScheduler({
  isScheduled,
  scheduledStart,
  scheduledEnd,
  timeStart,
  timeEnd,
  recurringDays = [],
  onScheduleChange,
}: EnhancedSchedulerProps) {
  const [enabled, setEnabled] = useState(isScheduled)
  const [startDate, setStartDate] = useState(scheduledStart || '')
  const [endDate, setEndDate] = useState(scheduledEnd || '')
  const [startTime, setStartTime] = useState(timeStart || '')
  const [endTime, setEndTime] = useState(timeEnd || '')
  const [selectedDays, setSelectedDays] = useState<number[]>(recurringDays)

  const days = [
    { label: 'Sun', value: 0 },
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
  ]

  const handleToggle = () => {
    const newEnabled = !enabled
    setEnabled(newEnabled)
    
    if (!newEnabled) {
      setStartDate('')
      setEndDate('')
      setStartTime('')
      setEndTime('')
      setSelectedDays([])
      onScheduleChange({
        is_scheduled: false,
        scheduled_start: undefined,
        scheduled_end: undefined,
        time_start: undefined,
        time_end: undefined,
        recurring_days: [],
      })
    } else {
      onScheduleChange({
        is_scheduled: true,
        scheduled_start: startDate,
        scheduled_end: endDate,
        time_start: startTime,
        time_end: endTime,
        recurring_days: selectedDays,
      })
    }
  }

  const handleChange = (updates: Partial<{
    start_date: string
    end_date: string
    start_time: string
    end_time: string
    days: number[]
  }>) => {
    const newStartDate = updates.start_date !== undefined ? updates.start_date : startDate
    const newEndDate = updates.end_date !== undefined ? updates.end_date : endDate
    const newStartTime = updates.start_time !== undefined ? updates.start_time : startTime
    const newEndTime = updates.end_time !== undefined ? updates.end_time : endTime
    const newDays = updates.days !== undefined ? updates.days : selectedDays

    if (updates.start_date !== undefined) setStartDate(updates.start_date)
    if (updates.end_date !== undefined) setEndDate(updates.end_date)
    if (updates.start_time !== undefined) setStartTime(updates.start_time)
    if (updates.end_time !== undefined) setEndTime(updates.end_time)
    if (updates.days !== undefined) setSelectedDays(updates.days)

    onScheduleChange({
      is_scheduled: enabled,
      scheduled_start: newStartDate || undefined,
      scheduled_end: newEndDate || undefined,
      time_start: newStartTime || undefined,
      time_end: newEndTime || undefined,
      recurring_days: newDays,
    })
  }

  const toggleDay = (day: number) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day].sort()
    handleChange({ days: newDays })
  }

  return (
    <div className="space-y-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-400" />
          <span className="font-medium text-white">Advanced Scheduling</span>
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
        <div className="space-y-4 pt-2">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Date Range (Optional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleChange({ start_date: e.target.value })}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm outline-none focus:border-blue-500 transition"
                placeholder="Start date"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleChange({ end_date: e.target.value })}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm outline-none focus:border-blue-500 transition"
                placeholder="End date"
              />
            </div>
          </div>

          {/* Time Range */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Daily Time Range (Optional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="time"
                value={startTime}
                onChange={(e) => handleChange({ start_time: e.target.value })}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm outline-none focus:border-blue-500 transition"
                placeholder="Start time"
              />
              <input
                type="time"
                value={endTime}
                onChange={(e) => handleChange({ end_time: e.target.value })}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm outline-none focus:border-blue-500 transition"
                placeholder="End time"
              />
            </div>
          </div>

          {/* Recurring Days */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Repeat className="w-4 h-4 inline mr-1" />
              Recurring Days (Optional)
            </label>
            <div className="flex gap-2">
              {days.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`flex-1 px-2 py-2 rounded-lg text-sm font-medium transition ${
                    selectedDays.includes(day.value)
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                  } border`}
                >
                  {day.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Select days when this link should be visible
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-sm text-blue-400">
              💡 Combine date range, time, and recurring days for precise control
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
