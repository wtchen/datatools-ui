// @flow

import Pure from '@conveyal/woonerf/components/pure'
import React, { Component } from 'react'
import {
  Alert,
  Button,
  Col,
  ListGroup,
  ListGroupItem,
  Row
} from 'react-bootstrap'
import Select from 'react-select'

import ActiveDateTimeFilter from '../containers/ActiveDateTimeFilter'
import Loading from '../../../../common/components/Loading'
import TripsPerHourChart from './TripsPerHourChart'

import type {Route} from '../../../../gtfs/reducers/routes'
import type {PatternRowData} from '../../../selectors'

type FetchStatus = {
  fetched: boolean,
  fetching: boolean,
  error: boolean
}

type BaseGtfsEntity = {
  fetchStatus: FetchStatus
}

type Props = {
  onComponentMount: (Props) => void,
  fetchStatus: FetchStatus,
  patternDateTimeFilterChange: () => void,
  patternData: Array<PatternRowData>,
  routeFilter: ?string,
  routeFilterChange: (string) => void,
  routes: BaseGtfsEntity & {
    data: null | Array<Route>
  },
  version: any,
  viewStops: (?string) => void,
  viewTrips: (?string) => void
}

export default class PatternLayout extends Component<Props> {
  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  render () {
    const {
      fetchStatus: {
        error,
        fetched,
        fetching
      },
      patternData,
      patternDateTimeFilterChange,
      routeFilter,
      routeFilterChange,
      routes,
      version,
      viewStops,
      viewTrips
    } = this.props

    const maxTripsPerHourAllPatterns = fetched
      ? patternData.reduce(
        (accumulator, currentPattern) => {
          return Math.max(accumulator, ...currentPattern.tripsPerHour)
        },
        0
      )
      : 0

    return (
      <div>
        {routes.fetchStatus.fetched &&
          <div>
            <Row>
              <Col xs={12} md={6} style={{padding: '20px'}}>
                <label htmlFor='route_name'>Filtering Patterns for Route:</label>
                <Select
                  id='route_name'
                  options={routes.data}
                  labelKey={'route_name'}
                  valueKey={'route_id'}
                  placeholder={'Select a Route'}
                  value={routeFilter}
                  onChange={routeFilterChange} />
              </Col>
            </Row>
            <ActiveDateTimeFilter
              onChange={patternDateTimeFilterChange}
              version={version} />
          </div>
        }

        {fetching &&
          <Loading />
        }

        {error &&
          <Alert bsStyle='danger'>
            An error occurred while trying to fetch the data
          </Alert>
        }

        {fetched &&
          <Row style={{marginTop: 20}}>
            <Col xs={12}>
              <ListGroup className='route-list'>
                {patternData.map((pattern, index) => (
                  <PatternRow
                    key={index}
                    {...pattern}
                    maxTripsPerHourAllPatterns={maxTripsPerHourAllPatterns}
                    viewStops={viewStops}
                    viewTrips={viewTrips}
                    />
                ))}
              </ListGroup>
            </Col>
          </Row>
        }
      </div>
    )
  }
}

class PatternRow extends Pure {
  props: PatternRowData & {
    maxTripsPerHourAllPatterns: number,
    viewStops: (?string) => void,
    viewTrips: (?string) => void
  }

  _onStopsClick = () => {
    this.props.viewStops(this.props.patternId)
  }

  _onTripsClick = () => {
    this.props.viewTrips(this.props.patternId)
  }

  render () {
    const {
      maxTripsPerHourAllPatterns,
      numStops,
      numTrips,
      patternName,
      tripsPerHour
    } = this.props

    return (
      <ListGroupItem>
        <Row>
          <Col xs={12}>
            <h3>{patternName}</h3>
          </Col>
          <Col xs={12} md={6}>
            <TripsPerHourChart
              maxTripsPerHour={maxTripsPerHourAllPatterns}
              tripsPerHour={tripsPerHour}
              />
          </Col>
          <Col xs={12} md={3} style={{marginTop: 50}}>
            <Button onClick={this._onStopsClick}>
              <h4>{numStops} Stops</h4>
            </Button>
          </Col>
          <Col xs={12} md={3} style={{marginTop: 50}}>
            <Button onClick={this._onTripsClick}>
              <h4>{numTrips} Trips</h4>
            </Button>
          </Col>
        </Row>
      </ListGroupItem>
    )
  }
}
