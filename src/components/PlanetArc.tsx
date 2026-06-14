import { useRef, useState, useCallback } from 'react'
import { PLANET_COLORS } from '../data/planetColors'

// 参照画像に合わせたグラデーション球体スタイル (PLANET_COLORSと同順)
const SPHERE_STYLES = [
  // 黄: Jupiter風
  { bg: 'radial-gradient(circle at 38% 32%, #fff5c0 0%, #f5c030 28%, #d07800 58%, #6a3a00 100%)', glow: '0 0 18px rgba(245,192,48,0.55)' },
  // 紫: 紫ガス惑星
  { bg: 'radial-gradient(circle at 38% 32%, #f2d8ff 0%, #c055f0 28%, #6008b8 60%, #240048 100%)', glow: '0 0 18px rgba(180,60,240,0.55)' },
  // 青: 地球風
  { bg: 'radial-gradient(circle at 38% 32%, #c8f0ff 0%, #3888e0 28%, #0838b0 60%, #001055 100%)', glow: '0 0 18px rgba(56,136,224,0.55)' },
  // 赤: 火星風
  { bg: 'radial-gradient(circle at 38% 32%, #ffd8b8 0%, #e05828 28%, #a01c00 60%, #480800 100%)', glow: '0 0 18px rgba(224,88,40,0.55)' },
  // 桃: マゼンタ惑星
  { bg: 'radial-gradient(circle at 38% 32%, #ffd0ee 0%, #f048b0 28%, #a00060 60%, #480028 100%)', glow: '0 0 18px rgba(240,72,176,0.55)' },
  // 緑: 緑惑星
  { bg: 'radial-gradient(circle at 38% 32%, #c8ffd8 0%, #38c058 28%, #007830 60%, #002c14 100%)', glow: '0 0 18px rgba(56,192,88,0.55)' },
]

const PLANET_COUNT = PLANET_COLORS.length
const STEP = (2 * Math.PI) / PLANET_COUNT

// 楕円軌道: 横に広く・縦に小さく
const R_X      = 220   // 水平半径(px) — ±60°で±190px
const R_Y      = 42    // 垂直半径(px) — 頂点とサイドの差=21px
const SCREEN_CX = 195
const BASELINE  = 18   // カルーセル底辺からの基準(px)
const PLANET_W  = 58

function getPlanetPos(rotation: number, index: number) {
  const angle = rotation + index * STEP
  const screenX = SCREEN_CX + R_X * Math.sin(angle)
  const lift    = BASELINE + R_Y * Math.cos(angle)
  // t: 頂点=1, ±60°≈0.71, ±90°=0, ±120°=0 (重なり防止のため90°以上を完全非表示)
  const cosA = Math.cos(angle)
  const t = cosA > 0 ? Math.sqrt(cosA) : 0
  return { screenX, lift, opacity: t, scale: 0.65 + 0.35 * t }
}

interface Props {
  drawMode: boolean
  drawState: { selectedCount: number; canFinish: boolean }
  selectedColor: string | null
  availableColors: string[]
  onColorToggle: (color: string) => void
  onStartDraw: () => void
  onFinishDraw: () => void
  onCancelDraw: () => void
}

export default function PlanetArc({
  drawMode, drawState, selectedColor, availableColors,
  onColorToggle, onStartDraw, onFinishDraw, onCancelDraw,
}: Props) {
  const [rotation, setRotation] = useState(0)
  const [dragging, setDragging] = useState(false)
  const touchRef = useRef<{ x: number; rot: number } | null>(null)

  const snapToNearest = useCallback((rot: number) => {
    setRotation(Math.round(rot / STEP) * STEP)
  }, [])

  // Pointer events で touch/mouse を統一 & setPointerCapture で要素外でも追跡
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    touchRef.current = { x: e.clientX, rot: rotation }
    setDragging(true)
  }, [rotation])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!touchRef.current) return
    const dx = e.clientX - touchRef.current.x
    setRotation(touchRef.current.rot + dx / R_X)
  }, [])

  const onPointerUp = useCallback(() => {
    if (touchRef.current) snapToNearest(rotation)
    touchRef.current = null
    setDragging(false)
  }, [rotation, snapToNearest])

  const hint = drawState.selectedCount === 0
    ? '最初の星をタップ'
    : `${drawState.selectedCount}個選択中 — 次の星をタップ`

  return (
    <div className="planet-arc-wrap">
      {drawMode ? (
        <div className="draw-controls">
          <span className="draw-hint">{hint}</span>
          <div className="draw-btns">
            <button className="btn-finish" onClick={onFinishDraw} disabled={!drawState.canFinish}>
              完成
            </button>
            <button className="btn-cancel-draw" onClick={onCancelDraw}>
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 軌道ライン */}
          <svg className="planet-orbit-svg" viewBox="0 0 390 100" preserveAspectRatio="none">
            <ellipse cx="195" cy="160" rx="250" ry="100"
              fill="none" stroke="rgba(180,200,255,0.18)" strokeWidth="1" />
          </svg>

          {/* 回転カルーセル */}
          <div
            className="planet-carousel"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {PLANET_COLORS.map(({ img: imgSrc, color, label }, i) => {
              const { screenX, lift, opacity, scale } = getPlanetPos(rotation, i)
              const available = availableColors.includes(color)
              const active    = selectedColor === color
              const dim       = selectedColor !== null && !active

              return (
                <button
                  key={color}
                  className={`planet-btn ${active ? 'planet-btn--active' : ''} ${dim ? 'planet-btn--dim' : ''} ${!available ? 'planet-btn--empty' : ''}`}
                  style={{
                    position: 'absolute',
                    left:    screenX - PLANET_W / 2 - 4,
                    bottom:  lift,
                    opacity: (dim ? 0.35 : 1) * opacity,
                    transform: `scale(${scale})`,
                    transformOrigin: 'center bottom',
                    transition: dragging ? 'none' : 'left 0.3s ease, bottom 0.3s ease, opacity 0.3s',
                    pointerEvents: opacity > 0.3 ? 'auto' : 'none',
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => onColorToggle(color)}
                  aria-label={label}
                >
                  {imgSrc
                    ? <img src={imgSrc} alt={label} className="planet-sphere planet-sphere--img" />
                    : <div className="planet-sphere" style={{
                        background: SPHERE_STYLES[i].bg,
                        boxShadow: `inset -8px -8px 20px rgba(0,0,0,0.5), inset 2px 2px 6px rgba(255,255,255,0.18), ${SPHERE_STYLES[i].glow}`,
                      }} />
                  }
                  {active && <div className="planet-ring" />}
                  <span className="planet-tag">{label}</span>
                </button>
              )
            })}
          </div>

          {/* 星座を作るボタン */}
          <div className="draw-btn-row">
            <button className="btn-draw-new" onClick={onStartDraw}>
              ✦ 星座を作る
            </button>
          </div>
        </>
      )}
    </div>
  )
}
