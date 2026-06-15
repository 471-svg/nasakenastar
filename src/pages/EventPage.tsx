import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useEvents, createEvent, EventData } from '../hooks/useEvents'

export default function EventPage() {
  const { events, loading } = useEvents()
  const [showAdmin, setShowAdmin] = useState(false)

  return (
    <div className="event-page">
      {/* ナビ */}
      <nav className="event-nav">
        <Link to="/" className="event-nav-back">← 星空に戻る</Link>
        <h1 className="event-nav-title">Events</h1>
        <button
          className="event-nav-admin"
          onClick={() => setShowAdmin((v) => !v)}
          title="管理者用"
        >
          ✦
        </button>
      </nav>

      {/* 管理者フォーム */}
      {showAdmin && <AdminForm onClose={() => setShowAdmin(false)} />}

      {/* 告知フライヤー */}
      <div className="event-flyer-wrap">
        <img src="/bana-.png" alt="情けNIGHT プラネタリウム" className="event-flyer-img" />
        <img src="/manga1.png" alt="情けNIGHT comics" className="event-flyer-img" />
      </div>

      {/* イベント一覧 */}
      <main className="event-main">
        {loading && <p className="event-loading">読み込み中…</p>}
        {!loading && events.length === 0 && (
          <p className="event-empty">イベントはまだありません</p>
        )}
        {events.map((ev) => (
          <EventCard key={ev.id} event={ev} />
        ))}
      </main>
    </div>
  )
}

/* ── イベントカード ─────────────────────────── */
function EventCard({ event }: { event: EventData }) {
  const date = new Date(event.date)
  const dateStr = date.toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric',
    weekday: 'short',
  })
  const timeStr = date.toLocaleTimeString('ja-JP', {
    hour: '2-digit', minute: '2-digit',
  })
  const isPast = date < new Date()

  return (
    <article className={`event-card ${isPast ? 'event-card--past' : ''}`}>
      {event.image_url && (
        <div className="event-card-img-wrap">
          <img src={event.image_url} alt={event.name} className="event-card-img" />
          {isPast && <span className="event-card-badge">終了</span>}
        </div>
      )}
      <div className="event-card-body">
        <div className="event-card-date">
          <span className="event-card-date-main">{dateStr}</span>
          <span className="event-card-date-time">{timeStr}〜</span>
        </div>
        <h2 className="event-card-name">{event.name}</h2>
        {event.location && (
          <p className="event-card-location">📍 {event.location}</p>
        )}
        <p className="event-card-desc">{event.description}</p>
        {event.form_url && !isPast && (
          <a
            href={event.form_url}
            target="_blank"
            rel="noreferrer"
            className="event-card-apply"
          >
            申し込む →
          </a>
        )}
      </div>
    </article>
  )
}

/* ── 管理者フォーム ─────────────────────────── */
function AdminForm({ onClose }: { onClose: () => void }) {
  const [name, setName]         = useState('')
  const [desc, setDesc]         = useState('')
  const [date, setDate]         = useState('')
  const [location, setLocation] = useState('')
  const [formUrl, setFormUrl]   = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview]   = useState<string | null>(null)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setImageFile(file)
    if (file) setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !date) return
    setSaving(true)
    setError(null)
    const { error } = await createEvent(
      { name, description: desc, date, location, image_url: '', form_url: formUrl },
      imageFile
    )
    setSaving(false)
    if (error) { setError(error); return }
    window.location.reload()
  }

  return (
    <div className="admin-overlay" onClick={onClose}>
      <form className="admin-form" onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
        <div className="admin-form-header">
          <h3>イベントを追加</h3>
          <button type="button" onClick={onClose}>✕</button>
        </div>

        <label className="admin-label">
          <span>イベント名 *</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="星まつり2025" required />
        </label>

        <label className="admin-label">
          <span>日時 *</span>
          <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>

        <label className="admin-label">
          <span>場所</span>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="東京都 ○○公園" />
        </label>

        <label className="admin-label">
          <span>説明文</span>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} placeholder="イベントの詳細を書いてください…" />
        </label>

        <label className="admin-label">
          <span>Google フォーム URL</span>
          <input value={formUrl} onChange={(e) => setFormUrl(e.target.value)} placeholder="https://forms.gle/..." />
        </label>

        <div className="admin-label">
          <span>画像</span>
          <label className="admin-upload">
            {preview
              ? <img src={preview} alt="preview" className="admin-preview" />
              : <span>クリックして画像を選択</span>
            }
            <input type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
          </label>
        </div>

        {error && <p className="admin-error">{error}</p>}

        <button type="submit" className="admin-submit" disabled={saving || !name || !date}>
          {saving ? '保存中…' : '登録する'}
        </button>
      </form>
    </div>
  )
}
