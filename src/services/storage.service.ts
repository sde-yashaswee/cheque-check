import { createClient } from '@/lib/supabase/client'
import {
  buildPrivateMediaUrl,
  PRIVATE_AVATAR_BUCKET,
  PRIVATE_CHEQUE_BUCKET,
  type PrivateMediaBucket,
  validateImageFile,
} from '@/lib/storage'

const supabase = createClient()

async function uploadPrivateImage(
  bucket: PrivateMediaBucket,
  file: File,
  maxBytes: number,
) {
  const extension = await validateImageFile(file, maxBytes)
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) throw new Error('Sign in before uploading an image')

  const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { contentType: file.type, upsert: false })

  if (uploadError) throw uploadError
  return buildPrivateMediaUrl(bucket, filePath)
}

export class StorageService {
  static async uploadChequeImage(file: File) {
    return uploadPrivateImage(PRIVATE_CHEQUE_BUCKET, file, 10 * 1024 * 1024)
  }

  static async uploadAvatar(file: File) {
    return uploadPrivateImage(PRIVATE_AVATAR_BUCKET, file, 5 * 1024 * 1024)
  }
}

export const storageService = new StorageService()
