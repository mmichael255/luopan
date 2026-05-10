import { useCallback, useRef } from 'react'

interface DragState {
  startX: number
  startY: number
  initialCompassX: number
  initialCompassY: number
}

export function useCompassDrag(
  compassX: number,
  compassY: number,
  zoomScale: number,
  onChange: (x: number, y: number) => void,
) {
  const dragState = useRef<DragState | null>(null)

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const target = e.currentTarget as HTMLElement
      target.setPointerCapture(e.pointerId)
      dragState.current = {
        startX: e.clientX,
        startY: e.clientY,
        initialCompassX: compassX,
        initialCompassY: compassY,
      }
      e.stopPropagation()
      e.preventDefault()
    },
    [compassX, compassY],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState.current) return
      const scale = zoomScale || 1
      const dx = (e.clientX - dragState.current.startX) / scale
      const dy = (e.clientY - dragState.current.startY) / scale
      onChange(dragState.current.initialCompassX + dx, dragState.current.initialCompassY + dy)
      e.stopPropagation()
      e.preventDefault()
    },
    [onChange, zoomScale],
  )

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    dragState.current = null
    const target = e.currentTarget as HTMLElement
    if (target.hasPointerCapture(e.pointerId)) {
      target.releasePointerCapture(e.pointerId)
    }
    e.stopPropagation()
  }, [])

  return { handlePointerDown, handlePointerMove, handlePointerUp }
}
