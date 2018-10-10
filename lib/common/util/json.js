// @flow

/**
 * Check if a string is valid JSON.
 */
export function isValidJSON (str: string): boolean {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}
