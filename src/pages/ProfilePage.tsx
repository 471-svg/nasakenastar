import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabase'
import { fetchPublicProfile } from '../hooks/useAuth'
import { Profile, Constellation, ConstellationLine } from '../types'
import MythCard from '../components/MythCard'
import { findIllustration } from '../data/illustrations'

// App.tsxのMOCK_CONSTELLATIONSと同じデータ（dev確認用）
const MOCK_USER_1 = { id: 'mock-user-id', username: 'テストユーザー', avatarUrl: '', bio: '' }
const MOCK_USER_2 = { id: 'mock-user-2',  username: '星見の旅人',    avatarUrl: '', bio: '' }
const DEV_CONSTELLATIONS: Constellation[] = [
  { id: 'mock-c1', name: '夜泣き星座',  myth: '夜空の果てで、誰にも言えない気持ちを抱えたまま輝き続ける星たちの物語。情けなくて、でも美しい。', color: '#b87ef7', authorId: 'mock-user-id', createdAt: Date.now() - 86400000*3, lines: [{ from:'bsc-0', to:'bsc-5' },{ from:'bsc-5', to:'bsc-12' }], starIds: ['bsc-0','bsc-5','bsc-12'], author: MOCK_USER_1 },
  { id: 'mock-c2', name: '情け三ツ星',  myth: '上司に怒られた帰り道、ふと見上げた空に三つの星がならんでいた。どれも同じくらいの明るさで、なぜか少し救われた気がした。', color: '#f7c97e', authorId: 'mock-user-id', createdAt: Date.now() - 86400000*1, lines: [{ from:'bsc-3', to:'bsc-8' },{ from:'bsc-8', to:'bsc-15' }], starIds: ['bsc-3','bsc-8','bsc-15'], author: MOCK_USER_1 },
  { id: 'mock-c5', name: '返信待ち座',  myth: '既読がついてから3時間。スマホを置いて空を見上げたら、やたら輝いてる星があった。あれが返信待ちの星だ、きっと。', color: '#7ef7b8', authorId: 'mock-user-id', createdAt: Date.now() - 86400000*7, lines: [{ from:'bsc-6', to:'bsc-14' }], starIds: ['bsc-6','bsc-14'], author: MOCK_USER_1 },
  { id: 'mock-c3', name: '孤独の北斗',  myth: 'ひとりで飲んでいた夜、居酒屋の外に北斗七星が見えた。あの星たちもきっと、一人で輝いてるんだと思ったら少し楽になった。', color: '#7eb8f7', authorId: 'mock-user-2', createdAt: Date.now() - 86400000*5, lines: [{ from:'bsc-1', to:'bsc-9' }], starIds: ['bsc-1','bsc-9'], author: MOCK_USER_2 },
  { id: 'mock-c4', name: '神様の言い訳', myth: '「こんなはずじゃなかった」——神様だってそう思ってるんじゃないかな。この星座を見るたびに、そんな気持ちになる。', color: '#f7a050', authorId: 'mock-user-2', createdAt: Date.now() - 86400000*2, lines: [{ from:'bsc-4', to:'bsc-11' }], starIds: ['bsc-4','bsc-11'], author: MOCK_USER_2 },
]

const MAX_CONSTELLATIONS = 10

function toConstellation(row: Record<string, unknown>): Constellation {
  return {
    id:       row.id       as string,
    name:     row.name     as string,
    myth:     (row.myth    as string) ?? '',
    lines:    row.lines    as ConstellationLine[],
    starIds:  row.star_ids as string[],
    color:    row.color    as string,
    authorId: (row.author_id as string) ?? '',
    createdAt: row.created_at as number,
  }
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
}

const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X']

interface Props {
  currentUserId?: string
  onDelete?: (id: string) => void
}

export default function ProfilePage({ currentUserId, onDelete }: Props) {
  const { userId } = useParams<{ userId: string }>()
  const [profile, setProfile]               = useState<Profile | null>(null)
  const [constellations, setConstellations] = useState<Constellation[]>([])
  const [viewing, setViewing]               = useState<Constellation | null>(null)
  const [loading, setLoading]               = useState(true)
  const [editing, setEditing]               = useState(false)

  const isOwn = !!currentUserId && currentUserId === userId

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    Promise.all([
      fetchPublicProfile(userId),
      supabase
        .from('constellations')
        .select('*')
        .eq('author_id', userId)
        .order('created_at', { ascending: true }),
    ]).then(([prof, { data }]) => {
      // DEV: mock-user-idはSupabaseに存在しないのでダミーデータを使う
      const DEV_PROFILES: Record<string, Profile> = {
        'mock-user-id': { id: 'mock-user-id', username: 'テストユーザー', avatarUrl: '', bio: '夜空の研究者' },
        'mock-user-2':  { id: 'mock-user-2',  username: '星見の旅人',    avatarUrl: '', bio: 'ひとりで飲むのが好きな星詠み人' },
      }
      const resolvedProfile = prof ?? DEV_PROFILES[userId ?? ''] ?? null
      setProfile(resolvedProfile)
      // DEV: Supabaseにデータがなければモックデータを使う
      const realData = data ? data.map(toConstellation) : []
      const devFallback = DEV_CONSTELLATIONS.filter((c) => c.authorId === userId)
      setConstellations(realData.length > 0 ? realData : devFallback)
      setLoading(false)
    })
  }, [userId])

  const handleDelete = (id: string) => {
    setConstellations((prev) => prev.filter((c) => c.id !== id))
    onDelete?.(id)
  }

  if (loading) {
    return (
      <div className="profile-page">
        <nav className="event-nav">
          <Link to="/" className="event-nav-back">← 星空に戻る</Link>
        </nav>
        <p className="event-loading">記録を探しています…</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <nav className="event-nav">
          <Link to="/" className="event-nav-back">← 星空に戻る</Link>
        </nav>
        <p className="event-empty">天文学者が見つかりません</p>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <nav className="event-nav">
        <Link to="/" className="event-nav-back">← 星空に戻る</Link>
        <h1 className="event-nav-title">Archive</h1>
        <span />
      </nav>

      {/* 天文学者カード */}
      <div className="archive-researcher">
        <div className="archive-researcher-inner">
          <div className="archive-corner archive-corner--tl">✦</div>
          <div className="archive-corner archive-corner--tr">✦</div>
          <div className="archive-corner archive-corner--bl">✦</div>
          <div className="archive-corner archive-corner--br">✦</div>

          <div className="archive-researcher-avatar">
            {profile.avatarUrl
              ? <img src={profile.avatarUrl} alt={profile.username} />
              : <span>{profile.username[0]}</span>
            }
          </div>
          <div className="archive-researcher-info">
            <p className="archive-researcher-role">天文学者</p>
            <h2 className="archive-researcher-name">{profile.username}</h2>
            {profile.bio && <p className="archive-researcher-bio">{profile.bio}</p>}
            <p className="archive-researcher-count">
              {constellations.length} / {MAX_CONSTELLATIONS} 座の星座を記録
            </p>
          </div>
          {isOwn && (
            <button className="archive-edit-btn" onClick={() => setEditing(true)}>編集</button>
          )}
        </div>
      </div>

      {/* 星座目録 */}
      <div className="archive-catalog">
        <div className="archive-catalog-title">
          <span className="archive-ornament">— ✦ —</span>
          <h3>星座目録</h3>
          <span className="archive-ornament">— ✦ —</span>
        </div>

        {constellations.length === 0 ? (
          <p className="archive-empty">この天文学者はまだ星座を記録していません</p>
        ) : (
          <div className="archive-entries">
            {constellations.map((c, i) => {
              const illus = findIllustration(c.name, c.myth ?? '')
              return (
                <button
                  key={c.id}
                  className="archive-entry"
                  onClick={() => setViewing(c)}
                >
                  <span className="archive-entry-num">{ROMAN[i] ?? i + 1}</span>
                  <div className="archive-entry-illus" style={{ color: c.color }}>
                    <svg viewBox="0 0 200 200" width="52" height="52"
                      dangerouslySetInnerHTML={{ __html: illus.svg }} />
                  </div>
                  <div className="archive-entry-body">
                    <span className="archive-entry-name" style={{ color: c.color }}>{c.name}</span>
                    {c.myth && (
                      <span className="archive-entry-excerpt">
                        {c.myth.slice(0, 36)}{c.myth.length > 36 ? '…' : ''}
                      </span>
                    )}
                    <span className="archive-entry-date">{formatDate(c.createdAt)}</span>
                  </div>
                  <span className="archive-entry-arrow">›</span>
                </button>
              )
            })}

            {/* 空きページ */}
            {Array.from({ length: MAX_CONSTELLATIONS - constellations.length }).map((_, i) => (
              <div key={`empty-${i}`} className="archive-entry archive-entry--empty">
                <span className="archive-entry-num">{ROMAN[constellations.length + i] ?? constellations.length + i + 1}</span>
                <span className="archive-entry-empty-text">— 未記録 —</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {viewing && (
        <MythCard
          constellation={viewing}
          currentUserId={currentUserId}
          onClose={() => setViewing(null)}
          onDelete={isOwn ? handleDelete : () => {}}
          showDelete={isOwn}
        />
      )}

      {editing && (
        <EditProfileModal
          profile={profile}
          onSave={(updated) => { setProfile(updated); setEditing(false) }}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  )
}

function EditProfileModal({
  profile,
  onSave,
  onClose,
}: {
  profile: Profile
  onSave: (p: Profile) => void
  onClose: () => void
}) {
  const [username, setUsername] = useState(profile.username)
  const [bio, setBio]           = useState(profile.bio ?? '')
  const [saving, setSaving]     = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { data } = await supabase
      .from('profiles')
      .update({ username, bio })
      .eq('id', profile.id)
      .select()
      .single()
    setSaving(false)
    if (data) onSave({ ...profile, username, bio })
  }

  return (
    <div className="admin-overlay" onClick={onClose}>
      <form className="admin-form" onSubmit={handleSave} onClick={(e) => e.stopPropagation()}>
        <div className="admin-form-header">
          <h3>プロフィールを編集</h3>
          <button type="button" onClick={onClose}>✕</button>
        </div>
        <label className="admin-label">
          <span>ユーザー名</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} maxLength={30} required />
        </label>
        <label className="admin-label">
          <span>自己紹介</span>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={200} placeholder="あなたのことを書いてください…" />
        </label>
        <button type="submit" className="admin-submit" disabled={saving || !username}>
          {saving ? '保存中…' : '保存する'}
        </button>
      </form>
    </div>
  )
}
