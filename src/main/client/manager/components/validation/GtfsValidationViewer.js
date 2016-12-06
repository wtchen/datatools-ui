import React from 'react'
import { Panel, Table, Badge } from 'react-bootstrap'
import {Icon} from '@conveyal/woonerf'

import { getComponentMessages, getMessage } from '../../../common/util/config'

export default class GtfsValidationViewer extends React.Component {

  constructor (props) {
    super(props)
    this.state = { expanded: false }
  }
  componentWillMount () {
    this.props.fetchValidationResult()
  }
  componentWillReceiveProps (nextProps) {
    if (!nextProps.validationResult) this.setState({ expanded: false })
  }
  render () {
    const result = this.props.validationResult
    const messages = getComponentMessages('GtfsValidationViewer')

    let report = null
    let files = ['routes', 'stops', 'trips', 'shapes', 'stop_times']
    let errors = {}
    result && result.errors.map(error => {
      let key = files.indexOf(error.file) !== -1 ? error.file : 'other'
      if (!errors[error.file]) {
        errors[key] = []
      }
      errors[key].push(error)
    })
    if (result && errors) { // && result.loadStatus === 'SUCCESS') {
      report = (
        <div>
          {files.map(file => {
            return (
              <ResultTable
                title={getMessage(messages, `issues.${file}`)}
                key={`${file}-issues-table`}
                invalidValues={errors[file]}
              />
            )
          })}
          <ResultTable
            title={'Other issues'}
            invalidValues={errors.other}
          />
        </div>
      )
    } else if (result) {
      report = (<div>{getMessage(messages, 'noResults')}</div>)
    }

    return <div>
      {report}
    </div>
  }
}

class ResultTable extends React.Component {

  render () {
    const tableStyle = {
      tableLayout: 'fixed'
    }
    const messages = getComponentMessages('ResultTable')

    const breakWordStyle = {
      wordWrap: 'break-word',
      overflowWrap: 'break-word'
    }
    if (!this.props.invalidValues) {
      return (
        <Panel
          header={(<h5><Icon className='text-success' type='check' /> {this.props.title} <Badge>0</Badge></h5>)}
        >
          No issues found.
        </Panel>
      )
    }
    return (
      <Panel
        header={(<h5><Icon className='text-warning' type='exclamation-triangle' /> {this.props.title} <Badge>{this.props.invalidValues.length}</Badge></h5>)}
      >
        <Table striped style={tableStyle} fill>
          <thead>
            <tr>
              <th>{getMessage(messages, 'problemType')}</th>
              <th>{getMessage(messages, 'priority')}</th>
              <th>{getMessage(messages, 'affectedIds')}</th>
              <th>{getMessage(messages, 'line')}</th>
              <th className='col-md-6'>{getMessage(messages, 'description')}</th>
            </tr>
          </thead>
          <tbody>
            {this.props.invalidValues.map((val, index) => {
              return (
                <tr key={`${index}-issue-row`}>
                  <td style={breakWordStyle}>{val.errorType}</td>
                  <td style={breakWordStyle}>{val.priority}</td>
                  <td style={breakWordStyle}>{val.affectedEntityId}</td>
                  <td style={breakWordStyle}>{val.line}</td>
                  <td className='col-md-4' style={breakWordStyle}>{val.message}</td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </Panel>
    )
  }
}
