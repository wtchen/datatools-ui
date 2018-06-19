// @flow

import type {GtfsPlusReducerState} from './gtfsplus'

export type GtfsPlusStates = {
  gtfsplus: GtfsPlusReducerState
}

module.exports = {
  gtfsplus: require('./gtfsplus')
}
