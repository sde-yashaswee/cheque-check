import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { TABLES } from '../src/lib/supabase/tables'
import {
  buildPrivateMediaUrl,
  PRIVATE_AVATAR_BUCKET,
  PRIVATE_CHEQUE_BUCKET,
  type PrivateMediaBucket,
  validateImageFile,
} from '../src/lib/storage'

config({ path: '.env.local' })
config({ path: '.env' })

type SourceBucket = 'avatars' | 'cheque-images'

type MigrationItem = {
  table:
    | typeof TABLES.PROFILES
    | typeof TABLES.BUSINESSES
    | typeof TABLES.PARTIES
    | typeof TABLES.CHEQUES
  column: 'avatar_url' | 'logo_url' | 'image_url'
  id: string
  userId: string
  sourceUrl: string
  targetBucket: PrivateMediaBucket
  maxBytes: number
}

type ProfileRow = { id: string; user_id: string; avatar_url: string | null }
type BusinessRow = {
  id: string
  user_id: string
  logo_url: string | null
}
type PartyRow = { id: string; business_id: string; avatar_url: string | null }
type ChequeRow = { id: string; business_id: string; image_url: string | null }

const args = new Set(process.argv.slice(2))
const applyChanges = args.has('--apply')
const deleteSource = args.has('--delete-source')

function printUsage() {
  console.log(`Usage:
  npm run storage:migrate
  npm run storage:migrate -- --apply
  npm run storage:migrate -- --apply --delete-source

Dry-run is the default. --delete-source is only valid with --apply.`)
}

function parsePublicStorageUrl(value: string) {
  try {
    const url = new URL(value)
    const marker = '/storage/v1/object/public/'
    const markerIndex = url.pathname.indexOf(marker)
    if (markerIndex === -1) return null

    const segments = url.pathname
      .slice(markerIndex + marker.length)
      .split('/')
      .map(decodeURIComponent)
    const bucket = segments.shift()
    if (bucket !== 'avatars' && bucket !== 'cheque-images') return null
    if (
      segments.length === 0 ||
      segments.some(
        (segment) => !segment || segment === '.' || segment === '..',
      )
    ) {
      return null
    }

    return { bucket: bucket as SourceBucket, path: segments.join('/') }
  } catch {
    return null
  }
}

async function main() {
  if (args.has('--help')) {
    printUsage()
    return
  }
  if (deleteSource && !applyChanges) {
    throw new Error('--delete-source requires --apply')
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required',
    )
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  async function fetchRows<T>(table: string, columns: string) {
    const rows: T[] = []
    const pageSize = 1000

    for (let from = 0; ; from += pageSize) {
      const { data, error } = await supabase
        .from(table)
        .select(columns)
        .range(from, from + pageSize - 1)
      if (error) throw error

      const page = (data ?? []) as T[]
      rows.push(...page)
      if (page.length < pageSize) break
    }
    return rows
  }

  const [profiles, businesses, parties, cheques] = await Promise.all([
    fetchRows<ProfileRow>(TABLES.PROFILES, 'id, user_id, avatar_url'),
    fetchRows<BusinessRow>(TABLES.BUSINESSES, 'id, user_id, logo_url'),
    fetchRows<PartyRow>(TABLES.PARTIES, 'id, business_id, avatar_url'),
    fetchRows<ChequeRow>(TABLES.CHEQUES, 'id, business_id, image_url'),
  ])
  const businessOwners = new Map(
    businesses.map((business) => [business.id, business.user_id]),
  )
  const items: MigrationItem[] = []

  for (const profile of profiles) {
    if (profile.avatar_url) {
      items.push({
        table: TABLES.PROFILES,
        column: 'avatar_url',
        id: profile.id,
        userId: profile.user_id,
        sourceUrl: profile.avatar_url,
        targetBucket: PRIVATE_AVATAR_BUCKET,
        maxBytes: 5 * 1024 * 1024,
      })
    }
  }
  for (const business of businesses) {
    if (business.logo_url) {
      items.push({
        table: TABLES.BUSINESSES,
        column: 'logo_url',
        id: business.id,
        userId: business.user_id,
        sourceUrl: business.logo_url,
        targetBucket: PRIVATE_AVATAR_BUCKET,
        maxBytes: 5 * 1024 * 1024,
      })
    }
  }
  for (const party of parties) {
    const userId = businessOwners.get(party.business_id)
    if (party.avatar_url && userId) {
      items.push({
        table: TABLES.PARTIES,
        column: 'avatar_url',
        id: party.id,
        userId,
        sourceUrl: party.avatar_url,
        targetBucket: PRIVATE_AVATAR_BUCKET,
        maxBytes: 5 * 1024 * 1024,
      })
    }
  }
  for (const cheque of cheques) {
    const userId = businessOwners.get(cheque.business_id)
    if (cheque.image_url && userId) {
      items.push({
        table: TABLES.CHEQUES,
        column: 'image_url',
        id: cheque.id,
        userId,
        sourceUrl: cheque.image_url,
        targetBucket: PRIVATE_CHEQUE_BUCKET,
        maxBytes: 10 * 1024 * 1024,
      })
    }
  }

  let migrated = 0
  let skipped = 0
  let failed = 0

  for (const item of items) {
    const source = parsePublicStorageUrl(item.sourceUrl)
    if (!source) {
      skipped++
      continue
    }

    if (!applyChanges) {
      console.log(`[dry-run] ${item.table}.${item.column} ${item.id}`)
      migrated++
      continue
    }

    try {
      const { data: blob, error: downloadError } = await supabase.storage
        .from(source.bucket)
        .download(source.path)
      if (downloadError || !blob)
        throw downloadError ?? new Error('Download failed')

      const file = new File([blob], source.path, {
        type: blob.type || 'application/octet-stream',
      })
      const extension = await validateImageFile(file, item.maxBytes)
      const targetPath = `${item.userId}/${crypto.randomUUID()}.${extension}`
      const { error: uploadError } = await supabase.storage
        .from(item.targetBucket)
        .upload(targetPath, blob, { contentType: file.type, upsert: false })
      if (uploadError) throw uploadError

      const targetUrl = buildPrivateMediaUrl(item.targetBucket, targetPath)
      const { data: updatedRow, error: updateError } = await supabase
        .from(item.table)
        .update({ [item.column]: targetUrl })
        .eq('id', item.id)
        .eq(item.column, item.sourceUrl)
        .select('id')
        .maybeSingle()
      if (updateError) throw updateError
      if (!updatedRow) {
        throw new Error('Database URL changed during migration')
      }

      if (deleteSource) {
        const { error: deleteError } = await supabase.storage
          .from(source.bucket)
          .remove([source.path])
        if (deleteError) throw deleteError
      }

      migrated++
      console.log(`[migrated] ${item.table}.${item.column} ${item.id}`)
    } catch (error) {
      failed++
      console.error(
        `[failed] ${item.table}.${item.column} ${item.id}:`,
        error instanceof Error ? error.message : String(error),
      )
    }
  }

  console.log({
    mode: applyChanges ? 'apply' : 'dry-run',
    migrated,
    skipped,
    failed,
  })
  if (failed > 0) process.exitCode = 1
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
