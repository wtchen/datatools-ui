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
    let errors = {}
    result && result.errors.map(error => {
      if (!errors[error.file]) {
        errors[error.file] = []
      }
      errors[error.file].push(error)
    })
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

    if (result) {
      report = (
        <Table striped style={tableStyle}>
          <thead>
            <tr>
              <th>File</th>
              <th>Issue</th>
              <th>Priority</th>
              <th>Count</th>
            </tr>
          </thead>
          <ResultTable
            title='Route Issues'
            invalidValues={errors.route}
          />

          <ResultTable
            title='Stop Issues'
            invalidValues={errors.stop}
          />

          <ResultTable
            title='Trip Issues'
            invalidValues={errors.trip}
          />

          <ResultTable
            title='Shape Issues'
            invalidValues={errors.shape}
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
    this.props.invalidValues && this.props.invalidValues.map(val => {
      if (!problemMap[val.errorType]) {
        problemMap[val.errorType] = {
          count: 1,
          priority: val.priority,
          file: val.file,
          affected: [val.affectedEntityId],
          description: val.problemDescription,
          data: [val.problemData],
        }
      }
      problemMap[val.errorType].count++
      problemMap[val.errorType].affected.push(val.affectedEntityId)
      problemMap[val.errorType].data.push(val.problemData)
    })
    console.log(problemMap)
    return (
      <div>
          <tbody>
            {Object.keys(problemMap).map((key) => {
              return (
                <tr>
                  <td style={breakWordStyle}>{problemMap[key].file}</td>
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
