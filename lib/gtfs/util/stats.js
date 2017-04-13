export function formatHeadway (seconds) {
  return seconds > 0
    ? Math.round(seconds / 60)
    : seconds === 0
    ? 0
    : 'N/A'
}

export function formatSpeed (metersPerSecond) {
  return metersPerSecond >= 0
    ? Math.round(metersPerSecond * 2.236936)
    : 'N/A'
}
