import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useProfile(username?: string) {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProfile() {
      try {
        let query = supabase.from('profiles').select('*')
        
        if (username) {
          query = query.eq('username', username)
        } else {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            setLoading(false)
            return
          }
          query = query.eq('id', user.id)
        }

        const { data, error } = await query.single()

        if (error) {
          console.error('Error fetching profile:', error)
          setProfile(null)
        } else {
          setProfile(data)
        }
      } catch (error) {
        console.error('Error in useProfile:', error)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [username])

  return { profile, loading }
}
