import { RotateCcw, Download, Minus, Plus, X } from 'lucide-react'

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
  onToggleVisible: () => void
  hasPhoto: boolean
  visible: boolean
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
      <span className="w-14 text-sm text-neutral-400 shrink-0 font-medium">{label}</span>
      <button
        type="button"
        className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-700/50 text-amber-500 active:bg-neutral-600/50 active:scale-90 transition-all"
        onClick={() => onChange(Math.max(min, value - step * 5))}
      >
        <Minus size={14} strokeWidth={2.5} />
      </button>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-6 accent-amber-500"
      />
      <button
        type="button"
        className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-700/50 text-amber-500 active:bg-neutral-600/50 active:scale-90 transition-all"
        onClick={() => onChange(Math.min(max, value + step * 5))}
      >
        <Plus size={14} strokeWidth={2.5} />
      </button>
      <span className="w-14 text-right text-sm text-neutral-300 tabular-nums font-medium">
        {format(value)}
      </span>
      <button
        type="button"
        className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-500 active:text-amber-500 active:scale-90 transition-all"
        onClick={() => {
          // 根据滑块类型设置重置值
          if (label === "缩放" && min === 0.1) {
            onChange(1) // 底图缩放重置为 1
          } else if (label === "缩放") {
            onChange(0.5) // 罗盘缩放重置为 0.5
          } else if (label === "旋转") {
            onChange(0)
          } else if (label === "透明度") {
            onChange(0.85)
          } else {
            onChange(min <= 0 && max >= 1 && step < 1 ? 1 : 0)
          }
        }}
        title="重置"
      >
        <RotateCcw size={14} />
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
  onToggleVisible,
  hasPhoto,
  visible,
}: ControlsProps) {
  return (
    <div className={`absolute left-0 right-0 z-20 bg-neutral-900/95 backdrop-blur-xl border-t border-neutral-800 pb-[env(safe-area-inset-bottom)] transition-transform duration-300 ease-out ${
      visible ? 'translate-y-0 bottom-0' : 'translate-y-full bottom-0'
    }`}>
      {/* Close button - top right */}
      <button
        type="button"
        onClick={onToggleVisible}
        className="absolute top-2 right-2 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800/50 active:scale-90 transition-all"
        aria-label="隐藏面板"
      >
        <X size={20} strokeWidth={2} />
      </button>
      <div className="px-4 py-3 space-y-3 max-w-lg mx-auto">
        {/* Photo controls */}
        <div className="space-y-3">
          <div className="text-sm font-semibold text-amber-500/90 tracking-wide flex items-center gap-2">
            <span className="w-1 h-4 bg-amber-500 rounded-full"></span>
            底图
          </div>
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
            min={0.1}
            max={3}
            step={0.05}
            onChange={onPhotoScaleChange}
            format={(v) => `${v.toFixed(2)}x`}
          />
        </div>

        {/* Compass controls */}
        <div className="space-y-3 pt-3 border-t border-neutral-800">
          <div className="text-sm font-semibold text-amber-500/90 tracking-wide flex items-center gap-2">
            <span className="w-1 h-4 bg-amber-500 rounded-full"></span>
            罗盘
          </div>
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
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-amber-500 to-amber-600 px-4 py-4 text-white font-semibold shadow-lg shadow-amber-900/30 active:scale-[0.98] active:from-amber-600 active:to-amber-700 transition-all disabled:opacity-40 disabled:active:scale-100"
        >
          <Download size={20} strokeWidth={2} />
          导出图片
        </button>
      </div>
    </div>
  )
}
