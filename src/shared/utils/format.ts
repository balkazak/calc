export const formatCurrency = (amount: number | string, currency = 'KZT') => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(value)) return '0 ₸'

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace('KZT', '₸')
    .replace('₸', ' ₸')
    .trim()
}

export const formatIIN = (iin: string): string => {
  return iin.replace(/(\d{6})(\d{6})/, '$1 $2')
}

export const maskPhone = (phone: string): string => {
  if (!phone) return ''
  // Input: +7 (777) 123-45-67 or +77771234567
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 11) return phone

  const country = digits.slice(0, 1) // 7
  const code = digits.slice(1, 4) // 777
  const last2 = digits.slice(-2) // 67

  return `+${country} (${code}) ••• •• ${last2}`
}

export function pluralize(count: number, words: readonly string[]) {
  const n = Math.abs(count)
  const index =
    n % 10 === 1 && n % 100 !== 11
      ? 0
      : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)
        ? 1
        : 2

  return countsToString(count, words[index] || '')
}

function countsToString(count: number, word: string) {
  return `${count} ${word}`
}
