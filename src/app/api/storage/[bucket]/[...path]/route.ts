import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  PRIVATE_AVATAR_BUCKET,
  PRIVATE_CHEQUE_BUCKET,
  type PrivateMediaBucket,
} from '@/lib/storage'

const privateBuckets = new Set<PrivateMediaBucket>([
  PRIVATE_AVATAR_BUCKET,
  PRIVATE_CHEQUE_BUCKET,
])

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bucket: string; path: string[] }> },
) {
  const { bucket, path } = await params
  if (
    !privateBuckets.has(bucket as PrivateMediaBucket) ||
    path.some((segment) => !segment || segment === '.' || segment === '..')
  ) {
    return NextResponse.json({ error: 'Media not found' }, { status: 404 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (path[0] !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path.join('/'), 60)

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: 'Media not found' }, { status: 404 })
  }

  const response = NextResponse.redirect(data.signedUrl, 307)
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}
