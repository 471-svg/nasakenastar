import { useState } from 'react'

const COLORS = [
  '#7eb8f7', '#f7c97e', '#f77eb8', '#7ef7b8', '#b87ef7', '#f77e7e', '#7ef7f7',
]

interface Props {
  onSubmit: (name: string, myth: string, color: string) => void
  onCancel: () => void
}

export default function ConstellationForm({ onSubmit, onCancel }: Props) {
  const [name, setName] = useState('')
  const [myth, setMyth] = useState('')
  const [color, setColor] = useState(COLORS[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit(name.trim(), myth.trim(), color)
  }

  return (
    <div className="form-overlay">
      <form className="constellation-form" onSubmit={handleSubmit}>
        <h2>星座に名前をつける</h2>

        <label>
          <span>星座名</span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例：大きな狐座"
            maxLength={40}
          />
        </label>

        <label>
          <span>神話・伝説</span>
          <textarea
            value={myth}
            onChange={(e) => setMyth(e.target.value)}
            placeholder="この星座にまつわる物語を書いてください…"
            rows={5}
            maxLength={500}
          />
        </label>

        <div className="color-picker">
          <span>星座の色</span>
          <div className="color-swatches">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`swatch ${color === c ? 'selected' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onCancel}>
            キャンセル
          </button>
          <button type="submit" className="btn-submit" disabled={!name.trim()}>
            夜空に刻む
          </button>
        </div>
      </form>
    </div>
  )
}
