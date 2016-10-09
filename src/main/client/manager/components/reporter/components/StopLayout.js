import React, { Component, PropTypes } from 'react'
import { Row, Col, FormControl } from 'react-bootstrap'
import Select from 'react-select'
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table'
import moment from 'moment'
import DateTimeField from 'react-bootstrap-datetimepicker'

import Loading from '../../../../common/components/Loading'

import 'rc-time-picker/assets/index.css'

const timeOptions = [
  {
    label: '24 hours',
    from: 0,
    to: 60 * 60 * 24 - 1 // 86399
  },
  {
    label: 'Morning peak',
    from: 60 * 60 * 9,
    to: 60 * 60 * 11
  },
  {
    label: 'Afternoon peak',
    from: 60 * 60 * 16,
    to: 60 * 60 * 17
  }
]

export default class StopLayout extends Component {
  static propTypes = {
    onComponentMount: PropTypes.func,
    stopRouteFilterChange: PropTypes.func,
    stopPatternFilterChange: PropTypes.func,
    stopDateTimeFilterChange: PropTypes.func,

    routes: PropTypes.object,
    patterns: PropTypes.object,
    stops: PropTypes.object,
    tableOptions: PropTypes.object,
    dateTime: PropTypes.object
  }
  render () {
    let dateTimeProps = {
      mode: 'date',
      dateTime: this.props.dateTime.date ? +moment(this.props.dateTime.date, 'YYYY-MM-DD') : +moment(),
      onChange: (millis) => {
        console.log(+millis)
        let date = moment(+millis).format('YYYY-MM-DD')
        console.log(date)
        this.props.stopDateTimeFilterChange({date})
      }
    }
    if (!this.props.dateTime.date) {
      dateTimeProps.defaultText = 'Please select a date'
    }

    return (
      <div>
        <Row>
          <Col xs={12} md={6} style={{padding: '20px'}}>
            <label>Filtering Stops for Route:</label>
            <Select
              options={this.props.routes.data}
              labelKey={'route_name'}
              valueKey={'route_id'}
              placeholder={'Select a Route'}
              value={this.props.stops.routeFilter}
              onChange={this.props.stopRouteFilterChange}
              />
          </Col>
          <Col xs={12} md={6} style={{padding: '20px'}}>
            <label>Filtering Stops for Pattern:</label>
            <Select
              options={this.props.patterns.data}
              labelKey={'name'}
              valueKey={'pattern_id'}
              placeholder={'Select a Pattern'}
              value={this.props.stops.patternFilter}
              onChange={this.props.stopPatternFilterChange}
              />
          </Col>
        </Row>
        <Row>
          <Col xs={12} md={3}>
            <DateTimeField
              {...dateTimeProps}
            />
          </Col>
          <Col md={3}>
            <FormControl
              componentClass='select'
              placeholder='Select time range'
              value={`${this.props.dateTime.from}-${this.props.dateTime.to}`}
              onChange={(evt) => {
                const fromTo = evt.target.value.split('-')
                const from = +fromTo[0]
                const to = +fromTo[1]
                this.props.stopDateTimeFilterChange({from, to})
              }}
            >
              {timeOptions.map((t, i) => {
                return <option key={i} value={`${t.from}-${t.to}`}>{t.label}</option>
              })}
            </FormControl>
          </Col>
        </Row>
        {this.props.stops.fetchStatus.fetching &&
          <Loading />
        }
        {this.props.stops.fetchStatus.fetched &&
          <BootstrapTable
            data={this.props.stops.data}
            {...this.props.tableOptions}
          >
            <TableHeaderColumn dataSort dataField='stop_id' isKey>ID</TableHeaderColumn>
            <TableHeaderColumn dataSort dataField='stop_name'>Name</TableHeaderColumn>
            <TableHeaderColumn dataSort dataField='tripCount'># of Trips</TableHeaderColumn>
            <TableHeaderColumn dataSort dataFormat={cell => cell >= 0 ? Math.round(cell / 60) : 'N/A'} dataField='headway'>Headway</TableHeaderColumn>
            {/*<TableHeaderColumn dataSort dataField='best_headway'>Best Headway</TableHeaderColumn>*/}
            {/*<TableHeaderColumn dataSort dataField='network_importance'>Network Importance</TableHeaderColumn>*/}
          </BootstrapTable>
        }
      </div>
    )
  }
}
