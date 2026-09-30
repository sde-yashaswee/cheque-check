import { describe, expect, it } from 'vitest'
import { TAG_COLORS, nextTagColor } from './tag-colors'

describe('nextTagColor', () => {
  it('starts with the first palette color', () => {
    expect(nextTagColor([])).toBe(TAG_COLORS[0].value)
  })

  it('picks the least used color in palette order', () => {
    const used = TAG_COLORS.slice(0, 3).map(({ value }) => ({ color: value }))
    expect(nextTagColor(used)).toBe(TAG_COLORS[3].value)
  })

  it('ignores custom colors outside the palette', () => {
    expect(nextTagColor([{ color: '#123456' }])).toBe(TAG_COLORS[0].value)
  })

  it('matches palette colors case-insensitively', () => {
    expect(nextTagColor([{ color: TAG_COLORS[0].value.toUpperCase() }])).toBe(
      TAG_COLORS[1].value,
    )
  })
})
