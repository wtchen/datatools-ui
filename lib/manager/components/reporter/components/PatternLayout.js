import React, { Component, PropTypes } from 'react'
import { Row, Col, Alert, Button } from 'react-bootstrap'
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table'
import Select from 'react-select'
import clone from 'clone'

import { formatHeadway, formatSpeed } from '../../../../gtfs/util/stats'
import ActiveDateTimeFilter from '../containers/ActiveDateTimeFilter'
import Loading from '../../../../common/components/Loading'

export default class PatternLayout extends Component {
  static propTypes = {
    onComponentMount: PropTypes.func,
    patternRouteFilterChange: PropTypes.func,
    patternDateTimeFilterChange: PropTypes.func,

    version: PropTypes.object,
    routes: PropTypes.object,
    patterns: PropTypes.object,
    tableOptions: PropTypes.object
  }
  componentWillMount () {
    this.props.onComponentMount(this.props)
  }
  render () {
    const self = this
    const rows = this.props.patterns.data.map(p => {
      const flat = clone(p)
      if (p.stats) {
        delete flat.stats
        for (const key in p.stats) {
          flat[key] = p.stats[key]
        }
      }
      return flat
    })
    return (
      <div>

        {this.props.routes.fetchStatus.fetched &&
          <div>
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
            <ActiveDateTimeFilter
              onChange={this.props.patternDateTimeFilterChange}
              version={this.props.version}
            />
          </div>
        }

        {this.props.patterns.fetchStatus.fetching &&
          <Loading />
        }

        {this.props.patterns.fetchStatus.error &&
          <Alert bsStyle='danger'>
            An error occurred while trying to fetch the data
          </Alert>
        }

        {this.props.patterns.fetchStatus.fetched &&
          <BootstrapTable
            data={rows}
            {...this.props.tableOptions}
          >
            <TableHeaderColumn columnTitle dataSort dataField='pattern_id' isKey hidden />
            <TableHeaderColumn columnTitle dataSort dataField='name'>Name</TableHeaderColumn>
            <TableHeaderColumn columnTitle dataSort dataField='trip_count'># of Trips</TableHeaderColumn>
            <TableHeaderColumn columnTitle dataSort dataField='stop_count'># of Stops</TableHeaderColumn>
            <TableHeaderColumn columnTitle dataSort dataFormat={formatHeadway} dataField='headway'>Headway</TableHeaderColumn>
            <TableHeaderColumn columnTitle dataSort dataFormat={formatSpeed} dataField='avgSpeed'>Avg. Speed</TableHeaderColumn>
            <TableHeaderColumn
              dataFormat={(cell, row) => {
                return (
                  <Button
                    bsStyle='primary'
                    bsSize='small'
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
