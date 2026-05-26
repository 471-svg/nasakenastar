import { useState } from 'react'
import { Constellation } from '../types'

interface Props {
  constellations: Constellation[]
  onSelect: (c: Constellation) => void
}

export default function ConstellationPanel({ constellations, onSelect }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button className="panel-toggle" onClick={() => setOpen((v) => !v)}>
        ✦ 星座一覧 ({constellations.length})
      </button>

      {open && (
        <div className="panel">
          <div className="panel-header">
            <h3>星座一覧</h3>
            <button className="panel-close" onClick={() => setOpen(false)}>✕</button>
          </div>
          <ul className="constellation-list">
            {constellations.length === 0 && (
              <li className="empty">まだ星座がありません</li>
            )}
            {constellations.map((c) => (
              <li
                key={c.id}
                className="constellation-item"
                onClick={() => {
                  onSelect(c)
                  setOpen(false)
                }}
              >
                <span className="dot" style={{ color: c.color }}>✦</span>
                <span className="cname">{c.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
