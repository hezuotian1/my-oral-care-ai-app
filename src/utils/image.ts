/**
 * 客户端压缩：视觉模型对 base64 体积敏感，上传前把长边压到 maxEdge 并转 JPEG。
 * 压缩失败时原样返回，交由服务端的体积守卫兜底。
 */
export async function compressImage(file: File, maxEdge = 1280, quality = 0.82): Promise<File> {
  if (!file.type.startsWith('image/')) return file
  try {
    const bitmap = await loadBitmap(file)
    const { width, height } = bitmap
    const longest = Math.max(width, height)
    const scale = longest > maxEdge ? maxEdge / longest : 1

    // 尺寸已经不大且体积可控时不做处理，避免无谓的画质损失
    if (scale === 1 && file.size <= 1.2 * 1024 * 1024) {
      if ('close' in bitmap) bitmap.close()
      return file
    }

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(width * scale)
    canvas.height = Math.round(height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      if ('close' in bitmap) bitmap.close()
      return file
    }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    if ('close' in bitmap) bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality),
    )
    if (!blob) return file

    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg'
    return new File([blob], name, { type: 'image/jpeg' })
  } catch {
    return file
  }
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file)
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('图片读取失败'))
    }
    img.src = url
  })
}

/** 读取为本地预览 URL */
export function previewUrl(file: File): string {
  return URL.createObjectURL(file)
}
