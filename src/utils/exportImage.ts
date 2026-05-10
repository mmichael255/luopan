interface ExportParams {
  photoSrc: string
  photoWidth: number
  photoHeight: number
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

  const canvas = document.createElement('canvas')
  canvas.width = photoWidth
  canvas.height = photoHeight
  const ctx = canvas.getContext('2d')!

  // Load photo
  const photoImg = await loadImage(photoSrc)

  // Draw photo with transform
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
  ctx.save()
  ctx.globalAlpha = compassOpacity
  const cx = photoWidth / 2 + compassX
  const cy = photoHeight / 2 + compassY
  ctx.translate(cx, cy)
  ctx.rotate((compassRotation * Math.PI) / 180)
  ctx.scale(compassScale, compassScale)
  ctx.drawImage(compassImg, -compassWidth / 2, -compassHeight / 2)
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
