/**
 * Export utilities for downloading data as CSV/JSON
 */

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: Record<keyof T, string>
) {
  if (data.length === 0) {
    alert('No data to export')
    return
  }

  // Get headers
  const keys = Object.keys(data[0]) as (keyof T)[]
  const headerRow = headers
    ? keys.map((key) => headers[key] || String(key)).join(',')
    : keys.join(',')

  // Convert data to CSV rows
  const rows = data.map((item) =>
    keys
      .map((key) => {
        const value = item[key]
        // Handle null/undefined
        if (value === null || value === undefined) return ''
        // Escape quotes and wrap in quotes if contains comma or newline
        const stringValue = String(value)
        if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      })
      .join(',')
  )

  // Combine header and rows
  const csvContent = [headerRow, ...rows].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportToJSON<T>(data: T, filename: string) {
  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.json`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

