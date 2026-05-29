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
          setConstellations((prev) => {
            // 楽観的更新で既に追加済みの場合は重複しない
            if (prev.some((c) => c.id === (payload.new as { id: string }).id)) return prev
            return [toConstellation(payload.new), ...prev]
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'constellations' },
        (payload) => {
          setConstellations((prev) => prev.filter((c) => c.id !== (payload.old as { id: string }).id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  function addConstellation(params: {
    name: string
    myth: string
    lines: ConstellationLine[]
    starIds: string[]
    color: string
    authorId: string
  }) {
    const newItem: Constellation = {
      id: Date.now().toString(),
      name: params.name,
      myth: params.myth,
      lines: params.lines,
      starIds: params.starIds,
      color: params.color,
      authorId: params.authorId,
      createdAt: Date.now(),
    }

    // 楽観的更新: DBの応答を待たずに即座に画面へ反映
    setConstellations((prev) => [newItem, ...prev])

    // バックグラウンドでDBに保存
    supabase.from('constellations').insert({
      id: newItem.id,
      name: newItem.name,
      myth: newItem.myth,
      lines: newItem.lines,
      star_ids: newItem.starIds,
      color: newItem.color,
      author_id: newItem.authorId,
      created_at: newItem.createdAt,
    }).then(({ error }) => {
      if (error) {
        console.error('[Supabase] INSERT失敗:', JSON.stringify(error))
      }
    })
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
