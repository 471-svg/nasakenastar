import { useRef, useCallback, useState } from 'react'
import { StarData, Constellation, ConstellationLine } from '../types'
import { useCanvas } from '../hooks/useCanvas'
import { CATALOG_WIDTH as CANVAS_WIDTH, CATALOG_HEIGHT as CANVAS_HEIGHT } from '../data/realStars'

interface Props {
  stars: StarData[]
  constellations: Constellation[]
  onConstellationComplete: (lines: ConstellationLine[], starIds: string[]) => void
  onConstellationClick: (c: Constellation) => void
}

type Mode = 'view' | 'draw'

function starClass(size: number): string {
  if (size >= 3)   return 'star-giant'
  if (size >= 2)   return 'star-bright'
  if (size >= 1.5) return 'star-mid'
  return 'star-dim'
}

export default function StarCanvas({ stars, constellations, onConstellationComplete, onConstellationClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { transform, onMouseDown, onMouseMove, onMouseUp, onWheel } = useCanvas()

  const [mode, setMode] = useState<Mode>('view')
  const [selectedStars, setSelectedStars] = useState<string[]>([])
  const [draftLines, setDraftLines] = useState<ConstellationLine[]>([])
  const [hoverStar, setHoverStar] = useState<string | null>(null)

  const starMap = new Map(stars.map((s) => [s.id, s]))

  // ドラッグとクリックを区別する
  const mouseDownPos = useRef({ x: 0, y: 0 })
  const isDragging = useRef(false)

  const handleStarClick = useCallback(
    (e: React.MouseEvent, starId: string) => {
      if (mode !== 'draw') return
      if (isDragging.current) return
      e.stopPropagation()

      if (selectedStars.length === 0) {
        setSelectedStars([starId])
        return
      }

      const last = selectedStars[selectedStars.length - 1]
      if (last === starId) return

      const newLine: ConstellationLine = { from: last, to: starId }
      setDraftLines((prev) => [...prev, newLine])
      setSelectedStars((prev) => [...prev, starId])
    },
    [mode, selectedStars]
  )

  const finishDraw = () => {
    if (draftLines.length === 0) return
    const uniqueIds = [...new Set(selectedStars)]
    onConstellationComplete(draftLines, uniqueIds)
    setSelectedStars([])
    setDraftLines([])
    setMode('view')
  }

  const cancelDraw = () => {
    setSelectedStars([])
    setDraftLines([])
    setMode('view')
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseDownPos.current = { x: e.clientX, y: e.clientY }
    isDragging.current = false
    onMouseDown(e)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const dx = e.clientX - mouseDownPos.current.x
    const dy = e.clientY - mouseDownPos.current.y
    if (Math.sqrt(dx * dx + dy * dy) > 4) isDragging.current = true
    onMouseMove(e)
  }

  const handleMouseUp = () => {
    onMouseUp()
  }

  const isStarSelected = (id: string) => selectedStars.includes(id)

  return (
    <div className="canvas-root">
      {/* ツールバー */}
      <div className="toolbar">
        {mode === 'view' ? (
          <button className="btn-draw" onClick={() => setMode('draw')}>
            ✦ 星座を作る
          </button>
        ) : (
          <>
            <span className="draw-hint">
              {selectedStars.length === 0
                ? '最初の星をクリック'
                : `${selectedStars.length}個選択中 — 次の星をクリック`}
            </span>
            <button
              className="btn-finish"
              onClick={finishDraw}
              disabled={draftLines.length === 0}
            >
              完成
            </button>
            <button className="btn-cancel-draw" onClick={cancelDraw}>
              キャンセル
            </button>
          </>
        )}
      </div>

      {/* キャンバス本体 */}
      <div
        ref={containerRef}
        className={`canvas-container ${mode === 'draw' ? 'draw-mode' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={onWheel}
      >
        <svg
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: '0 0',
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
          }}
        >
          {/* 背景グラデーション */}
          <defs>
            <radialGradient id="bgGrad" cx="40%" cy="45%" r="75%">
              <stop offset="0%" stopColor="#0e1f4a" />
              <stop offset="60%" stopColor="#060e28" />
              <stop offset="100%" stopColor="#010610" />
            </radialGradient>

            {/* 星座ラインのグロー */}
            <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* 明るい星のグロー */}
            <filter id="brightGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* 選択時ハロー */}
            <filter id="selectGlow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="url(#bgGrad)" />

          {/* 既存の星座ライン */}
          {constellations.map((c) =>
            c.lines.map((line, i) => {
              const from = starMap.get(line.from)
              const to = starMap.get(line.to)
              if (!from || !to) return null
              return (
                <g key={`${c.id}-${i}`}>
                  {/* 見えないヒット判定ライン（太め） */}
                  {mode === 'view' && (
                    <line
                      x1={from.x} y1={from.y}
                      x2={to.x}   y2={to.y}
                      stroke="transparent"
                      strokeWidth={18}
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => { if (!isDragging.current) { e.stopPropagation(); onConstellationClick(c) } }}
                    />
                  )}
                  {/* 見える星座ライン */}
                  <line
                    x1={from.x} y1={from.y}
                    x2={to.x}   y2={to.y}
                    stroke={c.color}
                    strokeWidth={1.4}
                    strokeOpacity={0.5}
                    filter="url(#lineGlow)"
                    style={{ pointerEvents: 'none' }}
                  />
                </g>
              )
            })
          )}

          {/* 下書きライン */}
          {draftLines.map((line, i) => {
            const from = starMap.get(line.from)
            const to = starMap.get(line.to)
            if (!from || !to) return null
            return (
              <line
                key={`draft-${i}`}
                x1={from.x} y1={from.y}
                x2={to.x}   y2={to.y}
                stroke="#b8d4ff"
                strokeWidth={1.6}
                strokeOpacity={0.75}
                strokeDasharray="5 4"
              />
            )
          })}

          {/* 星 */}
          {stars.map((star) => {
            const sel    = isStarSelected(star.id)
            const hover  = hoverStar === star.id
            // この星が属する星座を探す
            const ownerCons = constellations.find((c) => c.starIds?.includes(star.id))
            const inCons = !!ownerCons
            const cls    = starClass(star.size)

            return (
              <g key={star.id}>
                {/* クリック判定用の透明な大きい円 */}
                {(mode === 'draw' || inCons) && (
                  <circle
                    cx={star.x} cy={star.y} r={mode === 'draw' ? 18 : Math.max(12, star.size * 5)}
                    fill="transparent"
                    style={{ cursor: mode === 'draw' ? 'pointer' : inCons ? 'pointer' : 'default' }}
                    onMouseEnter={() => setHoverStar(star.id)}
                    onMouseLeave={() => setHoverStar(null)}
                    onClick={(e) => {
                      if (isDragging.current) return
                      if (mode === 'draw') {
                        handleStarClick(e, star.id)
                      } else if (ownerCons) {
                        e.stopPropagation()
                        onConstellationClick(ownerCons)
                      }
                    }}
                  />
                )}

                {/* 選択・ホバー時の外輪ハロー */}
                {sel && (
                  <circle
                    cx={star.x} cy={star.y}
                    r={star.size * 6}
                    fill="#7fb8ff"
                    fillOpacity={0.18}
                    filter="url(#selectGlow)"
                    style={{ pointerEvents: 'none' }}
                  />
                )}
                {hover && !sel && (
                  <circle
                    cx={star.x} cy={star.y}
                    r={star.size * (inCons ? 7 : 5)}
                    fill={inCons ? ownerCons!.color : '#aaccff'}
                    fillOpacity={inCons ? 0.18 : 0.12}
                    style={{ pointerEvents: 'none' }}
                  />
                )}

                {/* 星本体 */}
                <circle
                  cx={star.x}
                  cy={star.y}
                  r={sel ? star.size * 2 : hover && inCons ? star.size * 1.5 : star.size}
                  fill={sel ? '#ffffff' : inCons ? '#d0e8ff' : (star.color ?? '#e8eeff')}
                  fillOpacity={
                    sel ? 1 :
                    hover && inCons ? 1 :
                    hover ? 0.95 :
                    star.size >= 3   ? 0.92 :
                    star.size >= 1.5 ? 0.75 :
                    0.55
                  }
                  filter={star.size >= 2 || (hover && inCons) ? 'url(#brightGlow)' : undefined}
                  className={sel ? undefined : cls}
                  style={{
                    '--tw': `${2.5 + star.twinkle}s`,
                    pointerEvents: 'none',
                  } as React.CSSProperties}
                />
              </g>
            )
          })}

          {/* 星座ラベル */}
          {constellations.map((c) => {
            const first = starMap.get(c.starIds?.[0])
            if (!first) return null
            return (
              <text
                key={`label-${c.id}`}
                x={first.x + 8}
                y={first.y - 8}
                fill={c.color}
                fontSize={12}
                fontFamily="'Noto Serif JP', serif"
                fillOpacity={0.85}
                filter="url(#lineGlow)"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {c.name}
              </text>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
