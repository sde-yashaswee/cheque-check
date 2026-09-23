import { execFileSync } from 'node:child_process'
import { extname, resolve } from 'node:path'

const supportedExtensions = new Set([
  '.css',
  '.js',
  '.json',
  '.jsx',
  '.md',
  '.mjs',
  '.mts',
  '.ts',
  '.tsx',
  '.yaml',
  '.yml',
])

function gitFiles(args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8' })
      .split(/\r?\n/u)
      .filter(Boolean)
  } catch {
    return []
  }
}

const base = process.env.FORMAT_BASE ?? 'origin/main'
const files = new Set([
  ...gitFiles(['diff', '--name-only', '--diff-filter=ACMR', `${base}...HEAD`]),
  ...gitFiles(['diff', '--name-only', '--diff-filter=ACMR']),
  ...gitFiles(['ls-files', '--others', '--exclude-standard']),
])

const formatFiles = [...files].filter((file) =>
  supportedExtensions.has(extname(file)),
)

if (formatFiles.length === 0) {
  console.log('No changed files require formatting checks.')
  process.exit(0)
}

const prettier = resolve('node_modules/prettier/bin/prettier.cjs')
const mode = process.argv.includes('--write') ? '--write' : '--check'
execFileSync(process.execPath, [prettier, mode, ...formatFiles], {
  stdio: 'inherit',
})
