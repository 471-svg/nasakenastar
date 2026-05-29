import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabase'
import { fetchPublicProfile } from '../hooks/useAuth'
import { Profile, Constellation, ConstellationLine } from '../types'
import ConstellationCard from '../components/ConstellationCard'
import MythCard from '../components/MythCard'

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

interface Props {
  currentUserId?: string
  onDelete?: (id: string) => void
}

export default function ProfilePage({ currentUserId, onDelete }: Props) {
  const { userId } = useParams<{ userId: string }>()
  const [profile, setProfile]             = useState<Profile | null>(null)
  const [constellations, setConstellations] = useState<Constellation[]>([])
  const [viewing, setViewing]             = useState<Constellation | null>(null)
  const [loading, setLoading]             = useState(true)
  const [editing, setEditing]             = useState(false)

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
        .order('created_at', { ascending: false }),
    ]).then(([prof, { data }]) => {
      setProfile(prof)
      setConstellations(data ? data.map(toConstellation) : [])
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
        <p className="event-loading">読み込み中…</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <nav className="event-nav">
          <Link to="/" className="event-nav-back">← 星空に戻る</Link>
        </nav>
        <p className="event-empty">ユーザーが見つかりません</p>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <nav className="event-nav">
        <Link to="/" className="event-nav-back">← 星空に戻る</Link>
        <h1 className="event-nav-title">Profile</h1>
        <span />
      </nav>

      {/* プロフィールヘッダー */}
      <header className="profile-header">
        <div className="profile-avatar-wrap">
          {profile.avatarUrl
            ? <img src={profile.avatarUrl} alt={profile.username} className="profile-avatar" />
            : <div className="profile-avatar profile-avatar--placeholder">{profile.username[0]}</div>
          }
        </div>
        <div className="profile-info">
          <h2 className="profile-username">{profile.username}</h2>
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}
          <span className="profile-count">
            ✦ {constellations.length} 座の星座を刻んだ
          </span>
        </div>
        {isOwn && (
          <button className="profile-edit-btn" onClick={() => setEditing(true)}>
            編集
          </button>
        )}
      </header>

      {/* 星座グリッド */}
      <section className="profile-grid-section">
        <h3 className="profile-grid-title">刻んだ星座</h3>
        {constellations.length === 0 ? (
          <p className="event-empty">まだ星座がありません</p>
        ) : (
          <div className="profile-grid">
            {constellations.map((c) => (
              <ConstellationCard
                key={c.id}
                constellation={c}
                onClick={() => setViewing(c)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 星座詳細 */}
      {viewing && (
        <MythCard
          constellation={viewing}
          onClose={() => setViewing(null)}
          onDelete={isOwn ? handleDelete : () => {}}
          showDelete={isOwn}
        />
      )}

      {/* プロフィール編集モーダル */}
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

/* ── プロフィール編集 ── */
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
  const [bio, setBio]           = useState(profile.bio)
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
