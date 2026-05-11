import { useRef } from 'react'
import { ImagePlus } from 'lucide-react'

interface PhotoPickerProps {
  onPhotoSelect: (dataUrl: string, naturalWidth: number, naturalHeight: number, cssWidth: number, cssHeight: number) => void
}

export default function PhotoPicker({ onPhotoSelect }: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      const img = new Image()
      img.onload = () => {
        // 计算 CSS 显示尺寸：图片按 object-contain 显示，适应屏幕
        const screenWidth = window.innerWidth
        const screenHeight = window.innerHeight - 100 // 预留控制面板空间
        const imgRatio = img.naturalWidth / img.naturalHeight
        const screenRatio = screenWidth / screenHeight

        let cssWidth: number
        let cssHeight: number
        if (imgRatio > screenRatio) {
          // 图片更宽，以宽度为基准
          cssWidth = screenWidth
          cssHeight = screenWidth / imgRatio
        } else {
          // 图片更高，以高度为基准
          cssHeight = screenHeight
          cssWidth = screenHeight * imgRatio
        }

        onPhotoSelect(dataUrl, img.naturalWidth, img.naturalHeight, cssWidth, cssHeight)
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="flex items-center gap-2 rounded-xl bg-amber-700 px-5 py-3 text-white shadow-lg active:scale-95 transition-transform"
    >
      <ImagePlus size={20} />
      <span className="text-sm font-medium">选择照片</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </button>
  )
}
