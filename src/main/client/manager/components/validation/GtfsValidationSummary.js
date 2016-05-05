import React from 'react'
import { Panel, Table, Glyphicon, Button } from 'react-bootstrap'
import { browserHistory } from 'react-router'

export default class GtfsValidationSummary extends React.Component {

  constructor (props) {
    super(props)
    this.state = { expanded: false }
  }

  componentWillReceiveProps (nextProps) {
    if(!nextProps.validationResult) this.setState({ expanded: false })
  }

  render () {

    const result = this.props.validationResult

    const header = (
      <h3 onClick={() => {
        if(!result) this.props.validationResultRequested()
        this.setState({ expanded: !this.state.expanded })
      }}>
        <Glyphicon glyph='check' /> Validation Results
      </h3>
    )

    let report = null
    const tableStyle = {
      tableLayout: 'fixed'
    }

    if (result && result.loadStatus === 'SUCCESS') {
      report = (
        <Table striped style={tableStyle}>
          <thead>
            <tr>
              <th>Entity</th>
              <th>Issue</th>
              <th>Priority</th>
              <th>Count</th>
            </tr>
          </thead>
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

          <ResultTable
            title='Shape Issues'
            invalidValues={result.shapes.invalidValues}
          />
        </Table>)
    } else if (result) {
      report = (<div>No validation results to show.</div>)
    }

    return (
      <div>
        {report}
      </div>
    )
  }
}

class ResultTable extends React.Component {

  render () {

    const breakWordStyle = {
      wordWrap: 'break-word',
      overflowWrap: 'break-word'
    }
    let problemMap = {}
    this.props.invalidValues.map(val => {
      if (!problemMap[val.problemType]) {
        problemMap[val.problemType] = {
          count: 1,
          priority: val.priority,
          entity: val.affectedEntity,
          affected: [val.affectedEntityId],
          description: val.problemDescription,
          data: [val.problemData],
        }
      }
      problemMap[val.problemType].count++
      problemMap[val.problemType].affected.push(val.affectedEntityId)
      problemMap[val.problemType].data.push(val.problemData)
    })
    console.log(problemMap)
    return (
      <div>
          <tbody>
            {Object.keys(problemMap).map((key) => {
              return (
                <tr>
                  <td style={breakWordStyle}>{problemMap[key].entity}</td>
                  <td style={breakWordStyle}>{key.replace(/([A-Z])/g, ' $1')}</td>
                  <td style={breakWordStyle}>{problemMap[key].priority}</td>
                  <td style={breakWordStyle} title={problemMap[key].affected.join(', ')}>{problemMap[key].count}</td>
                </tr>
              )
            })}
          </tbody>
      </div>
    )
  }
}
