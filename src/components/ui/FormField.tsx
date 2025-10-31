'use client'

import { useState, useEffect, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react'

interface FormFieldProps {
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}

export function FormField({ label, error, hint, required, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <div className="flex items-start gap-2 text-sm text-red-400 animate-fadeIn">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {hint && !error && (
        <p className="text-sm text-slate-500">{hint}</p>
      )}
    </div>
  )
}

interface ValidatedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  validation?: {
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    custom?: (value: string) => string | null
  }
  onValidationChange?: (isValid: boolean, error?: string) => void
  showValidation?: boolean
}

export function ValidatedInput({ 
  validation, 
  onValidationChange,
  showValidation = false,
  className = '',
  ...props 
}: ValidatedInputProps) {
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)
  const [value, setValue] = useState(props.value || '')

  useEffect(() => {
    if (touched || showValidation) {
      validateValue(value as string)
    }
  }, [value, touched, showValidation])

  const validateValue = (val: string) => {
    if (!validation) {
      onValidationChange?.(true)
      return
    }

    // Required check
    if (validation.required && !val.trim()) {
      const err = 'This field is required'
      setError(err)
      onValidationChange?.(false, err)
      return
    }

    // Min length check
    if (validation.minLength && val.length < validation.minLength) {
      const err = `Must be at least ${validation.minLength} characters`
      setError(err)
      onValidationChange?.(false, err)
      return
    }

    // Max length check
    if (validation.maxLength && val.length > validation.maxLength) {
      const err = `Must be no more than ${validation.maxLength} characters`
      setError(err)
      onValidationChange?.(false, err)
      return
    }

    // Pattern check
    if (validation.pattern && !validation.pattern.test(val)) {
      const err = 'Invalid format'
      setError(err)
      onValidationChange?.(false, err)
      return
    }

    // Custom validation
    if (validation.custom) {
      const customError = validation.custom(val)
      if (customError) {
        setError(customError)
        onValidationChange?.(false, customError)
        return
      }
    }

    setError(null)
    onValidationChange?.(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    props.onChange?.(e)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true)
    props.onBlur?.(e)
  }

  const showError = (touched || showValidation) && error
  const showSuccess = (touched || showValidation) && !error && value

  return (
    <div className="relative">
      <input
        {...props}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`
          w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 transition
          ${showError ? 'border-red-500 pr-10' : ''}
          ${showSuccess ? 'border-green-500 pr-10' : 'border-slate-700'}
          ${className}
        `}
      />
      {showSuccess && (
        <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
      )}
      {showError && (
        <X className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400" />
      )}
    </div>
  )
}

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  showStrength?: boolean
}

export function PasswordInput({ showStrength = true, className = '', ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [strength, setStrength] = useState(0)
  const [value, setValue] = useState('')

  const calculateStrength = (password: string): number => {
    let score = 0
    if (!password) return 0

    // Length
    if (password.length >= 8) score++
    if (password.length >= 12) score++

    // Character types
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++

    return Math.min(score, 5)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setValue(val)
    setStrength(calculateStrength(val))
    props.onChange?.(e)
  }

  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          {...props}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={handleChange}
          className={`
            w-full px-4 py-2.5 pr-12 bg-slate-800 border border-slate-700 rounded-lg text-white
            focus:outline-none focus:ring-2 focus:ring-blue-500 transition
            ${className}
          `}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-700 rounded transition"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5 text-slate-400" />
          ) : (
            <Eye className="w-5 h-5 text-slate-400" />
          )}
        </button>
      </div>

      {showStrength && value && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i < strength ? strengthColors[strength - 1] : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-slate-400">
            Strength: <span className="font-medium">{strengthLabels[strength - 1] || 'Very Weak'}</span>
          </p>
        </div>
      )}
    </div>
  )
}

interface CharacterCountTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxLength: number
}

export function CharacterCountTextarea({ maxLength, className = '', ...props }: CharacterCountTextareaProps) {
  const [value, setValue] = useState(props.value || '')
  const remaining = maxLength - (value as string).length

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    props.onChange?.(e)
  }

  return (
    <div className="space-y-2">
      <textarea
        {...props}
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
        className={`
          w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none
          ${className}
        `}
      />
      <div className="flex justify-end">
        <span className={`text-sm ${remaining < 20 ? 'text-orange-400' : 'text-slate-500'}`}>
          {remaining} characters remaining
        </span>
      </div>
    </div>
  )
}

interface MaskedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  mask: 'phone' | 'url' | 'email'
}

export function MaskedInput({ mask, className = '', ...props }: MaskedInputProps) {
  const [value, setValue] = useState('')

  const applyMask = (val: string): string => {
    if (mask === 'phone') {
      // Format: (123) 456-7890
      const numbers = val.replace(/\D/g, '')
      if (numbers.length <= 3) return numbers
      if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
    }

    if (mask === 'url') {
      // Ensure https://
      if (!val.startsWith('http://') && !val.startsWith('https://')) {
        if (val.length > 0) return `https://${val}`
      }
      return val
    }

    if (mask === 'email') {
      // Auto-lowercase
      return val.toLowerCase()
    }

    return val
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyMask(e.target.value)
    setValue(masked)
    e.target.value = masked
    props.onChange?.(e)
  }

  return (
    <input
      {...props}
      value={value}
      onChange={handleChange}
      className={`
        w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white
        focus:outline-none focus:ring-2 focus:ring-blue-500 transition
        ${className}
      `}
    />
  )
}

interface AutoSaveFormProps {
  onSave: (data: any) => Promise<void>
  debounceMs?: number
  children: React.ReactNode
}

export function AutoSaveForm({ onSave, debounceMs = 1000, children }: AutoSaveFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    let timeout: NodeJS.Timeout

    const handleFormChange = async () => {
      clearTimeout(timeout)
      timeout = setTimeout(async () => {
        setIsSaving(true)
        const form = document.querySelector('form')
        if (form) {
          const formData = new FormData(form)
          const data = Object.fromEntries(formData.entries())
          await onSave(data)
          setLastSaved(new Date())
        }
        setIsSaving(false)
      }, debounceMs)
    }

    const form = document.querySelector('form')
    form?.addEventListener('input', handleFormChange)

    return () => {
      clearTimeout(timeout)
      form?.removeEventListener('input', handleFormChange)
    }
  }, [onSave, debounceMs])

  return (
    <div>
      {children}
      <div className="flex items-center gap-2 text-sm text-slate-400 mt-4">
        {isSaving && (
          <>
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>Saving...</span>
          </>
        )}
        {!isSaving && lastSaved && (
          <>
            <Check className="w-4 h-4 text-green-400" />
            <span>Saved at {lastSaved.toLocaleTimeString()}</span>
          </>
        )}
      </div>
    </div>
  )
}
