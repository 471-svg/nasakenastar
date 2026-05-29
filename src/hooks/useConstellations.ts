import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { Constellation, ConstellationLine } from '../types'

export function useConstellations() {
  const [constellations, setConstellations] = useState<Constellation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 初回取得
    supabase
      .from('constellations')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setConstellations(data.map(toConstellation))
        setLoading(false)
      })

    // リアルタイム購読
    const channel = supabase
      .channel('constellations-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'constellations' },
        (payload) => {
          setConstellations((prev) => [toConstellation(payload.new), ...prev])
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'constellations' },
        (payload) => {
          setConstellations((prev) => prev.filter((c) => c.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function addConstellation(params: {
    name: string
    myth: string
    lines: ConstellationLine[]
    starIds: string[]
    color: string
    authorId: string
  }) {
    const { error } = await supabase.from('constellations').insert({
      id: Date.now().toString(),
      name: params.name,
      myth: params.myth,
      lines: params.lines,
      star_ids: params.starIds,
      color: params.color,
      author_id: params.authorId,
      created_at: Date.now(),
    })
    if (error) throw error
  }

  return { constellations, loading, addConstellation }
}

// DB のスネークケース → アプリのキャメルケース に変換
function toConstellation(row: Record<string, unknown>): Constellation {
  return {
    id: row.id as string,
    name: row.name as string,
    myth: (row.myth as string) ?? '',
    lines: row.lines as ConstellationLine[],
    starIds: row.star_ids as string[],
    color: row.color as string,
    authorId: (row.author_id as string) ?? '',
    createdAt: row.created_at as number,
  }
}
