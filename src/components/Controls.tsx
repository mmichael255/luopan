import { RotateCcw, Download, Minus, Plus } from 'lucide-react'

interface ControlsProps {
  photoRotation: number
  photoScale: number
  compassRotation: number
  compassScale: number
  compassOpacity: number
  onPhotoRotationChange: (v: number) => void
  onPhotoScaleChange: (v: number) => void
  onCompassRotationChange: (v: number) => void
  onCompassScaleChange: (v: number) => void
  onCompassOpacityChange: (v: number) => void
  onExport: () => void
  hasPhoto: boolean
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  format: (v: number) => string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-xs text-neutral-400 shrink-0">{label}</span>
      <button
        type="button"
        className="p-1 rounded bg-neutral-800 text-neutral-300 active:bg-neutral-700"
        onClick={() => onChange(Math.max(min, value - step * 5))}
      >
        <Minus size={12} />
      </button>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-6 accent-amber-600"
      />
      <button
        type="button"
        className="p-1 rounded bg-neutral-800 text-neutral-300 active:bg-neutral-700"
        onClick={() => onChange(Math.min(max, value + step * 5))}
      >
        <Plus size={12} />
      </button>
      <span className="w-12 text-right text-xs text-neutral-300 tabular-nums">
        {format(value)}
      </span>
      <button
        type="button"
        className="p-1 rounded text-neutral-500 active:text-neutral-300"
        onClick={() => onChange(min <= 0 && max >= 1 && step < 1 ? 1 : 0)}
        title="重置"
      >
        <RotateCcw size={12} />
      </button>
    </div>
  )
}

export default function Controls({
  photoRotation,
  photoScale,
  compassRotation,
  compassScale,
  compassOpacity,
  onPhotoRotationChange,
  onPhotoScaleChange,
  onCompassRotationChange,
  onCompassScaleChange,
  onCompassOpacityChange,
  onExport,
  hasPhoto,
}: ControlsProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 bg-neutral-900/95 backdrop-blur border-t border-neutral-800 pb-[env(safe-area-inset-bottom)]">
      <div className="px-4 py-3 space-y-3 max-w-lg mx-auto">
        {/* Photo controls */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-amber-500 uppercase tracking-wider">底图</div>
          <Slider
            label="旋转"
            value={photoRotation}
            min={-180}
            max={180}
            step={1}
            onChange={onPhotoRotationChange}
            format={(v) => `${v.toFixed(0)}°`}
          />
          <Slider
            label="缩放"
            value={photoScale}
            min={0.5}
            max={3}
            step={0.05}
            onChange={onPhotoScaleChange}
            format={(v) => `${v.toFixed(2)}x`}
          />
        </div>

        {/* Compass controls */}
        <div className="space-y-2 pt-2 border-t border-neutral-800">
          <div className="text-xs font-semibold text-amber-500 uppercase tracking-wider">罗盘</div>
          <Slider
            label="旋转"
            value={compassRotation}
            min={0}
            max={360}
            step={1}
            onChange={onCompassRotationChange}
            format={(v) => `${v.toFixed(0)}°`}
          />
          <Slider
            label="缩放"
            value={compassScale}
            min={0.5}
            max={3}
            step={0.05}
            onChange={onCompassScaleChange}
            format={(v) => `${v.toFixed(2)}x`}
          />
          <Slider
            label="透明度"
            value={compassOpacity}
            min={0}
            max={1}
            step={0.01}
            onChange={onCompassOpacityChange}
            format={(v) => `${(v * 100).toFixed(0)}%`}
          />
        </div>

        {/* Export */}
        <button
          type="button"
          disabled={!hasPhoto}
          onClick={onExport}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-3 text-white font-medium shadow-lg active:scale-95 transition-transform disabled:opacity-40 disabled:active:scale-100"
        >
          <Download size={18} />
          导出图片
        </button>
      </div>
    </div>
  )
}
