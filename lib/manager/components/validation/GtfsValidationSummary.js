import Icon from '@conveyal/woonerf/components/icon'
import React, { Component, PropTypes } from 'react'
import { Table, Button } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'

import Loading from '../../../common/components/Loading'

export default class GtfsValidationSummary extends Component {
  static propTypes = {
    version: PropTypes.object,
    feedVersionIndex: PropTypes.number,
    fetchValidationResult: PropTypes.func
  }
  constructor (props) {
    super(props)
    this.state = { expanded: false }
  }
  componentWillMount () {
    if (!this.props.version.validationResult) {
      this.props.fetchValidationResult()
    }
  }
  componentWillReceiveProps (nextProps) {
    if (!nextProps.version.validationResult) {
      this.setState({ expanded: false })
    }
  }
  render () {
    const result = this.props.version.validationResult
    if (!result) {
      return <Loading />
    }
    const errors = {}
    result && result.errors.map(error => {
      if (!errors[error.file]) {
        errors[error.file] = []
      }
      errors[error.file].push(error)
    })

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
            invalidValues={errors.routes}
          />

          <ResultTable
            title='Stop Issues'
            invalidValues={errors.stops}
          />

          <ResultTable
            title='Trip Issues'
            invalidValues={errors.trips}
          />

          <ResultTable
            title='Shape Issues'
            invalidValues={errors.shapes}
          />
        </Table>)
    } else if (result) {
      report = (<div>No validation results to show.</div>)
    }

    return (
      <div>
        {report}
        <LinkContainer to={`/feed/${this.props.version.feedSource.id}/version/${this.props.feedVersionIndex}/issues`}>
          <Button
            block
            bsStyle='primary'
            bsSize='large'
            style={{marginTop: '20px'}}
          >
            <Icon type='file-text-o' /> View full validation report
          </Button>
        </LinkContainer>
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

    const problemMap = {}
    this.props.invalidValues && this.props.invalidValues.map(val => {
      if (!problemMap[val.errorType]) {
        problemMap[val.errorType] = {
          count: 1,
          priority: val.priority,
          file: val.file,
          affected: [val.affectedEntityId],
          description: val.problemDescription,
          data: [val.problemData]
        }
      }
      problemMap[val.errorType].count++
      problemMap[val.errorType].affected.push(val.affectedEntityId)
      problemMap[val.errorType].data.push(val.problemData)
    })

    return (
      <tbody>
        {Object.keys(problemMap).map((key) => {
          return (
            <tr key={key}>
              <td style={breakWordStyle}>{problemMap[key].file}</td>
              <td style={breakWordStyle}>{key.replace(/([A-Z])/g, ' $1')}</td>
              <td style={breakWordStyle}>{problemMap[key].priority}</td>
              <td style={breakWordStyle} title={problemMap[key].affected.join(', ')}>{problemMap[key].count}</td>
            </tr>
          )
        })}
      </tbody>
    )
  }
}

// export default connect()(GtfsValidationSummary)
