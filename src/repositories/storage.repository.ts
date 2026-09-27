import { createClient } from '@/lib/supabase/client'
import {
  buildPrivateMediaUrl,
  parsePrivateMediaUrl,
  PRIVATE_AVATAR_BUCKET,
  PRIVATE_CHEQUE_BUCKET,
  type PrivateMediaBucket,
  validateImageFile,
} from '@/lib/storage'
import { ValidationError, mapSupabaseError } from '@/lib/errors'

export interface IStorageRepository {
  uploadChequeImage(file: File): Promise<string>
  uploadAvatar(file: File): Promise<string>
  deleteChequeImage(url: string): Promise<void>
}

export class SupabaseStorageRepository implements IStorageRepository {
  private readonly supabase = createClient()

  async uploadChequeImage(file: File): Promise<string> {
    return this.uploadPrivateImage(
      PRIVATE_CHEQUE_BUCKET,
      file,
      10 * 1024 * 1024,
    )
  }

  async uploadAvatar(file: File): Promise<string> {
    return this.uploadPrivateImage(PRIVATE_AVATAR_BUCKET, file, 5 * 1024 * 1024)
  }

  async deleteChequeImage(url: string): Promise<void> {
    const media = parsePrivateMediaUrl(url)
    if (!media || media.bucket !== PRIVATE_CHEQUE_BUCKET) return

    const { error } = await this.supabase.storage
      .from(media.bucket)
      .remove([media.path.join('/')])
    if (error) throw mapSupabaseError(error)
  }

  private async uploadPrivateImage(
    bucket: PrivateMediaBucket,
    file: File,
    maxBytes: number,
  ): Promise<string> {
    const extension = await validateImageFile(file, maxBytes)
    const {
      data: { user },
      error: authError,
    } = await this.supabase.auth.getUser()

    if (authError) throw mapSupabaseError(authError)
    if (!user) throw new ValidationError('Sign in before uploading an image')

    const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`
    const { error: uploadError } = await this.supabase.storage
      .from(bucket)
      .upload(filePath, file, { contentType: file.type, upsert: false })

    if (uploadError) throw mapSupabaseError(uploadError)
    return buildPrivateMediaUrl(bucket, filePath)
  }
}
