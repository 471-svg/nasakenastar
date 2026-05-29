import { useState, useMemo } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import StarCanvas from './components/StarCanvas'
import ConstellationForm from './components/ConstellationForm'
import ConstellationPanel from './components/ConstellationPanel'
import MythCard from './components/MythCard'
import ColorFilter from './components/ColorFilter'
import AuthButton from './components/AuthButton'
import EventPage from './pages/EventPage'
import ProfilePage from './pages/ProfilePage'
import { useConstellations } from './hooks/useConstellations'
import { useAuth } from './hooks/useAuth'
import { buildCatalogStars } from './data/realStars'
import { ConstellationLine, Constellation } from './types'

const STARS = buildCatalogStars()

export default function App() {
  const { user, profile, loading: authLoading, signInWithGoogle, signOut } = useAuth()
  const [draft, setDraft]           = useState<{ lines: ConstellationLine[]; starIds: string[] } | null>(null)
  const [viewing, setViewing]       = useState<Constellation | null>(null)
  const [filterColors, setFilterColors] = useState<string[]>([])
  const [loginPrompt, setLoginPrompt]   = useState(false)

  const { constellations, addConstellation, deleteConstellation } = useConstellations()

  const availableColors = useMemo(() => {
    const seen = new Set<string>()
    return constellations
      .map((c) => c.color)
      .filter((color) => { if (seen.has(color)) return false; seen.add(color); return true })
  }, [constellations])

  const filteredConstellations = useMemo(() =>
    filterColors.length === 0
      ? constellations
      : constellations.filter((c) => filterColors.includes(c.color)),
    [constellations, filterColors]
  )

  const handleConstellationComplete = (lines: ConstellationLine[], starIds: string[]) => {
    if (!user) { setLoginPrompt(true); return }
    setDraft({ lines, starIds })
  }

  const handleFormSubmit = (name: string, myth: string, color: string) => {
    if (!draft || !user) return
    addConstellation({
      name,
      myth,
      lines: draft.lines,
      starIds: draft.starIds,
      color,
      authorId: user.id,
    })
    setDraft(null)
  }

  // 自分の星座かどうか
  const isOwn = (c: Constellation) => !!user && c.authorId === user.id

  return (
    <Routes>
      <Route path="/event" element={<EventPage />} />
      <Route path="/user/:userId" element={
        <ProfilePage
          currentUserId={user?.id}
          onDelete={deleteConstellation}
        />
      } />
      <Route path="/*" element={
        <div className="app">
          {/* 認証ボタン（右上） */}
          <div className="auth-area">
            <AuthButton
              profile={profile}
              loading={authLoading}
              onLogin={signInWithGoogle}
              onLogout={signOut}
            />
          </div>

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

          <Link to="/event" className="event-link-btn">✦ Events</Link>

          {/* ログイン誘導 */}
          {loginPrompt && (
            <div className="myth-overlay" onClick={() => setLoginPrompt(false)}>
              <div className="login-prompt" onClick={(e) => e.stopPropagation()}>
                <button className="myth-close" onClick={() => setLoginPrompt(false)}>✕</button>
                <div className="login-prompt-star">✦</div>
                <h3>星座を刻むにはログインが必要です</h3>
                <p>Googleアカウントでログインして、あなただけの星座を夜空に刻みましょう。</p>
                <button
                  className="login-prompt-btn"
                  onClick={() => { setLoginPrompt(false); signInWithGoogle() }}
                >
                  Googleでログイン
                </button>
              </div>
            </div>
          )}

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
              onDelete={deleteConstellation}
              showDelete={isOwn(viewing)}
            />
          )}
        </div>
      } />
    </Routes>
  )
}
