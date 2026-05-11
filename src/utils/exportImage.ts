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

export async function exportImage(params: ExportParams): Promise<string> {
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

  // 计算 CSS 像素与实际像素的比例
  const scaleX = photoWidth / photoCssWidth
  const scaleY = photoHeight / photoCssHeight

  // 使用实际像素尺寸创建 canvas
  const canvas = document.createElement('canvas')
  canvas.width = photoWidth
  canvas.height = photoHeight
  const ctx = canvas.getContext('2d')!

  // Load photo
  const photoImg = await loadImage(photoSrc)

  // Draw photo with transform (居中)
  ctx.save()
  ctx.translate(photoWidth / 2, photoHeight / 2)
  ctx.rotate((photoRotation * Math.PI) / 180)
  ctx.scale(photoScale, photoScale)
  ctx.drawImage(photoImg, -photoWidth / 2, -photoHeight / 2)
  ctx.restore()

  // Load compass SVG
  const compassBlob = new Blob([compassSvgString], { type: 'image/svg+xml;charset=utf-8' })
  const compassUrl = URL.createObjectURL(compassBlob)
  const compassImg = await loadImage(compassUrl)
  URL.revokeObjectURL(compassUrl)

  // Draw compass with transform
  // 将 CSS 像素的罗盘位置和大小转换为实际像素
  ctx.save()
  ctx.globalAlpha = compassOpacity
  const cx = photoWidth / 2 + compassX * scaleX
  const cy = photoHeight / 2 + compassY * scaleY
  ctx.translate(cx, cy)
  ctx.rotate((compassRotation * Math.PI) / 180)
  // 罗盘大小也按比例缩放
  const drawWidth = compassWidth * compassScale * scaleX
  const drawHeight = compassHeight * compassScale * scaleY
  ctx.drawImage(compassImg, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
  ctx.restore()

  return canvas.toDataURL('image/png')
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
