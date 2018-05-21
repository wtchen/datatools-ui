// @flow
import forEach from 'lodash/forEach'
import camelCase from 'lodash/camelCase'
import isPlainObject from 'lodash/isPlainObject'
import snakeCase from 'lodash/snakeCase'

/**
 * Converts the keys for an object (or array of objects) using string mapping
 * function passed in. Operates on object recursively.
 */
function mapObjectKeys (object: any, keyMapper: string => string): any {
  const convertedObject = {}
  const convertedArray = []
  forEach(
    object,
    (value, key) => {
      if (isPlainObject(value) || Array.isArray(value)) {
        // If plain object or an array, recursively update keys of any values
        // that are also objects.
        value = mapObjectKeys(value, keyMapper)
      }
      if (Array.isArray(object)) convertedArray.push(value)
      else convertedObject[keyMapper(key)] = value
    }
  )
  if (Array.isArray(object)) return convertedArray
  else return convertedObject
}

/**
 * Converts the keys for an object or array of objects to camelCase. The function
 * always recursively converts keys.
 */
export function camelCaseKeys (object: any): any {
  return mapObjectKeys(object, camelCase)
}

/**
 * Converts the keys for an object or array of objects to snake_case. The function
 * always recursively converts keys.
 */
export function snakeCaseKeys (object: any): any {
  return mapObjectKeys(object, snakeCase)
}
