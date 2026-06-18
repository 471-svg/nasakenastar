import { useState, useRef, useCallback, useEffect, RefObject } from 'react'
import { CATALOG_WIDTH as CANVAS_W, CATALOG_HEIGHT as CANVAS_H } from '../data/realStars'

export interface Transform {
  x: number
  y: number
  scale: number
}

/** キャンバスがビューポートをはみ出ないようにトランスフォームをクランプする */
function clamp(t: Transform, vw: number, vh: number): Transform {
  // スケール: 縦横どちらもビューポートを覆う最小値 ≤ scale ≤ 3
  const minScale = Math.max(vw / CANVAS_W, vh / CANVAS_H)
  const scale = Math.min(3, Math.max(minScale, t.scale))

  // 平行移動: キャンバスがビューポートをはみ出ない範囲に制限
  const x = Math.min(0, Math.max(vw - CANVAS_W * scale, t.x))
  const y = Math.min(0, Math.max(vh - CANVAS_H * scale, t.y))

  return { scale, x, y }
}

export function useCanvas(containerRef: RefObject<HTMLElement>) {
  // 初期位置: RA=6h 付近 (オリオン座あたり) を中心に表示
  const [transform, setTransform] = useState<Transform>(() => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const minScale = Math.max(vw / CANVAS_W, vh / CANVAS_H)
    const scale = Math.max(minScale, 0.18)
    const focusX = 2160
    const focusY = 2160
    return clamp({ scale, x: vw / 2 - focusX * scale, y: vh / 2 - focusY * scale }, vw, vh)
  })

  const dragging    = useRef(false)
  const lastPos     = useRef({ x: 0, y: 0 })
  const pinchDist   = useRef(0)
  const isDragging  = useRef(false)
  const wasPinching = useRef(false)

  // ────────────────────────────────────────────────
  // マウス操作
  // ────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    dragging.current = true
    isDragging.current = false
    lastPos.current = { x: e.clientX, y: e.clientY }
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) isDragging.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
    setTransform((t) => clamp({ ...t, x: t.x + dx, y: t.y + dy }, window.innerWidth, window.innerHeight))
  }, [])

  const onMouseUp = useCallback(() => {
    dragging.current = false
  }, [])

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const factor = e.deltaY < 0 ? 1.1 : 0.9
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    setTransform((t) => {
      const vw = window.innerWidth, vh = window.innerHeight
      const raw = Math.min(3, Math.max(0.08, t.scale * factor))
      const ratio = raw / t.scale
      return clamp({
        scale: raw,
        x: mx - ratio * (mx - t.x),
        y: my - ratio * (my - t.y),
      }, vw, vh)
    })
  }, [])

  // ────────────────────────────────────────────────
  // タッチ操作 (passive:false で preventDefault が効く)
  // ────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    function getTouchDist(t: TouchList) {
      const dx = t[1].clientX - t[0].clientX
      const dy = t[1].clientY - t[0].clientY
      return Math.sqrt(dx * dx + dy * dy)
    }
    function getTouchMid(t: TouchList) {
      return {
        x: (t[0].clientX + t[1].clientX) / 2,
        y: (t[0].clientY + t[1].clientY) / 2,
      }
    }

    function onTouchStart(e: TouchEvent) {
      e.preventDefault()
      if (e.touches.length === 1) {
        dragging.current = true
        isDragging.current = false
        wasPinching.current = false
        lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      } else if (e.touches.length === 2) {
        dragging.current = false
        isDragging.current = false
        wasPinching.current = true
        pinchDist.current = getTouchDist(e.touches)
      }
    }

    function onTouchMove(e: TouchEvent) {
      e.preventDefault()
      const rect = el!.getBoundingClientRect()
      const vw = window.innerWidth, vh = window.innerHeight

      if (e.touches.length === 1 && dragging.current) {
        const dx = e.touches[0].clientX - lastPos.current.x
        const dy = e.touches[0].clientY - lastPos.current.y
        if (Math.abs(dx) > 8 || Math.abs(dy) > 8) isDragging.current = true
        lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        setTransform((t) => clamp({ ...t, x: t.x + dx, y: t.y + dy }, vw, vh))

      } else if (e.touches.length === 2) {
        wasPinching.current = true
        const dist = getTouchDist(e.touches)
        const mid  = getTouchMid(e.touches)
        const factor = dist / (pinchDist.current || dist)
        const mx = mid.x - rect.left
        const my = mid.y - rect.top

        setTransform((t) => {
          const raw = Math.min(3, Math.max(0.08, t.scale * factor))
          const ratio = raw / t.scale
          return clamp({
            scale: raw,
            x: mx - ratio * (mx - t.x),
            y: my - ratio * (my - t.y),
          }, vw, vh)
        })
        pinchDist.current = dist
      }
    }

    function onTouchEnd(e: TouchEvent) {
      e.preventDefault()
      if (e.touches.length < 2) pinchDist.current = 0

      if (e.touches.length === 0) {
        if (!isDragging.current && !wasPinching.current && e.changedTouches.length === 1) {
          const touch = e.changedTouches[0]
          const target = document.elementFromPoint(touch.clientX, touch.clientY)
          if (target) {
            target.dispatchEvent(new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              clientX: touch.clientX,
              clientY: touch.clientY,
              screenX: touch.screenX,
              screenY: touch.screenY,
            }))
          }
        }
        dragging.current = false
        isDragging.current = false
        wasPinching.current = false
      } else if (e.touches.length === 1) {
        dragging.current = true
        isDragging.current = false
        lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove',  onTouchMove,  { passive: false })
    el.addEventListener('touchend',   onTouchEnd,   { passive: false })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove',  onTouchMove)
      el.removeEventListener('touchend',   onTouchEnd)
    }
  }, [containerRef])

  const zoomBy = useCallback((factor: number) => {
    const cx = window.innerWidth  / 2
    const cy = window.innerHeight / 2
    setTransform((t) => {
      const vw = window.innerWidth, vh = window.innerHeight
      const raw = Math.min(3, Math.max(0.08, t.scale * factor))
      const ratio = raw / t.scale
      return clamp({
        scale: raw,
        x: cx - ratio * (cx - t.x),
        y: cy - ratio * (cy - t.y),
      }, vw, vh)
    })
  }, [])

  return { transform, onMouseDown, onMouseMove, onMouseUp, onWheel, zoomBy, isDragging }
}
