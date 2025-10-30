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
