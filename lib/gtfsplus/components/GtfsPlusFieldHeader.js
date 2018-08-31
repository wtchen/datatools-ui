// @flow

import React, {Component} from 'react'
import {Glyphicon} from 'react-bootstrap'

import type {GtfsPlusField, GtfsPlusTable} from '../../types'

type Props = {
  field: GtfsPlusField,
  showHelpClicked: (string, ?string) => void,
  table: GtfsPlusTable
}

export default class GtfsPlusFieldHeader extends Component<Props> {
  _onClick = () => {
    this.props.showHelpClicked(this.props.table.id, this.props.field.name)
  }

  render () {
    const {field} = this.props
    return (
      <th
        className={`gtfs-plus-column-header col-md-${field.columnWidth}`}>
        {field.name}{field.required ? ' *' : ''}
        <Glyphicon
          glyph='question-sign'
          className='pull-right'
          style={{ cursor: 'pointer' }}
          onClick={this._onClick} />
      </th>
    )
  }
}
