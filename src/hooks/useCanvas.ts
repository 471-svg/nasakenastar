import { useState, useRef, useCallback, useEffect, RefObject } from 'react'

export interface Transform {
  x: number
  y: number
  scale: number
}

export function useCanvas(containerRef: RefObject<HTMLElement>) {
  // 初期位置: RA=6h 付近 (オリオン座あたり) を中心に表示
  const [transform, setTransform] = useState<Transform>(() => {
    const scale = 0.18
    const focusX = 2160
    const focusY = 2160
    return {
      scale,
      x: window.innerWidth  / 2 - focusX * scale,
      y: window.innerHeight / 2 - focusY * scale,
    }
  })

  const dragging   = useRef(false)
  const lastPos    = useRef({ x: 0, y: 0 })
  const pinchDist  = useRef(0)
  const isDragging = useRef(false)  // ドラッグとクリックの区別用 (StarCanvas 側でも使用)

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
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) isDragging.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
    setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }))
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
      const newScale = Math.min(3, Math.max(0.08, t.scale * factor))
      const ratio = newScale / t.scale
      return {
        scale: newScale,
        x: mx - ratio * (mx - t.x),
        y: my - ratio * (my - t.y),
      }
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
        lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      } else if (e.touches.length === 2) {
        dragging.current = false
        pinchDist.current = getTouchDist(e.touches)
      }
    }

    function onTouchMove(e: TouchEvent) {
      e.preventDefault()
      const rect = el!.getBoundingClientRect()

      if (e.touches.length === 1 && dragging.current) {
        const dx = e.touches[0].clientX - lastPos.current.x
        const dy = e.touches[0].clientY - lastPos.current.y
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) isDragging.current = true
        lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }))

      } else if (e.touches.length === 2) {
        const dist = getTouchDist(e.touches)
        const mid  = getTouchMid(e.touches)
        const factor = dist / (pinchDist.current || dist)
        const mx = mid.x - rect.left
        const my = mid.y - rect.top

        setTransform((t) => {
          const newScale = Math.min(3, Math.max(0.08, t.scale * factor))
          const ratio = newScale / t.scale
          return {
            scale: newScale,
            x: mx - ratio * (mx - t.x),
            y: my - ratio * (my - t.y),
          }
        })
        pinchDist.current = dist
      }
    }

    function onTouchEnd(e: TouchEvent) {
      e.preventDefault()
      if (e.touches.length < 2) pinchDist.current = 0

      if (e.touches.length === 0) {
        // タップ（ドラッグなし）なら、タッチ位置の要素に click イベントを発火させる
        // (preventDefault でブラウザ生成の click がキャンセルされているため)
        if (!isDragging.current && e.changedTouches.length === 1) {
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

  // ズームボタン用 (スマホ向け)
  const zoomBy = useCallback((factor: number) => {
    const cx = window.innerWidth  / 2
    const cy = window.innerHeight / 2
    setTransform((t) => {
      const newScale = Math.min(3, Math.max(0.08, t.scale * factor))
      const ratio = newScale / t.scale
      return {
        scale: newScale,
        x: cx - ratio * (cx - t.x),
        y: cy - ratio * (cy - t.y),
      }
    })
  }, [])

  return { transform, onMouseDown, onMouseMove, onMouseUp, onWheel, zoomBy, isDragging }
}
