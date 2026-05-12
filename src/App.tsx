import { useState, useRef, useCallback, useMemo } from 'react'
import { Settings, X, Share2, Download } from 'lucide-react'
import PhotoPicker from './components/PhotoPicker'
import Compass from './components/Compass'
import Controls from './components/Controls'
import { useCompassGesture } from './hooks/useCompassGesture'
import { exportImage } from './utils/exportImage'
import type { ExportProgress } from './utils/exportImage'

export default function App() {
  const [photo, setPhoto] = useState<string | null>(null)
  const [photoSize, setPhotoSize] = useState({ width: 0, height: 0, cssWidth: 0, cssHeight: 0 })
  const [photoRotation, setPhotoRotation] = useState(0)
  const [photoScale, setPhotoScale] = useState(1)
  const [compassX, setCompassX] = useState(0)
  const [compassY, setCompassY] = useState(0)
  const [compassRotation, setCompassRotation] = useState(0)
  const [compassScale, setCompassScale] = useState(0.5)
  const [compassOpacity, setCompassOpacity] = useState(0.85)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [exportedImage, setExportedImage] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const compassRef = useRef<HTMLDivElement>(null)

  const handlePhotoSelect = (dataUrl: string, naturalWidth: number, naturalHeight: number, cssWidth: number, cssHeight: number) => {
    setPhoto(dataUrl)
    setPhotoSize({ width: naturalWidth, height: naturalHeight, cssWidth, cssHeight })
    setPhotoRotation(0)
    setPhotoScale(1)
    setCompassX(0)
    setCompassY(0)
    setCompassRotation(0)
    setCompassScale(0.5)
    setCompassOpacity(0.85)
  }

  const handleCompassChange = useCallback((x: number, y: number) => {
    setCompassX(x)
    setCompassY(y)
  }, [])

  const handleCompassRotationChange = useCallback((rotation: number) => {
    setCompassRotation(rotation)
  }, [])

  const handleCompassScaleChange = useCallback((scale: number) => {
    setCompassScale(scale)
  }, [])

  const {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useCompassGesture({
    compassX,
    compassY,
    compassRotation,
    compassScale,
    onPositionChange: handleCompassChange,
    onRotationChange: handleCompassRotationChange,
    onScaleChange: handleCompassScaleChange,
  })

  const handleExport = async () => {
    if (!photo || !compassRef.current) return
    const svgEl = compassRef.current.querySelector('svg')
    if (!svgEl) return
    const svgString = new XMLSerializer().serializeToString(svgEl)

    setIsExporting(true)
    setExportProgress({ status: 'loading', progress: 0 })

    try {
      const dataUrl = await exportImage(
        {
          photoSrc: photo,
          photoWidth: photoSize.width,
          photoHeight: photoSize.height,
          photoCssWidth: photoSize.cssWidth,
          photoCssHeight: photoSize.cssHeight,
          photoRotation,
          photoScale,
          compassSvgString: svgString,
          compassWidth: 600,
          compassHeight: 600,
          compassX,
          compassY,
          compassRotation,
          compassScale,
          compassOpacity,
        },
        (progress) => setExportProgress(progress)
      )

      setExportedImage(dataUrl)
      setShowPreview(true)
    } finally {
      setIsExporting(false)
      setExportProgress(null)
    }
  }

  const handleClosePreview = () => {
    setShowPreview(false)
    setExportedImage(null)
  }

  const handleShare = async () => {
    if (!exportedImage) return

    try {
      const response = await fetch(exportedImage)
      const blob = await response.blob()
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      const file = new File([blob], `luopan_${timestamp}.png`, { type: 'image/png' })

      const canShare = navigator.canShare && navigator.canShare({ files: [file] })

      if (navigator.share && canShare) {
        await navigator.share({
          files: [file],
          title: '风水罗盘',
          text: '罗盘图片',
        })
      } else {
        // 不支持分享：显示提示
        alert('您的浏览器不支持直接分享，请长按上方图片保存到相册')
      }
    } catch (err) {
      // 区分用户取消和真正错误
      if (err instanceof Error && err.name === 'AbortError') {
        // 用户取消或关闭分享面板，完全静默
        return
      }
      // 其他错误静默处理，不打断用户
      console.log('Share failed:', err)
    }
  }

  const handleDownload = () => {
    if (!exportedImage) return
    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      const a = document.createElement('a')
      a.href = exportedImage
      a.download = `luopan_${timestamp}.png`
      a.click()
      showToast('图片已开始下载', 'success')
    } catch {
      showToast('下载失败，请长按图片保存', 'error')
    }
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }

  // 检测是否为 iOS 设备
  const isIOS = useMemo(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    return /iphone|ipad|ipod/.test(userAgent)
  }, [])

  // 检测是否支持文件分享
  const canShareFiles = useMemo(() => {
    if (!navigator.share || !navigator.canShare) return false
    try {
      const testFile = new File([''], 'test.png', { type: 'image/png' })
      return navigator.canShare({ files: [testFile] })
    } catch {
      return false
    }
  }, [])

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-black">
      {!photo ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
          <div className="text-amber-500 text-6xl font-serif">罗盘</div>
          <p className="text-neutral-400 text-sm text-center">
            选择一张照片，叠加风水罗盘，<br/>自由调整位置、旋转和透明度后导出
          </p>
          <PhotoPicker onPhotoSelect={handlePhotoSelect} />
        </div>
      ) : (
        <>
          <div className="flex-1 relative overflow-hidden">
            {/* Photo layer - 使用 CSS 尺寸显示 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="relative"
                style={{ width: photoSize.cssWidth, height: photoSize.cssHeight }}
              >
                <img
                  src={photo}
                  alt="底图"
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{
                    transform: `rotate(${photoRotation}deg) scale(${photoScale})`,
                    transformOrigin: 'center center',
                  }}
                  draggable={false}
                />
              </div>
            </div>

            {/* Compass overlay - 在 TransformWrapper 之外，独立接收触摸事件 */}
            <div
              ref={compassRef}
              className="absolute cursor-move"
              style={{
                left: `calc(50% + ${compassX}px)`,
                top: `calc(50% + ${compassY}px)`,
                width: '600px',
                height: '600px',
                transform: `translate(-50%, -50%) rotate(${compassRotation}deg) scale(${compassScale})`,
                opacity: compassOpacity,
                touchAction: 'none',
                zIndex: 10,
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <Compass />
            </div>

            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 pt-[env(safe-area-inset-top)]">
              <PhotoPicker onPhotoSelect={handlePhotoSelect} />
            </div>
          </div>

          {/* Show panel button - only visible when panel is hidden */}
          <button
            type="button"
            onClick={() => setControlsVisible(true)}
            className={`absolute right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-30 p-3 rounded-full bg-neutral-800/90 backdrop-blur-sm border border-neutral-700 text-amber-500 shadow-lg transition-all duration-300 ${
              controlsVisible ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 translate-y-0'
            }`}
            aria-label="显示设置面板"
          >
            <Settings size={24} strokeWidth={2} />
          </button>

          <Controls
            onToggleVisible={() => setControlsVisible(!controlsVisible)}
            photoRotation={photoRotation}
            photoScale={photoScale}
            compassRotation={compassRotation}
            compassScale={compassScale}
            compassOpacity={compassOpacity}
            onPhotoRotationChange={setPhotoRotation}
            onPhotoScaleChange={setPhotoScale}
            onCompassRotationChange={setCompassRotation}
            onCompassScaleChange={setCompassScale}
            onCompassOpacityChange={setCompassOpacity}
            onExport={handleExport}
            hasPhoto={!!photo}
            visible={controlsVisible}
            isExporting={isExporting}
            exportProgress={exportProgress}
          />

          {/* 导出预览弹窗 */}
          {showPreview && exportedImage && (
            <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
              {/* 顶部导航栏 */}
              <div className="flex items-center justify-between px-4 py-3 pt-[env(safe-area-inset-top)]">
                <button
                  type="button"
                  onClick={handleClosePreview}
                  className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800/50 active:scale-90 transition-all"
                >
                  <X size={24} strokeWidth={2} />
                </button>
                <span className="text-white font-medium">预览图片</span>
                <div className="w-10" />{/* spacer */}
              </div>

              {/* 图片预览区 - 支持 iOS 长按保存 */}
              <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
                <img
                  src={exportedImage}
                  alt="导出预览"
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  style={{
                    WebkitTouchCallout: 'default',
                    WebkitUserSelect: 'none',
                    pointerEvents: 'auto',
                  }}
                />
              </div>

              {/* 底部操作栏 */}
              <div className="px-4 py-4 pb-[env(safe-area-inset-bottom)] space-y-3 bg-neutral-900/80 backdrop-blur-xl border-t border-neutral-800">
                <p className="text-center text-neutral-400 text-sm">
                  {isIOS
                    ? '点击"分享"从系统菜单保存，或长按图片选择"存储图像"'
                    : canShareFiles
                      ? '点击保存下载，或使用分享发送给其他应用'
                      : '点击保存下载图片'}
                </p>
                <div className="flex gap-3">
                  {/* 保存按钮 - 始终显示 */}
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 px-4 py-3.5 text-white font-medium shadow-lg shadow-amber-900/30 active:from-amber-600 active:to-amber-700 active:scale-[0.98] transition-all"
                  >
                    <Download size={18} strokeWidth={2} />
                    {isIOS ? '保存到相册' : '保存图片'}
                  </button>

                  {/* 分享按钮 - 仅当支持分享时显示 */}
                  {canShareFiles && (
                    <button
                      type="button"
                      onClick={handleShare}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-neutral-700 px-4 py-3.5 text-white font-medium active:bg-neutral-600 active:scale-[0.98] transition-all"
                      title="分享到其他应用"
                    >
                      <Share2 size={18} strokeWidth={2} />
                      分享
                    </button>
                  )}
                </div>
              </div>

              {/* Toast 提示 */}
              {toast && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50">
                  <div
                    className={`px-4 py-2.5 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm transition-all ${
                      toast.type === 'success'
                        ? 'bg-green-500/90 text-white'
                        : 'bg-red-500/90 text-white'
                    }`}
                  >
                    {toast.message}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
