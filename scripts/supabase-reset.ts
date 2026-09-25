import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { confirm, input } from '@inquirer/prompts'

const root = resolve(import.meta.dirname, '..')
const trackedAllowlist = resolve(root, 'supabase/.dev-projects.json')
const localAllowlist = resolve(root, 'supabase/.dev-projects.local.json')
const linkedProjectFile = resolve(root, 'supabase/.temp/project-ref')

function runSupabase(args: string[], capture = true) {
  return execFileSync('npx.cmd', ['supabase', ...args], {
    cwd: root,
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
  }).trim()
}

function readRefs(path: string): string[] {
  if (!existsSync(path)) return []
  const value = JSON.parse(readFileSync(path, 'utf8')) as {
    projectRefs?: unknown
  }
  return Array.isArray(value.projectRefs)
    ? value.projectRefs.filter((ref): ref is string => typeof ref === 'string')
    : []
}

function getLinkedProjectRef() {
  if (!existsSync(linkedProjectFile)) return undefined
  return readFileSync(linkedProjectFile, 'utf8').trim() || undefined
}

async function main() {
  const projectRef = getLinkedProjectRef()
  if (!projectRef) {
    throw new Error(
      'No linked Supabase project found. Run npm run supabase:setup first.',
    )
  }

  const allowedRefs = new Set([
    ...readRefs(trackedAllowlist),
    ...readRefs(localAllowlist),
  ])
  if (!allowedRefs.has(projectRef)) {
    throw new Error(
      `Refusing to reset ${projectRef}. Add it to supabase/.dev-projects.local.json only if it is a disposable test project.`,
    )
  }

  const typedRef = await input({
    message: `Type ${projectRef} to confirm the destructive reset`,
  })
  if (typedRef !== projectRef)
    throw new Error('Project ref did not match; reset cancelled.')
  if (
    !(await confirm({
      message: 'Reset the linked database and reload seed data?',
      default: false,
    }))
  ) {
    console.log('Reset cancelled.')
    return
  }

  runSupabase(['db', 'reset', '--linked'], false)
  console.log(
    `Reset complete for ${projectRef}. Migrations and supabase/seed.sql were applied.`,
  )
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
