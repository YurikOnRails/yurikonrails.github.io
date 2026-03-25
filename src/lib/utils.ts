export function formatDate(date: Date, style: 'full' | 'month-year' = 'full'): string {
  if (style === 'month-year') {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
