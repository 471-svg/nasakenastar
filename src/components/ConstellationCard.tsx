import { useMemo } from 'react'
import { Constellation } from '../types'
import { buildCatalogStars } from '../data/realStars'

// 星座のミニプレビューカード（プロフィールページ用）
interface Props {
  constellation: Constellation
  onClick: () => void
}

const ALL_STARS = buildCatalogStars()
const STAR_MAP  = new Map(ALL_STARS.map((s) => [s.id, s]))

export default function ConstellationCard({ constellation, onClick }: Props) {
  // 星座に含まれる星の座標を 0-100 の正規化座標に変換
  const { points, lines, viewBox } = useMemo(() => {
    const pts = constellation.starIds
      .map((id) => STAR_MAP.get(id))
      .filter(Boolean) as { x: number; y: number; id: string; size: number }[]

    if (pts.length === 0) return { points: [], lines: [], viewBox: '0 0 100 100' }

    const xs = pts.map((p) => p.x)
    const ys = pts.map((p) => p.y)
    const minX = Math.min(...xs), maxX = Math.max(...xs)
    const minY = Math.min(...ys), maxY = Math.max(...ys)
    const pad = 20

    const w = maxX - minX || 1
    const h = maxY - minY || 1
    const scale = (100 - pad * 2) / Math.max(w, h)

    const norm = (p: { x: number; y: number; id: string; size: number }) => ({
      id: p.id,
      size: p.size,
      nx: (p.x - minX) * scale + pad + (Math.max(w, h) - w) * scale / 2,
      ny: (p.y - minY) * scale + pad + (Math.max(w, h) - h) * scale / 2,
    })

    const normMap = new Map(pts.map((p) => [p.id, norm(p)]))

    const lineCoords = constellation.lines
      .map((l) => ({ from: normMap.get(l.from), to: normMap.get(l.to) }))
      .filter((l) => l.from && l.to) as { from: { nx: number; ny: number }; to: { nx: number; ny: number } }[]

    return {
      points: pts.map((p) => norm(p)),
      lines: lineCoords,
      viewBox: '0 0 100 100',
    }
  }, [constellation])

  return (
    <button className="ccard" onClick={onClick} style={{ '--ccard-color': constellation.color } as React.CSSProperties}>
      <div className="ccard-preview">
        <svg viewBox={viewBox} width="100%" height="100%">
          {lines.map((l, i) => (
            <line
              key={i}
              x1={l.from.nx} y1={l.from.ny}
              x2={l.to.nx}   y2={l.to.ny}
              stroke={constellation.color}
              strokeWidth={1.2}
              strokeOpacity={0.7}
            />
          ))}
          {points.map((p) => (
            <circle
              key={p.id}
              cx={p.nx} cy={p.ny}
              r={Math.max(1.5, p.size * 0.8)}
              fill={constellation.color}
              fillOpacity={0.9}
            />
          ))}
        </svg>
      </div>
      <div className="ccard-name">{constellation.name}</div>
    </button>
  )
}
