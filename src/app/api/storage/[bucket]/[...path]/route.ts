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
  request: Request,
  { params }: { params: Promise<{ bucket: string; path: string[] }> },
) {
  const { bucket, path } = await params
  // Client-side prefetch (e.g. before handing the URL to next/image) needs the
  // signed URL as JSON, since next/image's own fetch can't carry our cookies.
  const wantsJson = new URL(request.url).searchParams.get('format') === 'json'
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

  if (wantsJson) {
    return NextResponse.json(
      { url: data.signedUrl },
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  }

  const response = NextResponse.redirect(data.signedUrl, 307)
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}
