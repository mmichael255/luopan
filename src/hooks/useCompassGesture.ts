import { useCallback, useRef } from 'react'

interface DragState {
  startX: number
  startY: number
  initialCompassX: number
  initialCompassY: number
}

interface PinchState {
  startDistance: number
  startAngle: number
  initialScale: number
  initialRotation: number
  centerX: number
  centerY: number
}

interface UseCompassGestureProps {
  compassX: number
  compassY: number
  compassRotation: number
  compassScale: number
  onPositionChange: (x: number, y: number) => void
  onRotationChange: (rotation: number) => void
  onScaleChange: (scale: number) => void
}

interface TouchLike {
  clientX: number
  clientY: number
}

function getDistance(t1: TouchLike, t2: TouchLike): number {
  return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
}

function getAngle(t1: TouchLike, t2: TouchLike): number {
  return (Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * 180) / Math.PI
}

export function useCompassGesture({
  compassX,
  compassY,
  compassRotation,
  compassScale,
  onPositionChange,
  onRotationChange,
  onScaleChange,
}: UseCompassGestureProps) {
  const dragState = useRef<DragState | null>(null)
  const pinchState = useRef<PinchState | null>(null)
  const activeTouches = useRef<Map<number, TouchLike>>(new Map())

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      // 记录所有触摸点
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i]
        activeTouches.current.set(touch.identifier, { clientX: touch.clientX, clientY: touch.clientY })
      }

      const touches = Array.from(activeTouches.current.values())

      if (touches.length === 1) {
        // 单指 - 开始拖动
        const touch = touches[0]
        dragState.current = {
          startX: touch.clientX,
          startY: touch.clientY,
          initialCompassX: compassX,
          initialCompassY: compassY,
        }
      } else if (touches.length === 2) {
        // 双指 - 开始缩放/旋转
        const t1 = touches[0]
        const t2 = touches[1]

        pinchState.current = {
          startDistance: getDistance(t1, t2),
          startAngle: getAngle(t1, t2),
          initialScale: compassScale,
          initialRotation: compassRotation,
          centerX: (t1.clientX + t2.clientX) / 2,
          centerY: (t1.clientY + t2.clientY) / 2,
        }
        // 清除拖动状态，避免冲突
        dragState.current = null
      }

      e.stopPropagation()
      e.preventDefault()
    },
    [compassX, compassY, compassRotation, compassScale]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      // 更新触摸点位置
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i]
        if (activeTouches.current.has(touch.identifier)) {
          activeTouches.current.set(touch.identifier, { clientX: touch.clientX, clientY: touch.clientY })
        }
      }

      const touches = Array.from(activeTouches.current.values())

      if (touches.length === 1 && dragState.current) {
        // 单指拖动
        const touch = touches[0]
        const dx = touch.clientX - dragState.current.startX
        const dy = touch.clientY - dragState.current.startY
        onPositionChange(dragState.current.initialCompassX + dx, dragState.current.initialCompassY + dy)
      } else if (touches.length === 2 && pinchState.current) {
        // 双指缩放/旋转
        const t1 = touches[0]
        const t2 = touches[1]

        const currentDistance = getDistance(t1, t2)
        const currentAngle = getAngle(t1, t2)

        // 计算缩放
        const scaleRatio = currentDistance / pinchState.current.startDistance
        const newScale = Math.max(0.5, Math.min(3, pinchState.current.initialScale * scaleRatio))

        // 计算旋转
        const angleDiff = currentAngle - pinchState.current.startAngle
        const newRotation = (pinchState.current.initialRotation + angleDiff + 360) % 360

        onScaleChange(newScale)
        onRotationChange(newRotation)
      }

      e.stopPropagation()
      e.preventDefault()
    },
    [onPositionChange, onRotationChange, onScaleChange]
  )

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // 移除结束的触摸点
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      activeTouches.current.delete(touch.identifier)
    }

    const remainingTouches = Array.from(activeTouches.current.values())

    if (remainingTouches.length === 0) {
      // 所有手指都离开，清除所有状态
      dragState.current = null
      pinchState.current = null
    } else if (remainingTouches.length === 1 && pinchState.current) {
      // 从双指变为单指，切换到拖动模式
      pinchState.current = null
      const touch = remainingTouches[0]
      dragState.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        initialCompassX: compassX,
        initialCompassY: compassY,
      }
    }

    e.stopPropagation()
  }, [compassX, compassY])

  // 保留 pointer 事件支持（用于桌面端鼠标操作）
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // 只有单指/鼠标时才处理
      if (e.pointerType === 'touch') return // 触摸由 touch 事件处理

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
    [compassX, compassY]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === 'touch') return // 触摸由 touch 事件处理
      if (!dragState.current) return

      const dx = e.clientX - dragState.current.startX
      const dy = e.clientY - dragState.current.startY
      onPositionChange(dragState.current.initialCompassX + dx, dragState.current.initialCompassY + dy)
      e.stopPropagation()
      e.preventDefault()
    },
    [onPositionChange]
  )

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return

    dragState.current = null
    const target = e.currentTarget as HTMLElement
    if (target.hasPointerCapture(e.pointerId)) {
      target.releasePointerCapture(e.pointerId)
    }
    e.stopPropagation()
  }, [])

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  }
}
