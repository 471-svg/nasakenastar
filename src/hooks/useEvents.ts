import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export interface EventData {
  id: string
  name: string
  description: string
  date: string          // ISO 8601 "2025-08-10T18:00"
  location: string
  image_url: string
  form_url: string      // Google フォームの URL
  created_at: number
}

export function useEvents() {
  const [events, setEvents] = useState<EventData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error('[Supabase] events fetch:', error)
        if (data) setEvents(data as EventData[])
        setLoading(false)
      })
  }, [])

  return { events, loading }
}

// イベント作成（管理者用）
export async function createEvent(
  params: Omit<EventData, 'id' | 'created_at'>,
  imageFile: File | null
): Promise<{ error: string | null }> {
  let imageUrl = params.image_url

  // 画像アップロード
  if (imageFile) {
    const ext = imageFile.name.split('.').pop()
    const path = `events/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(path, imageFile, { upsert: true })

    if (uploadError) return { error: uploadError.message }

    const { data: urlData } = supabase.storage
      .from('event-images')
      .getPublicUrl(path)
    imageUrl = urlData.publicUrl
  }

  const { error } = await supabase.from('events').insert({
    id: Date.now().toString(),
    ...params,
    image_url: imageUrl,
    created_at: Date.now(),
  })

  return { error: error?.message ?? null }
}
