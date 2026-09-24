import { describe, expect, it } from 'vitest'
import {
  buildPrivateMediaUrl,
  parsePrivateMediaUrl,
  PRIVATE_AVATAR_BUCKET,
  validateImageFile,
} from './storage'

describe('private storage helpers', () => {
  it('uses the file signature rather than the supplied extension', async () => {
    const signature = new Uint8Array([0x89, 0x50, 0x4e, 0x47])
    const file = new File([signature], 'avatar.exe', { type: 'image/png' })
    await expect(validateImageFile(file, 100)).resolves.toBe('png')
  })

  it('rejects unsupported and oversized files', async () => {
    await expect(
      validateImageFile(
        new File(['text'], 'notes.txt', { type: 'text/plain' }),
        100,
      ),
    ).rejects.toThrow('Only JPEG, PNG, and WebP images are supported')
    await expect(
      validateImageFile(
        new File(['too large'], 'avatar.png', { type: 'image/png' }),
        2,
      ),
    ).rejects.toThrow('Image must be smaller')
  })

  it('builds an encoded authenticated media URL', () => {
    expect(buildPrivateMediaUrl(PRIVATE_AVATAR_BUCKET, 'user/a b.png')).toBe(
      '/api/storage/private-avatars/user/a%20b.png',
    )
  })

  it('parses private URLs and rejects path traversal', () => {
    expect(
      parsePrivateMediaUrl('/api/storage/private-cheque-images/user/image.jpg'),
    ).toEqual({
      bucket: 'private-cheque-images',
      path: ['user', 'image.jpg'],
    })
    expect(
      parsePrivateMediaUrl('/api/storage/private-avatars/user/../image.jpg'),
    ).toBeNull()
  })
})
