export type ButtonStyle = 'solid' | 'outline' | 'soft-shadow' | 'neon-glow'
export type BorderRadius = 'none' | 'sm' | 'rounded' | 'lg' | 'full'
export type Animation = 'none' | 'pulse' | 'bounce' | 'glow'

export interface Link {
  id: string
  user_id: string
  title: string
  url: string
  icon?: string
  position: number
  is_active: boolean
  is_scheduled: boolean
  scheduled_start?: string
  scheduled_end?: string
  link_type?: 'regular' | 'social'
  social_platform?: string
  button_style?: ButtonStyle
  custom_color?: string
  border_radius?: BorderRadius
  animation?: Animation
  created_at: string
  updated_at: string
}

export interface LinkFormData {
  title: string
  url: string
  icon?: string
  is_scheduled?: boolean
  scheduled_start?: string
  scheduled_end?: string
}
