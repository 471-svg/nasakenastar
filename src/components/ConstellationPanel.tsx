import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Constellation } from '../types'

interface Props {
  constellations: Constellation[]
  onSelect: (c: Constellation) => void
  userId?: string
}

export default function ConstellationPanel({ constellations, onSelect, userId }: Props) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* 太陽ボタン */}
      <button className="sun-btn" onClick={() => setOpen((v) => !v)} aria-label="星座一覧">
        <img src="/buttonUI/sun.png" alt="sun" className="sun-img" />
      </button>

      {/* パネル */}
      {open && (
        <>
          <div className="panel-backdrop" onClick={() => setOpen(false)} />
          <div className="panel">
            {userId && (
              <button className="panel-profile-btn" onClick={() => { setOpen(false); navigate(`/user/${userId}`) }}>
                ✦ 私の星座たち
              </button>
            )}
            <div className="panel-header">
              <h3>星座一覧 ({constellations.length})</h3>
              <button className="panel-close" onClick={() => setOpen(false)}>✕</button>
            </div>
            <ul className="constellation-list">
              {constellations.length === 0 && (
                <li className="empty">まだ星座がありません</li>
              )}
              {constellations.map((c) => (
                <li key={c.id} className="constellation-item"
                  onClick={() => { onSelect(c); setOpen(false) }}
                >
                  <span className="dot" style={{ color: c.color }}>✦</span>
                  <span className="cname">{c.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </>
  )
}
