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
      editingIsDisabled,
      externalPropertyChanged,
      isProjectAdmin,
      resourceProps,
      resourceType
    } = this.props
    return (
      <Panel
        header={<h3>{resourceType} properties</h3>}
      >
        <Table striped fill>
          <thead>
            <tr>
              <th className='col-md-4'>Property</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(resourceProps).sort().map(propName => {
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
                      value={resourceProps[propName]}
                      onChange={(value) => externalPropertyChanged(propName, value)}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </Panel>
    )
  }
}
