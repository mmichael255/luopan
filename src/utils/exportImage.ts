interface ExportParams {
  photoSrc: string
  photoWidth: number
  photoHeight: number
  photoCssWidth: number
  photoCssHeight: number
  photoRotation: number
  photoScale: number
  compassSvgString: string
  compassWidth: number
  compassHeight: number
  compassX: number
  compassY: number
  compassRotation: number
  compassScale: number
  compassOpacity: number
}

export interface ExportProgress {
  status: 'loading' | 'drawing' | 'done'
  progress: number
}

export type ProgressCallback = (progress: ExportProgress) => void

export async function exportImage(
  params: ExportParams,
  onProgress?: ProgressCallback
): Promise<string> {
  const {
    photoSrc,
    photoWidth,
    photoHeight,
    photoCssWidth,
    photoCssHeight,
    photoRotation,
    photoScale,
    compassSvgString,
    compassWidth,
    compassHeight,
    compassX,
    compassY,
    compassRotation,
    compassScale,
    compassOpacity,
  } = params

  onProgress?.({ status: 'loading', progress: 10 })

  // 计算 CSS 像素与实际像素的比例
  const scaleX = photoWidth / photoCssWidth
  const scaleY = photoHeight / photoCssHeight

  // 计算导出尺寸
  const compassSize = 600 * compassScale
  const exportWidth = Math.max(photoWidth, compassSize * scaleX)
  const exportHeight = Math.max(photoHeight, compassSize * scaleY)

  // 使用实际像素尺寸创建 canvas
  const canvas = document.createElement('canvas')
  canvas.width = exportWidth
  canvas.height = exportHeight
  const ctx = canvas.getContext('2d')!

  // 让出主线程，让 UI 更新
  await new Promise(resolve => requestAnimationFrame(resolve))
  onProgress?.({ status: 'drawing', progress: 30 })

  // Load photo
  const photoImg = await loadImage(photoSrc)

  await new Promise(resolve => requestAnimationFrame(resolve))
  onProgress?.({ status: 'drawing', progress: 50 })

  // Draw photo with transform (居中)
  ctx.save()
  ctx.translate(exportWidth / 2, exportHeight / 2)
  ctx.rotate((photoRotation * Math.PI) / 180)
  ctx.scale(photoScale, photoScale)
  ctx.drawImage(photoImg, -photoWidth / 2, -photoHeight / 2, photoWidth, photoHeight)
  ctx.restore()

  await new Promise(resolve => requestAnimationFrame(resolve))
  onProgress?.({ status: 'drawing', progress: 70 })

  // Load compass SVG
  const compassBlob = new Blob([compassSvgString], { type: 'image/svg+xml;charset=utf-8' })
  const compassUrl = URL.createObjectURL(compassBlob)
  const compassImg = await loadImage(compassUrl)
  URL.revokeObjectURL(compassUrl)

  await new Promise(resolve => requestAnimationFrame(resolve))
  onProgress?.({ status: 'drawing', progress: 85 })

  // Draw compass with transform
  ctx.save()
  ctx.globalAlpha = compassOpacity
  const cx = exportWidth / 2 + compassX * scaleX
  const cy = exportHeight / 2 + compassY * scaleY
  ctx.translate(cx, cy)
  ctx.rotate((compassRotation * Math.PI) / 180)
  const drawWidth = compassWidth * compassScale * scaleX
  const drawHeight = compassHeight * compassScale * scaleY
  ctx.drawImage(compassImg, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
  ctx.restore()

  await new Promise(resolve => requestAnimationFrame(resolve))
  onProgress?.({ status: 'drawing', progress: 95 })

  const dataUrl = canvas.toDataURL('image/png')

  onProgress?.({ status: 'done', progress: 100 })

  return dataUrl
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
