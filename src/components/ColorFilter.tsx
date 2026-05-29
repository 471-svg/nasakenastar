interface Props {
  /** 現在存在する星座の色一覧（重複なし） */
  availableColors: string[]
  /** 選択中の色（空 = 全て表示） */
  selected: string[]
  onChange: (colors: string[]) => void
}

export default function ColorFilter({ availableColors, selected, onChange }: Props) {
  if (availableColors.length === 0) return null

  const toggle = (color: string) => {
    if (selected.includes(color)) {
      onChange(selected.filter((c) => c !== color))
    } else {
      onChange([...selected, color])
    }
  }

  const isFiltering = selected.length > 0

  return (
    <div className="color-filter">
      {/* 全て表示ボタン */}
      <button
        className={`cf-all ${!isFiltering ? 'cf-all--active' : ''}`}
        onClick={() => onChange([])}
        title="全て表示"
      >
        全
      </button>

      {/* 色ドット */}
      {availableColors.map((color) => {
        const active = selected.includes(color)
        return (
          <button
            key={color}
            className={`cf-dot ${active ? 'cf-dot--active' : ''} ${isFiltering && !active ? 'cf-dot--dim' : ''}`}
            style={{ '--dot-color': color } as React.CSSProperties}
            onClick={() => toggle(color)}
            title={color}
          />
        )
      })}
    </div>
  )
}
