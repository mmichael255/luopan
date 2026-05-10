import { useState, useRef, useCallback } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import PhotoPicker from './components/PhotoPicker'
import Compass from './components/Compass'
import Controls from './components/Controls'
import { useCompassDrag } from './hooks/useCompassDrag'
import { exportImage } from './utils/exportImage'

export default function App() {
  const [photo, setPhoto] = useState<string | null>(null)
  const [photoSize, setPhotoSize] = useState({ width: 0, height: 0 })
  const [photoRotation, setPhotoRotation] = useState(0)
  const [photoScale, setPhotoScale] = useState(1)
  const [compassX, setCompassX] = useState(0)
  const [compassY, setCompassY] = useState(0)
  const [compassRotation, setCompassRotation] = useState(0)
  const [compassScale, setCompassScale] = useState(1)
  const [compassOpacity, setCompassOpacity] = useState(0.85)
  const [zoomScale, setZoomScale] = useState(1)

  const compassRef = useRef<HTMLDivElement>(null)

  const handlePhotoSelect = (dataUrl: string, width: number, height: number) => {
    setPhoto(dataUrl)
    setPhotoSize({ width, height })
    setPhotoRotation(0)
    setPhotoScale(1)
    setCompassX(0)
    setCompassY(0)
    setCompassRotation(0)
    setCompassScale(1)
    setCompassOpacity(0.85)
    setZoomScale(1)
  }

  const handleCompassChange = useCallback((x: number, y: number) => {
    setCompassX(x)
    setCompassY(y)
  }, [])

  const { handlePointerDown, handlePointerMove, handlePointerUp } = useCompassDrag(
    compassX,
    compassY,
    zoomScale,
    handleCompassChange,
  )

  const handleExport = async () => {
    if (!photo || !compassRef.current) return
    const svgEl = compassRef.current.querySelector('svg')
    if (!svgEl) return
    const svgString = new XMLSerializer().serializeToString(svgEl)

    const dataUrl = await exportImage({
      photoSrc: photo,
      photoWidth: photoSize.width,
      photoHeight: photoSize.height,
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
    })

    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `luopan_${Date.now()}.png`
    a.click()
  }

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
            <TransformWrapper
              initialScale={1}
              minScale={0.2}
              maxScale={6}
              centerOnInit
              onTransform={(ref) => setZoomScale(ref.state.scale)}
            >
              <TransformComponent
                wrapperStyle={{ width: '100%', height: '100%' }}
                contentStyle={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <div className="relative" style={{ width: photoSize.width, height: photoSize.height }}>
                  {/* Photo layer */}
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
                  {/* Compass overlay */}
                  <div
                    ref={compassRef}
                    className="absolute touch-none cursor-move"
                    style={{
                      left: `calc(50% + ${compassX}px)`,
                      top: `calc(50% + ${compassY}px)`,
                      transform: `translate(-50%, -50%) rotate(${compassRotation}deg) scale(${compassScale})`,
                      opacity: compassOpacity,
                    }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                  >
                    <Compass />
                  </div>
                </div>
              </TransformComponent>
            </TransformWrapper>

            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 pt-[env(safe-area-inset-top)]">
              <PhotoPicker onPhotoSelect={handlePhotoSelect} />
            </div>
          </div>

          <Controls
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
          />
        </>
      )}
    </div>
  )
}
