export const TAG_COLORS = [
  { name: 'red', value: '#dc2626' },
  { name: 'orange', value: '#ea580c' },
  { name: 'amber', value: '#d97706' },
  { name: 'lime', value: '#65a30d' },
  { name: 'green', value: '#16a34a' },
  { name: 'teal', value: '#0d9488' },
  { name: 'cyan', value: '#0891b2' },
  { name: 'blue', value: '#2563eb' },
  { name: 'indigo', value: '#4f46e5' },
  { name: 'violet', value: '#7c3aed' },
  { name: 'pink', value: '#db2777' },
  { name: 'slate', value: '#475569' },
] as const

/** Picks the least-used palette color, in palette order on ties. */
export function nextTagColor(existing: ReadonlyArray<{ color: string }>) {
  const counts = new Map<string, number>(
    TAG_COLORS.map((color) => [color.value, 0]),
  )
  for (const { color } of existing) {
    const key = color.toLowerCase()
    if (counts.has(key)) counts.set(key, counts.get(key)! + 1)
  }
  let best: string = TAG_COLORS[0].value
  for (const { value } of TAG_COLORS) {
    if (counts.get(value)! < counts.get(best)!) best = value
  }
  return best
}
