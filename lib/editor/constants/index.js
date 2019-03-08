// @flow

export const ENTITY = {
  // TODO: use these constants for component names
  STOP: 'stop',
  ROUTE: 'route',
  TRIP_PATTERN: 'trippattern',

  // For constructing new entities (before saving to server)
  NEW_ID: -2
}

export const POINT_TYPE = Object.freeze({
  DEFAULT: 0,
  ANCHOR: 1,
  STOP: 2
})

export const ARROW_MAGENTA = '#d50b65'
