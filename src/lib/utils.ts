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

