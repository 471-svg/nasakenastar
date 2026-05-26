import { useState, useRef, useCallback } from 'react'

export interface Transform {
  x: number
  y: number
  scale: number
}

export function useCanvas() {
  // 初期位置: キャンバス中央 (3000, 2000) が画面中央に来るよう計算
  // 画面サイズが不明なのでwindow.innerWidth/Heightを使用
  // 初期位置: RA=6h 付近 (冬の大三角/オリオン座あたり) を中心に表示
  const [transform, setTransform] = useState<Transform>(() => {
    const scale = 0.18
    // RA 6h = x: (6/24)*8640 = 2160, Dec 0° = y: (90/180)*4320 = 2160
    const focusX = 2160
    const focusY = 2160
    return {
      scale,
      x: window.innerWidth  / 2 - focusX * scale,
      y: window.innerHeight / 2 - focusY * scale,
    }
  })
  const dragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    dragging.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    lastPos.current = { x: e.clientX, y: e.clientY }
    setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }))
  }, [])

  const onMouseUp = useCallback(() => {
    dragging.current = false
  }, [])

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const factor = e.deltaY < 0 ? 1.1 : 0.9
    // イベントデータは setTransform コールバック実行前に取り出す
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    setTransform((t) => {
      const newScale = Math.min(3, Math.max(0.08, t.scale * factor))
      const scaleRatio = newScale / t.scale
      return {
        scale: newScale,
        x: mx - scaleRatio * (mx - t.x),
        y: my - scaleRatio * (my - t.y),
      }
    })
  }, [])

  // スクリーン座標 → キャンバス座標
  const toCanvas = useCallback(
    (sx: number, sy: number, containerRect: DOMRect): { x: number; y: number } => {
      return {
        x: (sx - containerRect.left - transform.x) / transform.scale,
        y: (sy - containerRect.top - transform.y) / transform.scale,
      }
    },
    [transform]
  )

  return { transform, onMouseDown, onMouseMove, onMouseUp, onWheel, toCanvas, dragging }
}
