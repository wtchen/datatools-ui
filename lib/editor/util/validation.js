import validator from 'validator'

export function validate (type, required, name, value, entities, id) {
  let isNotValid
  switch (type) {
    case 'GTFS_ID':
      isNotValid = required && !value
      const indices = []
      const idList = entities.map(e => e[name])
      let idx = idList.indexOf(value)
      while (idx !== -1) {
        indices.push(idx)
        idx = idList.indexOf(value, idx + 1)
      }
      const isNotUnique = value && (indices.length > 1 || indices.length && entities[indices[0]].id !== id)
      if (isNotValid || isNotUnique) {
        return {field: name, invalid: isNotValid || isNotUnique}
      } else {
        return false
      }
    case 'TEXT':
    case 'GTFS_TRIP':
    case 'GTFS_SHAPE':
    case 'GTFS_BLOCK':
    case 'GTFS_FARE':
    case 'GTFS_SERVICE':
      isNotValid = required && !value
      if (isNotValid) {
        return {field: name, invalid: isNotValid}
      } else {
        return false
      }
    case 'URL':
      isNotValid = required && !value || value && !validator.isURL(value)
      if (isNotValid) {
        return {field: name, invalid: isNotValid}
      } else {
        return false
      }
    case 'EMAIL':
      isNotValid = required && !value || value && !validator.isEmail(value)
      if (isNotValid) {
        return {field: name, invalid: isNotValid}
      } else {
        return false
      }
    case 'GTFS_ZONE':
      isNotValid = required && (value === null || typeof value === 'undefined')
      if (isNotValid) {
        return {field: name, invalid: isNotValid}
      } else {
        return false
      }
    case 'TIMEZONE':
      isNotValid = required && (value === null || typeof value === 'undefined')
      if (isNotValid) {
        return {field: name, invalid: isNotValid}
      } else {
        return false
      }
    case 'LANGUAGE':
      isNotValid = required && (value === null || typeof value === 'undefined')
      if (isNotValid) {
        return {field: name, invalid: isNotValid}
      } else {
        return false
      }
    case 'LATITUDE':
      isNotValid = required && (value === null || typeof value === 'undefined')
      if (value > 90 || value < -90) {
        isNotValid = true
      }
      if (isNotValid) {
        return {field: name, invalid: isNotValid}
      } else {
        return false
      }
    case 'LONGITUDE':
      isNotValid = required && (value === null || typeof value === 'undefined')
      if (value > 180 || value < -180) {
        isNotValid = true
      }
      if (isNotValid) {
        return {field: name, invalid: isNotValid}
      } else {
        return false
      }
    case 'TIME':
    case 'NUMBER':
      isNotValid = required && (value === null || typeof value === 'undefined')
      if (isNotValid) {
        return {field: name, invalid: isNotValid}
      } else {
        return false
      }
    case 'DATE':
    case 'COLOR':
    case 'POSITIVE_INT':
    case 'POSITIVE_NUM':
    case 'DAY_OF_WEEK_BOOLEAN':
    case 'DROPDOWN':
      // isNotValid = required && (value === null || typeof value === 'undefined')
      // if (isNotValid) {
      //   return {field: name, invalid: isNotValid}
      // }
      break
    case 'GTFS_ROUTE':
    case 'GTFS_AGENCY':
    case 'GTFS_STOP':
  }
}
