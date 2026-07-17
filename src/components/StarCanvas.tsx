import React, { useRef, useCallback, useState, useEffect } from 'react'
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

function starClass(size: number): string | undefined {
  if (size >= 3)   return 'star-giant'
  if (size >= 2)   return 'star-bright'
  if (size >= 1.5) return 'star-mid'
  return undefined  // 小さい星はアニメなし
}

export default function StarCanvas({ stars, constellations, drawMode, finishDrawRef, onConstellationComplete, onConstellationClick, onDrawStateChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { transform, onMouseDown, onMouseMove, onMouseUp, onWheel, isDragging } = useCanvas(containerRef)

  const [selectedStars, setSelectedStars] = useState<string[]>([])
  const [draftLines, setDraftLines] = useState<ConstellationLine[]>([])
  const [hoverStar, setHoverStar] = useState<string | null>(null)

  const starMap = new Map(stars.map((s) => [s.id, s]))

  // 星ID → 星座 の逆引きマップ（O(n²) → O(1)）
  const starToConsMap = new Map<string, Constellation>()
  for (const c of constellations) {
    for (const sid of (c.starIds ?? [])) starToConsMap.set(sid, c)
  }

  // drawModeがfalseになったらリセット
  useEffect(() => {
    if (!drawMode) {
      setSelectedStars([])
      setDraftLines([])
    }
  }, [drawMode])

  // 描画状態を親に通知
  useEffect(() => {
    onDrawStateChange({ selectedCount: selectedStars.length, canFinish: draftLines.length > 0 })
  }, [selectedStars.length, draftLines.length])

  const handleStarClick = useCallback(
    (e: React.MouseEvent, starId: string) => {
      if (!drawMode) return
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
    [drawMode, selectedStars]
  )

  const finishDraw = () => {
    if (draftLines.length === 0) return
    const uniqueIds = [...new Set(selectedStars)]
    onConstellationComplete(draftLines, uniqueIds)
    setSelectedStars([])
    setDraftLines([])
  }

  // 親からfinishDrawを呼べるようにrefに登録
  useEffect(() => {
    if (finishDrawRef) finishDrawRef.current = finishDraw
  })

  const isStarSelected = (id: string) => selectedStars.includes(id)

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
      >
        <svg
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: '0 0',
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
          }}
        >
          <defs>
            <radialGradient id="bgGrad" cx="40%" cy="45%" r="75%">
              <stop offset="0%" stopColor="#0e1f4a" />
              <stop offset="60%" stopColor="#060e28" />
              <stop offset="100%" stopColor="#010610" />
            </radialGradient>
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

            {/* 星雲グラデーション */}
            {/* M42 オリオン大星雲 — 赤みがかった放出星雲 */}
            <radialGradient id="neb-m42" cx="50%" cy="45%" r="50%">
              <stop offset="0%"   stopColor="#ff6080" stopOpacity={0.22} />
              <stop offset="35%"  stopColor="#d03060" stopOpacity={0.10} />
              <stop offset="70%"  stopColor="#8010a0" stopOpacity={0.04} />
              <stop offset="100%" stopColor="#400060" stopOpacity={0} />
            </radialGradient>
            {/* M45 プレアデス — 青い反射星雲 */}
            <radialGradient id="neb-m45" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#80b0ff" stopOpacity={0.18} />
              <stop offset="40%"  stopColor="#4060e0" stopOpacity={0.08} />
              <stop offset="100%" stopColor="#1020a0" stopOpacity={0} />
            </radialGradient>
            {/* いて座 銀河中心 — 濃いオレンジ〜赤 */}
            <radialGradient id="neb-sgr" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#ff8040" stopOpacity={0.20} />
              <stop offset="30%"  stopColor="#e04020" stopOpacity={0.12} />
              <stop offset="65%"  stopColor="#901020" stopOpacity={0.05} />
              <stop offset="100%" stopColor="#400008" stopOpacity={0} />
            </radialGradient>
            {/* はくちょう座 北アメリカ星雲 — 赤+青 */}
            <radialGradient id="neb-cyg" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#ff4070" stopOpacity={0.16} />
              <stop offset="40%"  stopColor="#6040c0" stopOpacity={0.08} />
              <stop offset="100%" stopColor="#200040" stopOpacity={0} />
            </radialGradient>
            {/* さそり座 — ピンク〜赤 */}
            <radialGradient id="neb-sco" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#ff5060" stopOpacity={0.18} />
              <stop offset="45%"  stopColor="#c01040" stopOpacity={0.07} />
              <stop offset="100%" stopColor="#600010" stopOpacity={0} />
            </radialGradient>
            {/* カリーナ星雲 — 明るいオレンジ〜ピンク */}
            <radialGradient id="neb-car" cx="50%" cy="40%" r="50%">
              <stop offset="0%"   stopColor="#ff7050" stopOpacity={0.20} />
              <stop offset="35%"  stopColor="#e03060" stopOpacity={0.10} />
              <stop offset="100%" stopColor="#600020" stopOpacity={0} />
            </radialGradient>
            {/* ペルセウス二重星団 — 薄い青 */}
            <radialGradient id="neb-per" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#60a0ff" stopOpacity={0.14} />
              <stop offset="50%"  stopColor="#2040c0" stopOpacity={0.05} />
              <stop offset="100%" stopColor="#101060" stopOpacity={0} />
            </radialGradient>
          </defs>

          <rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="url(#bgGrad)" />

          {/* 星雲 (装飾のみ・クリック不可) */}
          <g style={{ pointerEvents: 'none' }}>
            {/* M42 オリオン大星雲 RA=5.59h Dec=-5.39° */}
            <ellipse cx={2012} cy={2289} rx={700} ry={480}
              fill="url(#neb-m42)" transform="rotate(-15, 2012, 2289)" />
            <ellipse cx={2012} cy={2289} rx={320} ry={220}
              fill="url(#neb-m42)" transform="rotate(-15, 2012, 2289)" />

            {/* M45 プレアデス RA=3.79h Dec=24.11° */}
            <ellipse cx={1364} cy={1580} rx={550} ry={380}
              fill="url(#neb-m45)" transform="rotate(10, 1364, 1580)" />

            {/* いて座 銀河中心 RA=17.76h Dec=-29° */}
            <ellipse cx={6394} cy={2855} rx={1300} ry={480}
              fill="url(#neb-sgr)" transform="rotate(5, 6394, 2855)" />
            <ellipse cx={6394} cy={2855} rx={600} ry={220}
              fill="url(#neb-sgr)" transform="rotate(5, 6394, 2855)" />
            <ellipse cx={6550} cy={2780} rx={700} ry={300}
              fill="url(#neb-sgr)" transform="rotate(-8, 6550, 2780)" />

            {/* はくちょう座 RA=20.7h Dec=44° */}
            <ellipse cx={7452} cy={1123} rx={900} ry={400}
              fill="url(#neb-cyg)" transform="rotate(-25, 7452, 1123)" />
            <ellipse cx={7452} cy={1123} rx={400} ry={180}
              fill="url(#neb-cyg)" transform="rotate(-25, 7452, 1123)" />

            {/* さそり座 RA=16.5h Dec=-26° */}
            <ellipse cx={5940} cy={2793} rx={850} ry={350}
              fill="url(#neb-sco)" transform="rotate(15, 5940, 2793)" />
            <ellipse cx={5940} cy={2793} rx={350} ry={150}
              fill="url(#neb-sco)" transform="rotate(15, 5940, 2793)" />

            {/* カリーナ星雲 RA=10.75h Dec=-59.87° */}
            <ellipse cx={3870} cy={3594} rx={750} ry={380}
              fill="url(#neb-car)" transform="rotate(-20, 3870, 3594)" />
            <ellipse cx={3870} cy={3594} rx={280} ry={140}
              fill="url(#neb-car)" transform="rotate(-20, 3870, 3594)" />

            {/* ペルセウス RA=2.35h Dec=57.14° */}
            <ellipse cx={846} cy={789} rx={450} ry={280}
              fill="url(#neb-per)" transform="rotate(8, 846, 789)" />
          </g>

          {constellations.map((c) =>
            c.lines.map((line, i) => {
              const from = starMap.get(line.from)
              const to = starMap.get(line.to)
              if (!from || !to) return null
              return (
                <g key={`${c.id}-${i}`}>
                  {!drawMode && (
                    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                      stroke="transparent" strokeWidth={18} style={{ cursor: 'pointer' }}
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

          {draftLines.map((line, i) => {
            const from = starMap.get(line.from)
            const to = starMap.get(line.to)
            if (!from || !to) return null
            return (
              <line key={`draft-${i}`}
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke="#b8d4ff" strokeWidth={1.6} strokeOpacity={0.75} strokeDasharray="5 4"
              />
            )
          })}

          {stars.map((star) => {
            const sel = isStarSelected(star.id)
            const hover = hoverStar === star.id
            const ownerCons = starToConsMap.get(star.id)
            const inCons = !!ownerCons
            const cls = starClass(star.size)

            return (
              <g key={star.id}>
                {(drawMode || inCons) && (
                  <circle cx={star.x} cy={star.y} r={drawMode ? 18 : Math.max(12, star.size * 5)}
                    fill="transparent"
                    style={{ cursor: drawMode ? 'pointer' : inCons ? 'pointer' : 'default' }}
                    onMouseEnter={() => setHoverStar(star.id)}
                    onMouseLeave={() => setHoverStar(null)}
                    onClick={(e) => {
                      if (isDragging.current) return
                      if (drawMode) { handleStarClick(e, star.id) }
                      else if (ownerCons) { e.stopPropagation(); onConstellationClick(ownerCons) }
                    }}
                  />
                )}
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
                  fillOpacity={
                    sel ? 1 : hover && inCons ? 1 : hover ? 0.98 :
                    star.size >= 3 ? 0.97 : star.size >= 1.5 ? 0.90 : 0.75
                  }
                  filter={star.size >= 2 || (hover && inCons) ? 'url(#brightGlow)' : undefined}
                  className={sel ? undefined : cls}
                  style={{ '--tw': `${2.5 + star.twinkle}s`, pointerEvents: 'none' } as React.CSSProperties}
                />
              </g>
            )
          })}

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
