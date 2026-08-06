import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function numberToIndianWords(num: number): string {
  if (num === 0) return 'Zero Rupees Only'
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  function convert(n: number): string {
    if (n < 20) return ones[n]
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '')
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convert(n % 100) : '')
    return ''
  }

  let result = ''
  
  const crores = Math.floor(num / 10000000)
  num %= 10000000
  if (crores > 0) result += convert(crores) + ' Crore '

  const lakhs = Math.floor(num / 100000)
  num %= 100000
  if (lakhs > 0) result += convert(lakhs) + ' Lakh '

  const thousands = Math.floor(num / 1000)
  num %= 1000
  if (thousands > 0) result += convert(thousands) + ' Thousand '

  if (num > 0) result += convert(num)

  // Handle paise if any (optional based on need, but keeping it simple for now)
  return result.trim() + ' Rupees Only'
}

export function getSimilarityScore(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()
  
  if (s1 === s2) return 1.0
  if (s1.length === 0 || s2.length === 0) return 0.0

  const track = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null))
  
  for (let i = 0; i <= s1.length; i += 1) track[0][i] = i
  for (let j = 0; j <= s2.length; j += 1) track[j][0] = j

  for (let j = 1; j <= s2.length; j += 1) {
    for (let i = 1; i <= s1.length; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      )
    }
  }
  
  const distance = track[s2.length][s1.length]
  const maxLength = Math.max(s1.length, s2.length)
  
  return (maxLength - distance) / maxLength
}


