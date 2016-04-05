import React from 'react'

import { Panel, Table, Glyphicon } from 'react-bootstrap'

export default class GtfsValidationViewer extends React.Component {

  render () {

    const result = this.props.validationResult
    const header = (
      <h3 onClick={() => {
        console.log('panel click2');
        if(!result) this.props.validationResultRequested()
      }}>
        <Glyphicon glyph='check' /> Validation Results
      </h3>
    )

    return (
      <Panel
        header={header}
        collapsible
      >
        {result
          ? <div>
              <ResultTable
                title='Route Issues'
                invalidValues={result.routes.invalidValues}
              />

              <ResultTable
                title='Stop Issues'
                invalidValues={result.stops.invalidValues}
              />

              <ResultTable
                title='Trip Issues'
                invalidValues={result.trips.invalidValues}
              />

            </div>
          : null
        }
      </Panel>
    )
  }
}

class ResultTable extends React.Component {
  render () {
    return (
      <Panel
        header={`${this.props.title} (${this.props.invalidValues.length})`}
        collapsible
      >
        <Table striped>
          <thead>
            <tr>
              <th>Problem Type</th>
              <th>Priority</th>
              <th>Affected ID(s)</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {this.props.invalidValues.map(val => {
              return (
                <tr>
                  <td>{val.problemType}</td>
                  <td>{val.priority}</td>
                  <td>{val.affectedEntityId}</td>
                  <td>{val.problemDescription}</td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </Panel>
    )
  }
}
