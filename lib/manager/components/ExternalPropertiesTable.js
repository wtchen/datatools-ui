import React, { Component, PropTypes } from 'react'
import { Panel, Table } from 'react-bootstrap'

import EditableTextField from '../../common/components/EditableTextField'

export default class ExternalPropertiesTable extends Component {
  static propTypes = {
    editingIsDisabled: PropTypes.bool,
    externalPropertyChanged: PropTypes.func,
    isProjectAdmin: PropTypes.bool,
    resourceProps: PropTypes.array,
    resourceType: PropTypes.string
  }
  render () {
    const {
      resourceProps,
      resourceType
    } = this.props
    return (
      <Panel
        header={<h3>{resourceType} properties</h3>}>
        <Table striped fill>
          <thead>
            <tr>
              <th className='col-md-4'>Property</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(resourceProps).sort().map((propName, index) => (
              <ExternalProperty
                {...this.props}
                key={propName}
                value={resourceProps[propName]}
                name={propName} />
            ))}
          </tbody>
        </Table>
      </Panel>
    )
  }
}

class ExternalProperty extends Component {
  static propTypes = {
    editingIsDisabled: PropTypes.bool,
    externalPropertyChanged: PropTypes.func,
    isProjectAdmin: PropTypes.bool,
    resourceProps: PropTypes.array,
    resourceType: PropTypes.string
  }

  _onChange = (value) => this.props.externalPropertyChanged(this.props.propName, value)

  render () {
    const {editingIsDisabled, isProjectAdmin, propName, resourceType, value} = this.props
    const disabled = resourceType === 'MTC' && propName === 'AgencyId'
      ? !isProjectAdmin
      : editingIsDisabled
    return (
      <tr>
        <td>{propName}</td>
        <td>
          <EditableTextField
            key={propName}
            disabled={disabled}
            value={value}
            onChange={this._onChange} />
        </td>
      </tr>
    )
  }
}
