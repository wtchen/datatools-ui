import React from 'react'
import { Panel, Table, Glyphicon, Button } from 'react-bootstrap'
import { browserHistory } from 'react-router'

export default class GtfsValidationViewer extends React.Component {

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

    if (result) { // && result.loadStatus === 'SUCCESS') {
      report = (
        <div>
          <ResultTable
            title='Route Issues'
            invalidValues={result.route}
          />

          <ResultTable
            title='Stop Issues'
            invalidValues={result.stop}
          />

          <ResultTable
            title='Trip Issues'
            invalidValues={result.trip}
          />
        </div>
      )
    } else if (result) {
      report = (<div>No validation results to show.</div>)
    }

    return (
      <Panel
        header={header}
        collapsible
        expanded={this.state.expanded}
      >
      <p>{DT_CONFIG.modules.validator.enabled
        ? <Button
          onClick={() => browserHistory.push(`/feed/${this.props.version.feedSource.id}/${this.props.version.id}`)}
        >
          View Map
        </Button>
        : ''
      }</p>
        {report}
      </Panel>
    )
  }
}

class ResultTable extends React.Component {

  render () {

    const tableStyle = {
      tableLayout: 'fixed'
    }
    const breakWordStyle = {
      wordWrap: 'break-word',
      overflowWrap: 'break-word'
    }
    if (!this.props.invalidValues) {
      return (
        <Panel
          header={(<span><Glyphicon glyph='alert' /> {this.props.title} (0)</span>)}
          collapsible
        />
      )
    }
    return (
      <Panel
        header={(<span><Glyphicon glyph='alert' /> {this.props.title} ({this.props.invalidValues.length})</span>)}
        collapsible
      >
        <Table striped style={tableStyle}>
          <thead>
            <tr>
              <th>Problem Type</th>
              <th>Priority</th>
              <th>Affected ID(s)</th>
              <th className='col-md-6'>Description</th>
            </tr>
          </thead>
          <tbody>
            {this.props.invalidValues.map(val => {
              return (
                <tr>
                  <td style={breakWordStyle}>{val.errorType}</td>
                  <td style={breakWordStyle}>{val.priority}</td>
                  <td style={breakWordStyle}>{val.affectedEntityId}</td>
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
