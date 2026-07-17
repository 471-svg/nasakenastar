import React, { useRef, useCallback, useState, useEffect, useMemo } from 'react'
import { StarData, Constellation, ConstellationLine } from '../types'
import { useCanvas } from '../hooks/useCanvas'
import { CATALOG_WIDTH as CANVAS_WIDTH, CATALOG_HEIGHT as CANVAS_HEIGHT } from '../data/realStars'

interface Props {
  stars: StarData[]
  constellations: Constellation[]
  drawMode: boolean
  finishDrawRef?: React.MutableRefObject<(() => void) | null>
  onConstellationComplete: (lines: ConstellationLine[], starIds: string[]) => void
  onConstellationClick: (c: Constellation) => void
  onDrawStateChange: (state: { selectedCount: number; canFinish: boolean }) => void
}

// Canvas解像度: 1/6スケールで描画（メモリ節約）
const CANVAS_SCALE = 1 / 6

export default function StarCanvas({ stars, constellations, drawMode, finishDrawRef, onConstellationComplete, onConstellationClick, onDrawStateChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const bgCanvasRef  = useRef<HTMLCanvasElement>(null)
  const { transform, onMouseDown, onMouseMove, onMouseUp, onWheel, isDragging } = useCanvas(containerRef)

  const [selectedStars, setSelectedStars] = useState<string[]>([])
  const [draftLines, setDraftLines] = useState<ConstellationLine[]>([])
  const [hoverStar, setHoverStar] = useState<string | null>(null)

  const starMap = useMemo(() => new Map(stars.map((s) => [s.id, s])), [stars])

  const starToConsMap = useMemo(() => {
    const m = new Map<string, Constellation>()
    for (const c of constellations) {
      for (const sid of (c.starIds ?? [])) m.set(sid, c)
    }
    return m
  }, [constellations])

  // 星座に含まれる星IDのセット（SVGで描く星）
  const consStarIds = useMemo(() => {
    const s = new Set<string>()
    for (const c of constellations) {
      for (const sid of (c.starIds ?? [])) s.add(sid)
    }
    return s
  }, [constellations])

  // 背景星をcanvasに描画（初回 + stars変更時）
  useEffect(() => {
    const canvas = bgCanvasRef.current
    if (!canvas) return
    const cw = Math.ceil(CANVAS_WIDTH  * CANVAS_SCALE)
    const ch = Math.ceil(CANVAS_HEIGHT * CANVAS_SCALE)
    canvas.width  = cw
    canvas.height = ch
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, cw, ch)

    for (const star of stars) {
      // 星座の星はSVGで描くのでスキップ
      if (consStarIds.has(star.id)) continue
      const sx = star.x * CANVAS_SCALE
      const sy = star.y * CANVAS_SCALE
      const r  = Math.max(0.4, star.size * CANVAS_SCALE)
      const opacity = star.size >= 3 ? 0.97 : star.size >= 1.5 ? 0.90 : star.size >= 1 ? 0.80 : 0.60
      ctx.beginPath()
      ctx.arc(sx, sy, r, 0, Math.PI * 2)
      ctx.fillStyle = star.color ?? '#e8eeff'
      ctx.globalAlpha = opacity
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }, [stars, consStarIds])

  // drawModeがfalseになったらリセット
  useEffect(() => {
    if (!drawMode) {
      setSelectedStars([])
      setDraftLines([])
    }
  }, [drawMode])

  useEffect(() => {
    onDrawStateChange({ selectedCount: selectedStars.length, canFinish: draftLines.length > 0 })
  }, [selectedStars.length, draftLines.length])

  const handleStarClick = useCallback(
    (e: React.MouseEvent, starId: string) => {
      if (!drawMode) return
      if (isDragging.current) return
      e.stopPropagation()
      if (selectedStars.length === 0) { setSelectedStars([starId]); return }
      const last = selectedStars[selectedStars.length - 1]
      if (last === starId) return
      setDraftLines((prev) => [...prev, { from: last, to: starId }])
      setSelectedStars((prev) => [...prev, starId])
    },
    [drawMode, selectedStars]
  )

  const finishDraw = () => {
    if (draftLines.length === 0) return
    onConstellationComplete(draftLines, [...new Set(selectedStars)])
    setSelectedStars([])
    setDraftLines([])
  }

  useEffect(() => {
    if (finishDrawRef) finishDrawRef.current = finishDraw
  })

  const isStarSelected = (id: string) => selectedStars.includes(id)

  const wrapStyle: React.CSSProperties = {
    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
    transformOrigin: '0 0',
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
    willChange: 'transform',
  }

  // SVGで描く星: 星座に含まれる星 + drawMode時は全星
  const svgStars = drawMode ? stars : stars.filter((s) => consStarIds.has(s.id))

  return (
    <div className="canvas-root" data-finish-draw={draftLines.length > 0 ? 'yes' : 'no'}>
      <div
        ref={containerRef}
        className={`canvas-container ${drawMode ? 'draw-mode' : ''}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
        style={{ position: 'relative' }}
      >
        {/* 背景グラデーション */}
        <div style={{ ...wrapStyle, background: 'radial-gradient(ellipse at 40% 45%, #0e1f4a 0%, #060e28 60%, #010610 100%)' }} />

        {/* 背景星 canvas */}
        <canvas
          ref={bgCanvasRef}
          style={{
            ...wrapStyle,
            imageRendering: 'pixelated',
          }}
        />

        {/* SVG: 星雲・星座ライン・インタラクティブ星 */}
        <svg
          style={{ ...wrapStyle, overflow: 'visible' }}
        >
          <defs>
            <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="brightGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="selectGlow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <radialGradient id="neb-m42" cx="50%" cy="45%" r="50%">
              <stop offset="0%"   stopColor="#ff6080" stopOpacity={0.22} />
              <stop offset="35%"  stopColor="#d03060" stopOpacity={0.10} />
              <stop offset="70%"  stopColor="#8010a0" stopOpacity={0.04} />
              <stop offset="100%" stopColor="#400060" stopOpacity={0} />
            </radialGradient>
            <radialGradient id="neb-m45" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#80b0ff" stopOpacity={0.18} />
              <stop offset="40%"  stopColor="#4060e0" stopOpacity={0.08} />
              <stop offset="100%" stopColor="#1020a0" stopOpacity={0} />
            </radialGradient>
            <radialGradient id="neb-sgr" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#ff8040" stopOpacity={0.20} />
              <stop offset="30%"  stopColor="#e04020" stopOpacity={0.12} />
              <stop offset="65%"  stopColor="#901020" stopOpacity={0.05} />
              <stop offset="100%" stopColor="#400008" stopOpacity={0} />
            </radialGradient>
            <radialGradient id="neb-cyg" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#ff4070" stopOpacity={0.16} />
              <stop offset="40%"  stopColor="#6040c0" stopOpacity={0.08} />
              <stop offset="100%" stopColor="#200040" stopOpacity={0} />
            </radialGradient>
            <radialGradient id="neb-sco" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#ff5060" stopOpacity={0.18} />
              <stop offset="45%"  stopColor="#c01040" stopOpacity={0.07} />
              <stop offset="100%" stopColor="#600010" stopOpacity={0} />
            </radialGradient>
            <radialGradient id="neb-car" cx="50%" cy="40%" r="50%">
              <stop offset="0%"   stopColor="#ff7050" stopOpacity={0.20} />
              <stop offset="35%"  stopColor="#e03060" stopOpacity={0.10} />
              <stop offset="100%" stopColor="#600020" stopOpacity={0} />
            </radialGradient>
            <radialGradient id="neb-per" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#60a0ff" stopOpacity={0.14} />
              <stop offset="50%"  stopColor="#2040c0" stopOpacity={0.05} />
              <stop offset="100%" stopColor="#101060" stopOpacity={0} />
            </radialGradient>
          </defs>

          {/* 星雲 */}
          <g style={{ pointerEvents: 'none' }}>
            <ellipse cx={2012} cy={2289} rx={700} ry={480} fill="url(#neb-m42)" transform="rotate(-15, 2012, 2289)" />
            <ellipse cx={2012} cy={2289} rx={320} ry={220} fill="url(#neb-m42)" transform="rotate(-15, 2012, 2289)" />
            <ellipse cx={1364} cy={1580} rx={550} ry={380} fill="url(#neb-m45)" transform="rotate(10, 1364, 1580)" />
            <ellipse cx={6394} cy={2855} rx={1300} ry={480} fill="url(#neb-sgr)" transform="rotate(5, 6394, 2855)" />
            <ellipse cx={6394} cy={2855} rx={600} ry={220} fill="url(#neb-sgr)" transform="rotate(5, 6394, 2855)" />
            <ellipse cx={6550} cy={2780} rx={700} ry={300} fill="url(#neb-sgr)" transform="rotate(-8, 6550, 2780)" />
            <ellipse cx={7452} cy={1123} rx={900} ry={400} fill="url(#neb-cyg)" transform="rotate(-25, 7452, 1123)" />
            <ellipse cx={7452} cy={1123} rx={400} ry={180} fill="url(#neb-cyg)" transform="rotate(-25, 7452, 1123)" />
            <ellipse cx={5940} cy={2793} rx={850} ry={350} fill="url(#neb-sco)" transform="rotate(15, 5940, 2793)" />
            <ellipse cx={5940} cy={2793} rx={350} ry={150} fill="url(#neb-sco)" transform="rotate(15, 5940, 2793)" />
            <ellipse cx={3870} cy={3594} rx={750} ry={380} fill="url(#neb-car)" transform="rotate(-20, 3870, 3594)" />
            <ellipse cx={3870} cy={3594} rx={280} ry={140} fill="url(#neb-car)" transform="rotate(-20, 3870, 3594)" />
            <ellipse cx={846}  cy={789}  rx={450} ry={280} fill="url(#neb-per)" transform="rotate(8, 846, 789)" />
          </g>

          {/* 星座ライン */}
          {constellations.map((c) =>
            c.lines.map((line, i) => {
              const from = starMap.get(line.from)
              const to   = starMap.get(line.to)
              if (!from || !to) return null
              return (
                <g key={`${c.id}-${i}`}>
                  {!drawMode && (
                    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                      stroke="transparent" strokeWidth={20} style={{ cursor: 'pointer' }}
                      onClick={(e) => { if (!isDragging.current) { e.stopPropagation(); onConstellationClick(c) } }}
                    />
                  )}
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke={c.color} strokeWidth={1.4} strokeOpacity={0.5}
                    filter="url(#lineGlow)" style={{ pointerEvents: 'none' }}
                  />
                </g>
              )
            })
          )}

          {/* 下書きライン */}
          {draftLines.map((line, i) => {
            const from = starMap.get(line.from)
            const to   = starMap.get(line.to)
            if (!from || !to) return null
            return (
              <line key={`draft-${i}`}
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke="#b8d4ff" strokeWidth={1.6} strokeOpacity={0.75} strokeDasharray="5 4"
              />
            )
          })}

          {/* 星座の星 + drawMode時は全星 */}
          {svgStars.map((star) => {
            const sel      = isStarSelected(star.id)
            const hover    = hoverStar === star.id
            const ownerCons = starToConsMap.get(star.id)
            const inCons   = !!ownerCons

            return (
              <g key={star.id}>
                <circle
                  cx={star.x} cy={star.y}
                  r={drawMode ? 20 : Math.max(14, star.size * 6)}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoverStar(star.id)}
                  onMouseLeave={() => setHoverStar(null)}
                  onClick={(e) => {
                    if (isDragging.current) return
                    if (drawMode) { handleStarClick(e, star.id) }
                    else if (ownerCons) { e.stopPropagation(); onConstellationClick(ownerCons) }
                  }}
                />
                {sel && (
                  <circle cx={star.x} cy={star.y} r={star.size * 6}
                    fill="#7fb8ff" fillOpacity={0.18} filter="url(#selectGlow)"
                    style={{ pointerEvents: 'none' }}
                  />
                )}
                {hover && !sel && (
                  <circle cx={star.x} cy={star.y} r={star.size * (inCons ? 7 : 5)}
                    fill={inCons ? ownerCons!.color : '#aaccff'}
                    fillOpacity={inCons ? 0.18 : 0.12}
                    style={{ pointerEvents: 'none' }}
                  />
                )}
                <circle
                  cx={star.x} cy={star.y}
                  r={sel ? star.size * 2 : hover && inCons ? star.size * 1.5 : star.size}
                  fill={sel ? '#ffffff' : inCons ? '#d0e8ff' : (star.color ?? '#e8eeff')}
                  fillOpacity={sel ? 1 : hover && inCons ? 1 : 0.95}
                  filter="url(#brightGlow)"
                  style={{ pointerEvents: 'none' }}
                />
              </g>
            )
          })}

          {/* 星座名ラベル */}
          {constellations.map((c) => {
            const first = starMap.get(c.starIds?.[0])
            if (!first) return null
            return (
              <text key={`label-${c.id}`} x={first.x + 8} y={first.y - 8}
                fill={c.color} fontSize={12} fontFamily="'Noto Serif JP', serif"
                fillOpacity={0.85} filter="url(#lineGlow)"
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
