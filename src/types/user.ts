export interface SocialLinks {
  instagram?: string
  twitter?: string
  facebook?: string
  youtube?: string
  twitch?: string
  github?: string
  linkedin?: string
  email?: string
  website?: string
  [key: string]: string | undefined
}

export interface Profile {
  id: string
  username: string
  display_name?: string
  bio?: string
  avatar_url?: string
  social_links?: SocialLinks
  theme?: string
  button_style?: string
  accent_color?: string
  created_at: string
  updated_at: string
}

export interface Link {
  id: string
  user_id: string
  title: string
  url: string
  icon?: string
  position: number
  active: boolean
  created_at: string
  updated_at: string
}
