import { useRef } from 'react'
import { ImagePlus } from 'lucide-react'

interface PhotoPickerProps {
  onPhotoSelect: (dataUrl: string, width: number, height: number) => void
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
        onPhotoSelect(dataUrl, img.naturalWidth, img.naturalHeight)
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
