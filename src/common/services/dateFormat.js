/** Deutsche Datums- und Zeitformate (SPEC §10.1: „Fr., 18.07."). */

const WEEKDAYS_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

const pad2 = (value) => String(value).padStart(2, "0");

/**
 * @param {Date} date
 * @returns {string} z. B. "Fr., 18.07."
 */
export function formatDayShort(date) {
  return `${WEEKDAYS_SHORT[date.getDay()]}., ${pad2(date.getDate())}.${pad2(date.getMonth() + 1)}.`;
}

/**
 * @param {string} iso
 * @returns {string} z. B. "Fr., 18.07., 14:32 Uhr"
 */
export function formatDateTime(iso) {
  const date = new Date(iso);
  return `${formatDayShort(date)}, ${pad2(date.getHours())}:${pad2(date.getMinutes())} Uhr`;
}
