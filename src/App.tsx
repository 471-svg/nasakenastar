import { useState, useRef } from 'react'
import StarCanvas from './components/StarCanvas'
import ConstellationForm from './components/ConstellationForm'
import ConstellationPanel from './components/ConstellationPanel'
import MythCard from './components/MythCard'
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

  const remote = useConstellations()
  const local = useLocalConstellations()
  const { constellations, addConstellation } = IS_SUPABASE_CONFIGURED ? remote : local

  const handleConstellationComplete = (lines: ConstellationLine[], starIds: string[]) => {
    setDraft({ lines, starIds })
  }

  const handleFormSubmit = async (name: string, myth: string, color: string) => {
    if (!draft) return
    await addConstellation({
      name,
      myth,
      lines: draft.lines,
      starIds: draft.starIds,
      color,
      authorId: userId,
    })
    setDraft(null)
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
        constellations={constellations}
        onConstellationComplete={handleConstellationComplete}
        onConstellationClick={setViewing}
      />

      <ConstellationPanel
        constellations={constellations}
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
