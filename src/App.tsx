import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import StarCanvas from './components/StarCanvas'
import ConstellationForm from './components/ConstellationForm'
import ConstellationPanel from './components/ConstellationPanel'
import MythCard from './components/MythCard'
import PlanetArc from './components/PlanetArc'
import AuthButton from './components/AuthButton'
import SplashScreen from './components/SplashScreen'
import EventPage from './pages/EventPage'
import ProfilePage from './pages/ProfilePage'
import { useConstellations } from './hooks/useConstellations'
import { useAuth } from './hooks/useAuth'
import { buildCatalogStars } from './data/realStars'
import { ConstellationLine, Constellation } from './types'
const STARS = buildCatalogStars()

// ── DEV用モック星座データ ──────────────────────────────
// Supabaseにデータがないときだけ表示
const MOCK_USER_1 = { id: 'mock-user-id',  username: 'テストユーザー', avatarUrl: '', bio: '' }
const MOCK_USER_2 = { id: 'mock-user-2',   username: '星見の旅人',    avatarUrl: '', bio: '' }

const MOCK_CONSTELLATIONS: Constellation[] = [
  {
    id: 'mock-c1', name: '夜泣き星座', myth: '夜空の果てで、誰にも言えない気持ちを抱えたまま輝き続ける星たちの物語。情けなくて、でも美しい。',
    color: '#b87ef7', authorId: 'mock-user-id', createdAt: Date.now() - 86400000 * 3,
    lines: [{ from: 'bsc-0', to: 'bsc-5' }, { from: 'bsc-5', to: 'bsc-12' }, { from: 'bsc-12', to: 'bsc-20' }],
    starIds: ['bsc-0', 'bsc-5', 'bsc-12', 'bsc-20'],
    author: MOCK_USER_1,
  },
  {
    id: 'mock-c2', name: '情け三ツ星', myth: '上司に怒られた帰り道、ふと見上げた空に三つの星がならんでいた。どれも同じくらいの明るさで、なぜか少し救われた気がした。',
    color: '#f7c97e', authorId: 'mock-user-id', createdAt: Date.now() - 86400000 * 1,
    lines: [{ from: 'bsc-3', to: 'bsc-8' }, { from: 'bsc-8', to: 'bsc-15' }],
    starIds: ['bsc-3', 'bsc-8', 'bsc-15'],
    author: MOCK_USER_1,
  },
  {
    id: 'mock-c3', name: '孤独の北斗', myth: 'ひとりで飲んでいた夜、居酒屋の外に北斗七星が見えた。あの星たちもきっと、一人で輝いてるんだと思ったら少し楽になった。',
    color: '#7eb8f7', authorId: 'mock-user-2', createdAt: Date.now() - 86400000 * 5,
    lines: [{ from: 'bsc-1', to: 'bsc-9' }, { from: 'bsc-9', to: 'bsc-18' }, { from: 'bsc-18', to: 'bsc-25' }],
    starIds: ['bsc-1', 'bsc-9', 'bsc-18', 'bsc-25'],
    author: MOCK_USER_2,
  },
  {
    id: 'mock-c4', name: '神様の言い訳', myth: '「こんなはずじゃなかった」——神様だってそう思ってるんじゃないかな。この星座を見るたびに、そんな気持ちになる。',
    color: '#f7a050', authorId: 'mock-user-2', createdAt: Date.now() - 86400000 * 2,
    lines: [{ from: 'bsc-4', to: 'bsc-11' }, { from: 'bsc-11', to: 'bsc-22' }, { from: 'bsc-22', to: 'bsc-4' }],
    starIds: ['bsc-4', 'bsc-11', 'bsc-22'],
    author: MOCK_USER_2,
  },
  {
    id: 'mock-c5', name: '返信待ち座', myth: '既読がついてから3時間。スマホを置いて空を見上げたら、やたら輝いてる星があった。あれが返信待ちの星だ、きっと。',
    color: '#7ef7b8', authorId: 'mock-user-id', createdAt: Date.now() - 86400000 * 7,
    lines: [{ from: 'bsc-6', to: 'bsc-14' }, { from: 'bsc-14', to: 'bsc-30' }],
    starIds: ['bsc-6', 'bsc-14', 'bsc-30'],
    author: MOCK_USER_1,
  },
]

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const hideSplash = useCallback(() => setShowSplash(false), [])

  const { user, profile, loading: authLoading, signInWithGoogle, signOut, updateProfile } = useAuth()

  const [pendingForm, setPendingForm]   = useState<{ name: string; myth: string; color: string } | null>(null)
  const [showForm, setShowForm]         = useState(false)
  const [showNameSetup, setShowNameSetup] = useState(false)

  // 初回ログイン: username未設定ならモーダルを表示
  useEffect(() => {
    if (profile && profile.username === '') setShowNameSetup(true)
  }, [profile])
  const [viewing, setViewing]           = useState<Constellation | null>(null)
  const [filterColor, setFilterColor]   = useState<string | null>(null)
  const [loginPrompt, setLoginPrompt]   = useState(false)
  const [drawMode, setDrawMode]         = useState(false)
  const [drawState, setDrawState]       = useState({ selectedCount: 0, canFinish: false })
  const finishDrawRef                   = useRef<(() => void) | null>(null)

  const { constellations, loading: consLoading, addConstellation, deleteConstellation } = useConstellations()

  // DEV: データが空のときはモック星座を表示
  const baseConstellations = !consLoading && constellations.length === 0 ? MOCK_CONSTELLATIONS : constellations

  // 実際に星座が登録されている色だけ有効にする
  const availableColors = useMemo(() =>
    [...new Set(baseConstellations.map((c) => c.color))],
    [baseConstellations]
  )

  const filteredConstellations = useMemo(() =>
    filterColor === null
      ? baseConstellations
      : baseConstellations.filter((c) => c.color === filterColor),
    [baseConstellations, filterColor]
  )

  const handleConstellationComplete = (lines: ConstellationLine[], starIds: string[]) => {
    if (!user || !pendingForm) return
    addConstellation({ name: pendingForm.name, myth: pendingForm.myth, lines, starIds, color: pendingForm.color, authorId: user.id })
    setPendingForm(null)
    setDrawMode(false)
  }

  const handleFormSubmit = (name: string, myth: string, color: string) => {
    setPendingForm({ name, myth, color })
    setShowForm(false)
    setDrawMode(true)
  }

  const handleStartDraw = () => {
    if (!user) { setLoginPrompt(true); return }
    const myCount = constellations.filter((c) => c.authorId === user.id).length
    if (myCount >= 10) {
      alert('星座の記録は10座までです。古い星座を削除してから新しく刻んでください。')
      return
    }
    setShowForm(true)
  }

  const handleCancelDraw = () => {
    setDrawMode(false)
    setPendingForm(null)
  }

  const handleCancelForm = () => setShowForm(false)

  const toggleColor = (color: string) => {
    setFilterColor((prev) => prev === color ? null : color)
  }

  const isOwn = (c: Constellation) => !!user && c.authorId === user.id

  return (
    <>
      {showSplash && <SplashScreen onFinished={hideSplash} />}

      {/* 初回ログイン: 天文学者名登録 */}
      {showNameSetup && user && (
        <NameSetupModal
          onSave={async (name) => {
            await updateProfile({ username: name })
            setShowNameSetup(false)
          }}
        />
      )}

      <Routes>
        <Route path="/event" element={<EventPage />} />
        <Route path="/user/:userId" element={
          <ProfilePage currentUserId={user?.id} onDelete={deleteConstellation} />
        } />
        <Route path="/*" element={
          <div className="app">
            {/* 認証ボタン（左上） */}
            <div className="auth-area">
              <AuthButton
                profile={profile}
                loading={authLoading}
                onLogin={signInWithGoogle}
                onLogout={signOut}
              />
            </div>

            {/* アプリロゴ（左上）→ 自分のプロフィールへ */}
            <LogoButton userId={user?.id} />

            {/* 太陽ボタン＋星座一覧（右上） */}
            <ConstellationPanel
              constellations={filteredConstellations}
              onSelect={setViewing}
              userId={user?.id}
            />

            {/* イベントリンク */}
            <Link to="/event" className="event-link-btn">✦ Events</Link>

            {/* 星空キャンバス */}
            <StarCanvas
              stars={STARS}
              constellations={filteredConstellations}
              drawMode={drawMode}
              finishDrawRef={finishDrawRef}
              onConstellationComplete={handleConstellationComplete}
              onConstellationClick={setViewing}
              onDrawStateChange={setDrawState}
            />

            {/* 惑星アーク＋描画ボタン */}
            <PlanetArc
              drawMode={drawMode}
              drawState={drawState}
              selectedColor={filterColor}
              availableColors={availableColors}
              onColorToggle={toggleColor}
              onStartDraw={handleStartDraw}
              onFinishDraw={() => finishDrawRef.current?.()}
              onCancelDraw={handleCancelDraw}
            />

            {/* ログイン誘導 */}
            {loginPrompt && (
              <div className="myth-overlay" onClick={() => setLoginPrompt(false)}>
                <div className="login-prompt" onClick={(e) => e.stopPropagation()}>
                  <button className="myth-close" onClick={() => setLoginPrompt(false)}>✕</button>
                  <div className="login-prompt-star">✦</div>
                  <h3>星座を刻むにはログインが必要です</h3>
                  <p>Googleアカウントでログインして、あなただけの星座を夜空に刻みましょう。</p>
                  <button className="login-prompt-btn"
                    onClick={() => { setLoginPrompt(false); signInWithGoogle() }}
                  >
                    Googleでログイン
                  </button>
                </div>
              </div>
            )}

            {showForm && (
              <ConstellationForm
                onSubmit={handleFormSubmit}
                onCancel={handleCancelForm}
              />
            )}

            {viewing && (
              <MythCard
                constellation={viewing}
                currentUserId={user?.id}
                onClose={() => setViewing(null)}
                onDelete={deleteConstellation}
                showDelete={isOwn(viewing)}
              />
            )}
          </div>
        } />
      </Routes>
    </>
  )
}

// ── ロゴボタン（自分のプロフィールへ） ──────────────────
function LogoButton({ userId }: { userId?: string }) {
  const navigate = useNavigate()
  return (
    <img
      src="/nasakenightlogo.png"
      alt="情けNIGHT"
      className="app-logo"
      style={{ cursor: userId ? 'pointer' : 'default' }}
      onClick={() => userId && navigate(`/user/${userId}`)}
    />
  )
}

// ── 初回名前登録モーダル ──────────────────────────────
function NameSetupModal({ onSave }: { onSave: (name: string) => Promise<void> }) {
  const [name, setName]   = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    await onSave(name.trim())
  }

  return (
    <div className="myth-overlay" style={{ zIndex: 200 }}>
      <form className="name-setup-modal" onSubmit={handleSubmit}>
        <div className="name-setup-star">✦</div>
        <h2>天文学者の名前を登録</h2>
        <p>夜空に星座を刻む、あなたの名前を教えてください。</p>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例：星見の詩人"
          maxLength={20}
          className="name-setup-input"
        />
        <button type="submit" className="name-setup-btn" disabled={!name.trim() || saving}>
          {saving ? '登録中…' : '夜空へ ✦'}
        </button>
      </form>
    </div>
  )
}
