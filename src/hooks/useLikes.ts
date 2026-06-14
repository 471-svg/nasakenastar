import { useState, useEffect, useCallback } from 'react'
import { supabase, IS_SUPABASE_CONFIGURED } from '../supabase'

interface LikeSummary {
  count: number
  likedByMe: boolean
}

export function useLikes(constellationId: string, userId: string | undefined) {
  const [summary, setSummary] = useState<LikeSummary>({ count: 0, likedByMe: false })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!IS_SUPABASE_CONFIGURED || !constellationId) return
    supabase
      .from('likes')
      .select('user_id', { count: 'exact' })
      .eq('constellation_id', constellationId)
      .then(({ data, count }) => {
        const likedByMe = !!userId && !!(data ?? []).find((r) => r.user_id === userId)
        setSummary({ count: count ?? 0, likedByMe })
      })
  }, [constellationId, userId])

  const toggle = useCallback(async () => {
    if (!userId || loading) return
    setLoading(true)
    if (summary.likedByMe) {
      await supabase.from('likes').delete()
        .eq('constellation_id', constellationId)
        .eq('user_id', userId)
      setSummary((s) => ({ count: Math.max(0, s.count - 1), likedByMe: false }))
    } else {
      await supabase.from('likes').insert({ constellation_id: constellationId, user_id: userId })
      setSummary((s) => ({ count: s.count + 1, likedByMe: true }))
    }
    setLoading(false)
  }, [constellationId, userId, summary.likedByMe, loading])

  return { ...summary, toggle }
}
