// @flow

import { parse } from 'jsonc-parser'

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
    // eslint-disable-next-line prefer-const
    let errors = []
    parse(str, errors)
    return errors.length === 0
  } catch (e) {
    return false
  }
}
