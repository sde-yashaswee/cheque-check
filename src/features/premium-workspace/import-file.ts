import type { ImportKind, ImportRow } from './types'
import { importColumns } from './logic'

export async function readImportFile(file: File): Promise<ImportRow[]> {
  if (!/\.(csv|xlsx|xls)$/i.test(file.name) || file.size > 5 * 1024 * 1024) {
    throw new Error('file')
  }
  const [XLSX, codepages] = await Promise.all([
    import('xlsx'),
    import('xlsx/dist/cpexcel.full.mjs'),
  ])
  XLSX.set_cptable(codepages)
  const workbook = XLSX.read(await file.arrayBuffer(), {
    type: 'array',
    raw: true,
    cellDates: true,
    codepage: 65001,
  })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!sheet) throw new Error('file')
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: true,
    defval: '',
    blankrows: false,
  })
  if (matrix.length < 2 || matrix.length > 501) throw new Error('limit')
  const headers = matrix[0].map((value) =>
    String(value)
      .trim()
      .replace(/^\uFEFF/, ''),
  )
  if (headers.some((h) => !h) || new Set(headers).size !== headers.length)
    throw new Error('file')
  return matrix.slice(1).map((row) =>
    Object.fromEntries(
      headers.map((header, index) => {
        let value = row[index] ?? ''
        if (value instanceof Date) {
          value = `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
        }
        if (typeof value === 'number' && header === 'cheque_number')
          value = String(value).padStart(6, '0')
        return [header, typeof value === 'number' ? value : String(value)]
      }),
    ),
  )
}

export function downloadImportSample(kind: ImportKind): void {
  const blob = new Blob([`${importColumns(kind).join(',')}\r\n`], {
    type: 'text/csv;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${kind}-import.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}
