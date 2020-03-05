// @flow

import { analyze } from 'jju'

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

/**
 * Check if a string is valid JSONC.
 */
export function isValidJSONC (str: string): boolean {
  try {
    const result = analyze(str)
    if (
      result.quote_types.indexOf("'") > -1 ||
        result.has_multi_line_quote ||
        result.has_trailing_comma
    ) {
      return false
    }
    return true
  } catch (e) {
    return false
  }
}
