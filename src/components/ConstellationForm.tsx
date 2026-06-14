import { useState } from 'react'
import { PLANET_COLORS } from '../data/planetColors'

interface Props {
  onSubmit: (name: string, myth: string, color: string) => void
  onCancel: () => void
}

export default function ConstellationForm({ onSubmit, onCancel }: Props) {
  const [name, setName] = useState('')
  const [myth, setMyth] = useState('')
  const [color, setColor] = useState(PLANET_COLORS[0].color)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit(name.trim(), myth.trim(), color)
  }

  return (
    <div className="form-overlay">
      <form className="constellation-form" onSubmit={handleSubmit}>
        <h2>星座を作る</h2>

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
          <div className="planet-color-swatches">
            {PLANET_COLORS.map(({ color: c, label, img }) => (
              <button
                key={c}
                type="button"
                className={`planet-color-btn ${color === c ? 'selected' : ''}`}
                onClick={() => setColor(c)}
                aria-label={label}
              >
                <img src={img} alt={label} />
              </button>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onCancel}>
            キャンセル
          </button>
          <button type="submit" className="btn-submit" disabled={!name.trim()}>
            星を選ぶ →
          </button>
        </div>
      </form>
    </div>
  )
}
