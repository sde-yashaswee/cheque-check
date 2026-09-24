export const PRIVATE_CHEQUE_BUCKET = 'private-cheque-images'
export const PRIVATE_AVATAR_BUCKET = 'private-avatars'

export type PrivateMediaBucket =
  typeof PRIVATE_CHEQUE_BUCKET | typeof PRIVATE_AVATAR_BUCKET

const extensionByMimeType = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const

function detectImageExtension(bytes: Uint8Array) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg'
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return 'png'
  }
  if (
    String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
  ) {
    return 'webp'
  }
  return null
}

export async function validateImageFile(file: File, maxBytes: number) {
  if (file.size === 0) {
    throw new Error('The selected image is empty')
  }
  if (file.size > maxBytes) {
    throw new Error(`Image must be smaller than ${maxBytes / 1024 / 1024} MB`)
  }

  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  const extension = detectImageExtension(bytes)
  const declaredExtension =
    extensionByMimeType[file.type as keyof typeof extensionByMimeType]

  if (!extension || !declaredExtension) {
    throw new Error('Only JPEG, PNG, and WebP images are supported')
  }
  if (extension !== declaredExtension) {
    throw new Error('Image contents do not match the declared file type')
  }

  return extension
}

export function buildPrivateMediaUrl(bucket: PrivateMediaBucket, path: string) {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/')
  return `/api/storage/${bucket}/${encodedPath}`
}

export function parsePrivateMediaUrl(value: string) {
  const match = value.match(
    /^\/api\/storage\/(private-cheque-images|private-avatars)\/(.+)$/u,
  )
  if (!match) return null

  const bucket = match[1] as PrivateMediaBucket
  let path: string[]
  try {
    path = match[2].split('/').map((segment) => decodeURIComponent(segment))
  } catch {
    return null
  }
  if (path.some((segment) => !segment || segment === '.' || segment === '..')) {
    return null
  }
  return { bucket, path }
}
