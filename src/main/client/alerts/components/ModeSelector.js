import React, { Component, PropTypes } from 'react'
import { FormControl } from 'react-bootstrap'

import modes from '../modes'

export default class ModeSelector extends Component {
  static propTypes = {
    feeds: PropTypes.array,
    entity: PropTypes.object,
    entityUpdated: PropTypes.func
  }
  render () {
    const { entity, entityUpdated } = this.props
    const getMode = (id) => {
      return modes.find((mode) => mode.gtfsType === +id)
    }
    return (
      <div>
        <FormControl
          componentClass='select'
          value={entity.mode.gtfsType}
          onChange={(evt) => {
            entityUpdated(entity, 'MODE', getMode(evt.target.value))
          }}
        >
          {modes.map((mode) => (<option value={mode.gtfsType}>{mode.name}</option>))}
        </FormControl>
      </div>
    )
  }
}
