import { describe, expect, it } from 'vitest'
import * as XLSX from 'xlsx'
import { readImportFile } from './import-file'

function fileWithBytes(name: string, content: ArrayBuffer): File {
  const file = new File([content], name)
  Object.defineProperty(file, 'arrayBuffer', { value: async () => content })
  return file
}
function csvFile(text: string): File {
  const bytes = new TextEncoder().encode(text)
  return fileWithBytes('upload.csv', bytes.buffer as ArrayBuffer)
}

describe('CSV and Excel parsing', () => {
  it('preserves six-digit cheque numbers and quoted CSV fields', async () => {
    const rows = await readImportFile(
      csvFile(
        'cheque_number,notes,cheque_date\n000001,"Invoice, October",2026-10-17',
      ),
    )
    expect(rows).toEqual([
      {
        cheque_number: '000001',
        notes: 'Invoice, October',
        cheque_date: '2026-10-17',
      },
    ])
  })
  it('preserves Hindi names and notes in UTF-8 CSV files', async () => {
    const rows = await readImportFile(
      csvFile('name,contact,notes\nआशा,+919876543210,अक्टूबर भुगतान'),
    )
    expect(rows).toEqual([
      { name: 'आशा', contact: '+919876543210', notes: 'अक्टूबर भुगतान' },
    ])
  })
  it('reads the first Excel sheet, converts Excel dates and preserves numeric cheque leading zeros', async () => {
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet([
        ['cheque_number', 'cheque_date', 'amount'],
        [1, new Date(2026, 9, 17), 125.5],
      ]),
      'Cheques',
    )
    const rows = await readImportFile(
      fileWithBytes(
        'upload.xlsx',
        XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }),
      ),
    )
    expect(rows).toEqual([
      { cheque_number: '000001', cheque_date: '2026-10-17', amount: 125.5 },
    ])
  })
  it('rejects duplicate or blank headers and empty files', async () => {
    for (const value of ['name,name\nA,B', 'name,\nA,B', 'name,contact'])
      await expect(readImportFile(csvFile(value))).rejects.toThrow()
  })
  it('rejects more than 500 rows and unexpected file types', async () => {
    await expect(
      readImportFile(
        csvFile(`name,contact\n${'A,+919876543210\n'.repeat(501)}`),
      ),
    ).rejects.toThrow('limit')
    await expect(readImportFile(new File(['x'], 'file.html'))).rejects.toThrow(
      'file',
    )
  })
})
