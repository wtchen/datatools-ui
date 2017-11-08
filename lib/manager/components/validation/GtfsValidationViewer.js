import Icon from '@conveyal/woonerf/components/icon'
import moment from 'moment'
import React, {Component, PropTypes} from 'react'
import {ListGroup, ListGroupItem, Panel} from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table/lib/BootstrapTable'
import TableHeaderColumn from 'react-bootstrap-table/lib/TableHeaderColumn'

import OptionButton from '../../../common/components/OptionButton'

const DEFAULT_LIMIT = 10

export default class GtfsValidationViewer extends Component {
  static propTypes = {
    fetchValidationResult: PropTypes.func,
    validationResult: PropTypes.object,
    version: PropTypes.object
  }
  state = {
    offset: 0,
    limit: DEFAULT_LIMIT
  }
  componentWillMount () {
    this.props.fetchValidationResult()
  }
  sortPriority (a, b, order) {
    const priorityToNum = p => {
      switch (p) {
        case 'HIGH':
          return 3
        case 'MEDIUM':
          return 2
        case 'LOW':
          return 1
        default:
          return 0
      }
    }
    if (order === 'desc') {
      return priorityToNum(a.priority) - priorityToNum(b.priority)
    } else {
      return priorityToNum(b.priority) - priorityToNum(a.priority)
    }
  }
  formatter (cell, row) {
    return <span title={cell}>{cell}</span>
  }

  _onClickErrorType = errorType => {
    const {version: feedVersion, fetchValidationErrors} = this.props
    const {active} = this.state
    if (active === errorType) {
      this.setState({active: null})
    } else {
      const offset = 0
      const limit = DEFAULT_LIMIT
      // reset active error type, limit, and offset
      this.setState({active: errorType, limit, offset})
      fetchValidationErrors({feedVersion, errorType, offset, limit})
    }
  }

  _onClickLoadMoreErrors = errorType => {
    const {version: feedVersion, fetchValidationErrors} = this.props
    const {limit} = this.state
    const offset = this.state.offset * limit + 1
    this.setState({offset})
    fetchValidationErrors({feedVersion, errorType, offset, limit})
  }

  render () {
    const {
      validationResult: result,
      version
    } = this.props
    const {active} = this.state
    const dateFormat = 'MMM. DD, YYYY'
    const timeFormat = 'h:MMa'
    // const messages = getComponentMessages('GtfsValidationViewer')
    const tableOptions = {
      striped: true,
      search: true,
      hover: true,
      exportCSV: true,
      // maxHeight: '500px',
      tableStyle: { marginLeft: '0px', marginRight: '0px' },
      pagination: true,
      options: {
        paginationShowsTotal: true,
        sizePerPageList: [10, 20, 50, 100]
      }
    }
    const hasValidation = result && result.error_counts
    const hasErrors = hasValidation && result.error_counts.length
    const listGroupItemStyle = { fontSize: '18px', textAlign: 'center' }
    return (
      <div>
        <h2 style={{marginTop: '0px'}}>{version.name} <small>{moment(version.updated).format(dateFormat + ', ' + timeFormat)}</small></h2>
        <Panel header={<h2>Validation errors</h2>}>
          {hasErrors
            ? result.error_counts.map((category, index) => {
              const activeWithErrors = category.errors && active === category.type
              return (
                <ListGroup key={index} fill>
                  <ListGroupItem style={listGroupItemStyle}>
                    {category.type}: {category.count}
                    {' '}
                    <OptionButton
                      value={category.type}
                      onClick={this._onClickErrorType}>
                      <Icon type={`caret-${active === category.type ? 'up' : 'down'}`} />
                    </OptionButton>
                  </ListGroupItem>
                  {activeWithErrors
                    ? category.errors.map((error, index) => (
                      <ListGroupItem key={index} style={listGroupItemStyle}>
                        line: {error.line_number}{' '}
                        entity_type: {error.entity_type}{' '}
                        entity_id: {error.entity_id}{' '}
                        bad_value: {error.bad_value}
                      </ListGroupItem>
                    ))
                    : null
                  }
                  {activeWithErrors && category.errors.length < category.count
                    ? <ListGroupItem style={listGroupItemStyle}>
                      <OptionButton
                        value={category.type}
                        onClick={this._onClickLoadMoreErrors}>
                        Load more
                      </OptionButton>
                    </ListGroupItem>
                    : activeWithErrors
                    ? <ListGroupItem style={listGroupItemStyle}>
                      No more errors of this type
                    </ListGroupItem>
                    : null
                  }
                </ListGroup>
              )
            })
            : null
          }
        </Panel>
        <BootstrapTable
          data={result && result.errors ? result.errors : []}
          {...tableOptions}
        >
          <TableHeaderColumn hidden isKey dataField='index' />
          <TableHeaderColumn dataSort dataFormat={this.formatter} width='65' dataField='file'>File</TableHeaderColumn>
          <TableHeaderColumn dataSort dataFormat={this.formatter} width='120' dataField='field'>Field</TableHeaderColumn>
          <TableHeaderColumn dataSort dataFormat={this.formatter} width='60' dataField='line'>Line</TableHeaderColumn>
          <TableHeaderColumn dataSort dataFormat={this.formatter} width='140' dataField='errorType'>Type</TableHeaderColumn>
          <TableHeaderColumn dataSort dataFormat={this.formatter} width='400' dataField='message'>Description</TableHeaderColumn>
          <TableHeaderColumn dataSort dataFormat={this.formatter} width='90' sortFunc={this.sortPriority} dataField='priority'>Priority</TableHeaderColumn>
          <TableHeaderColumn dataSort dataFormat={this.formatter} width='90' dataField='affectedEntityId'>Entity ID</TableHeaderColumn>
          {/* <TableHeaderColumn dataSort dataFormat={(cell, row) => {
              return (
                <LinkContainer to={`/feed/${this.props.version.feedSource.id}/edit/${row.file.replace(/s\s*$/, '')}/${cell}`}>
                  <Button
                    bsStyle='success'
                    bsSize='small'
                  >
                    Edit
                  </Button>
                </LinkContainer>
              )
            }} width='90' dataField='affectedEntityId'>Action</TableHeaderColumn>
          */}
          {/*
            <TableHeaderColumn dataSort dataField='route_desc'>Description</TableHeaderColumn>
            <TableHeaderColumn
              dataSort dataField='route_url'
              dataFormat={(cell, row) => {
                return cell ? ( <a href={cell} target={'_blank'} >Link</a> ) : ''
              }}>
                Route URL
            </TableHeaderColumn>
          */}
        </BootstrapTable>
      </div>
    )
  }
}
