import { useState, useRef, useMemo } from 'react'
import StarCanvas from './components/StarCanvas'
import ConstellationForm from './components/ConstellationForm'
import ConstellationPanel from './components/ConstellationPanel'
import MythCard from './components/MythCard'
import ColorFilter from './components/ColorFilter'
import { useConstellations } from './hooks/useConstellations'
import { IS_SUPABASE_CONFIGURED } from './supabase'
import { buildCatalogStars } from './data/realStars'
import { ConstellationLine, Constellation } from './types'

const STARS = buildCatalogStars()

// Supabase未設定時のデモ用ローカルストレージフォールバック
function useLocalConstellations() {
  const [constellations, setConstellations] = useState<Constellation[]>(() => {
    try {
      const saved = localStorage.getItem('constellations')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  function addConstellation(params: Omit<Constellation, 'id' | 'createdAt'>) {
    const c: Constellation = {
      ...params,
      id: Date.now().toString(),
      createdAt: Date.now(),
    }
    setConstellations((prev) => {
      const next = [c, ...prev]
      localStorage.setItem('constellations', JSON.stringify(next))
      return next
    })
  }

  return { constellations, loading: false, addConstellation }
}

export default function App() {
  const userId = useRef<string>('user-' + Math.random().toString(36).slice(2)).current
  const [draft, setDraft] = useState<{ lines: ConstellationLine[]; starIds: string[] } | null>(null)
  const [viewing, setViewing] = useState<Constellation | null>(null)
  const [filterColors, setFilterColors] = useState<string[]>([])

  const remote = useConstellations()
  const local = useLocalConstellations()
  const { constellations, addConstellation } = IS_SUPABASE_CONFIGURED ? remote : local

  // 存在する色の一覧（重複なし・出現順）
  const availableColors = useMemo(() => {
    const seen = new Set<string>()
    return constellations
      .map((c) => c.color)
      .filter((color) => { if (seen.has(color)) return false; seen.add(color); return true })
  }, [constellations])

  // フィルター適用済みの星座リスト
  const filteredConstellations = useMemo(() =>
    filterColors.length === 0
      ? constellations
      : constellations.filter((c) => filterColors.includes(c.color)),
    [constellations, filterColors]
  )

  const handleConstellationComplete = (lines: ConstellationLine[], starIds: string[]) => {
    setDraft({ lines, starIds })
  }

  const handleFormSubmit = (name: string, myth: string, color: string) => {
    if (!draft) return
    addConstellation({
      name,
      myth,
      lines: draft.lines,
      starIds: draft.starIds,
      color,
      authorId: userId,
    })
    setDraft(null)  // 即座にフォームを閉じる
  }

  return (
    <div className="app">
      {!IS_SUPABASE_CONFIGURED && (
        <div className="demo-banner">
          デモモード — Supabase未設定のためローカル保存です。
          <a href="https://supabase.com" target="_blank" rel="noreferrer">
            Supabase設定方法 →
          </a>
        </div>
      )}

      <StarCanvas
        stars={STARS}
        constellations={filteredConstellations}
        onConstellationComplete={handleConstellationComplete}
        onConstellationClick={setViewing}
      />

      <ColorFilter
        availableColors={availableColors}
        selected={filterColors}
        onChange={setFilterColors}
      />

      <ConstellationPanel
        constellations={filteredConstellations}
        onSelect={setViewing}
      />

      {draft && (
        <ConstellationForm
          onSubmit={handleFormSubmit}
          onCancel={() => setDraft(null)}
        />
      )}

      {viewing && (
        <MythCard
          constellation={viewing}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  )
}
