const dateFormatter = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })

/** Formats an SQLite `datetime('now')` value (UTC, "YYYY-MM-DD HH:MM:SS") for display. */
export function formatDate(sqliteDate: string): string {
  return dateFormatter.format(new Date(`${sqliteDate.replace(' ', 'T')}Z`))
}

const dateTimeFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC',
})

/**
 * Formats a local wall-clock value ("YYYY-MM-DDTHH:MM", or legacy "YYYY-MM-DD") as entered
 * by the user, without shifting it to another time zone.
 */
export function formatLocalDateTime(value: string): string {
  const [datePart, timePart] = value.split('T')
  const date = new Date(`${datePart}T${timePart ?? '00:00'}:00Z`)
  return timePart ? dateTimeFormatter.format(date) : dateFormatter.format(date)
}
