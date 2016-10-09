import React, { Component, PropTypes } from 'react'
import { Row, Col, Alert, Button } from 'react-bootstrap'
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table'
import Select from 'react-select'

import Loading from '../../../../common/components/Loading'

export default class PatternLayout extends Component {
  static propTypes = {
    onComponentMount: PropTypes.func,
    patternRouteFilterChange: PropTypes.func,

    routes: PropTypes.object,
    patterns: PropTypes.object,
    tableOptions: PropTypes.object
  }
  constructor (props) {
    super(props)
  }
  componentWillMount () {
    this.props.onComponentMount(this.props)
  }
  render () {
    const self = this

    return (
      <div>

        {this.props.routes.fetchStatus.fetched &&
          <Row>
            <Col xs={12} md={6} style={{padding: '20px'}}>
              <label>Filtering Patterns for Route:</label>
              <Select
                options={this.props.routes.data}
                labelKey={'route_name'}
                valueKey={'route_id'}
                placeholder={'Select a Route'}
                value={this.props.patterns.routeFilter}
                onChange={this.props.patternRouteFilterChange}
                />
            </Col>
          </Row>
        }

        {this.props.patterns.fetchStatus.fetching &&
          <Loading />
        }

        {this.props.patterns.fetchStatus.error &&
          <Alert bsStyle="danger">
            An error occurred while trying to fetch the data
          </Alert>
        }

        {this.props.patterns.fetchStatus.fetched &&
          <BootstrapTable
            data={this.props.patterns.data}
            {...this.props.tableOptions}
          >
            <TableHeaderColumn dataSort dataField='pattern_id' isKey={true} hidden={true} />
            <TableHeaderColumn dataSort dataField='name'>Name</TableHeaderColumn>
            <TableHeaderColumn dataSort dataField='trip_count'># of Trips</TableHeaderColumn>
            <TableHeaderColumn dataSort dataField='stop_count'># of Stops</TableHeaderColumn>
            <TableHeaderColumn
              dataFormat={(cell, row) => {
                return (
                  <Button
                    bsStyle="primary"
                    bsSize="small"
                    onClick={() => { self.props.viewStops(row) }}
                  >
                    View Stops
                  </Button>
                )
              }}>
                Stops
            </TableHeaderColumn>
          </BootstrapTable>
        }
      </div>
    )
  }
}
