import React from 'react'
import { Panel, Table } from 'react-bootstrap'

import EditableTextField from '../../common/components/EditableTextField'

export default class ExternalPropertiesTable extends React.Component {

  constructor (props) {
    super(props)
    console.log('>> ExternalPropertiesTable props', this.props);
  }

  componentWillMount () {
  }

  render () {
    return (
      <Panel
        header={<b>{this.props.resourceType} Properties</b>}
        collapsible
      >
        <Table striped>
          <thead>
            <tr>
              <th className='col-md-4'>Property</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(this.props.resourceProps).sort().map(propName => {
              return (
                <tr>
                  <td>{propName}</td>
                  <td>
                    <EditableTextField
                      key={propName}
                      value={this.props.resourceProps[propName]}
                      onChange={(value) => this.props.externalPropertyChanged(propName, value)}
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
