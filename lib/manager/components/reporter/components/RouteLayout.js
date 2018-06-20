// @flow

import React, { Component } from 'react'
import {
  Alert,
  Button,
  Col,
  ListGroup,
  ListGroupItem,
  Pagination,
  Row
} from 'react-bootstrap'

import Loading from '../../../../common/components/Loading'
import ActiveDateTimeFilter from '../containers/ActiveDateTimeFilter'

import type {RouteRowData} from '../../../selectors'

type Props = {
  onComponentMount: (boolean) => void,
  routeData: Array<RouteRowData>,
  routeDateTimeFilterChange: () => void,
  routeOffset: number,
  routeOffsetChange: (number) => void,
  fetchStatus: {
    error: String | boolean,
    fetched: boolean,
    fetching: boolean
  },
  numRoutes: number,
  tableOptions: any,
  version: any,
  viewPatterns: (any) => void
}

export default class RouteLayout extends Component<Props> {
  componentWillMount () {
    this.props.onComponentMount(this.props.fetchStatus.fetched)
  }

  _onPaginationSelect = (value: number) => {
    this.props.routeOffsetChange((value - 1) * 10)
  }

  render () {
    const {
      fetchStatus: {
        error,
        fetching,
        fetched
      },
      numRoutes,
      routeData,
      routeDateTimeFilterChange,
      routeOffset,
      version,
      viewPatterns
    } = this.props

    const maxTripsPerHourAllRoutes = fetched ? routeData.reduce(
      (accumulator, currentRoute) => {
        return Math.max(accumulator, ...currentRoute.tripsPerHour)
      },
      0
    ) : 0

    return (
      <div>

        <ActiveDateTimeFilter
          onChange={routeDateTimeFilterChange}
          version={version}
          />

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
                {routeData.map((route, index) => (
                  <RouteRow
                    key={index}
                    {...route}
                    maxTripsPerHourAllRoutes={maxTripsPerHourAllRoutes}
                    viewPatterns={viewPatterns}
                    />
                ))}
              </ListGroup>
              <Pagination
                activePage={Math.floor(routeOffset / 10) + 1}
                bsSize='large'
                ellipsis
                first
                items={Math.ceil(numRoutes / 10)}
                last
                next
                onSelect={this._onPaginationSelect}
                prev
                />
            </Col>
          </Row>
        }
      </div>
    )
  }
}

class RouteRow extends Component<RouteRowData & {
  maxTripsPerHourAllRoutes: number,
  viewPatterns: (any) => void
}> {
  render () {
    const {
      maxTripsPerHourAllRoutes,
      numPatterns,
      numStops,
      numTrips,
      routeName,
      tripsPerHour
    } = this.props
    const graphHeight = 100
    const spacing = 12
    const leftMargin = 50
    const bottomMargin = 50
    const svgWidth = leftMargin + (tripsPerHour.length * spacing)
    const svgHeight = graphHeight + bottomMargin
    const yAxisMax = Math.ceil(maxTripsPerHourAllRoutes / 10) * 10
    const yAxisPeriod = maxTripsPerHourAllRoutes > 10 ? 5 : 2
    const yAxisLabels = []
    for (var i = yAxisPeriod; i <= yAxisMax; i += yAxisPeriod) {
      yAxisLabels.push(i)
    }

    return (
      <ListGroupItem>
        <Row>
          <Col xs={12}>
            <h3>{routeName}</h3>
          </Col>
          <Col xs={12} md={6}>
            <h5>Number of trips per hour</h5>
            <div
              style={{
                width: '100%',
                height: `${svgHeight}px`,
                overflowX: 'hidden',
                overflowY: 'hidden',
                border: '#ddd'
              }}>
              <svg style={{width: svgWidth, height: `${svgHeight}px`}}>
                {yAxisLabels.map((label, index) => {
                  const y = graphHeight - ((label / yAxisMax) * graphHeight)
                  return <g key={index}>
                    <line
                      x1={0} y1={y}
                      x2={svgWidth} y2={y}
                      stroke='gray'
                      strokeWidth={1}
                    />
                    <text x={0} y={y - 2} fill='gray'>
                      {label}
                    </text>
                  </g>
                })}
                {tripsPerHour.map((numTrips, hour) => {
                  const title = `${hour}:00 - ${numTrips} trips`
                  const x = leftMargin + (spacing / 2) + (hour * spacing)

                  // generate the bar for this date
                  return (
                    <g key={hour}>
                      <title>{title}</title>
                      <line
                        x1={x} y1={graphHeight - ((numTrips / yAxisMax) * graphHeight)}
                        x2={x} y2={graphHeight}
                        title={title}
                        stroke={'#8da0cb'}
                        strokeWidth={10} />
                      {/* label x-axis with dates every 14 days */}
                      {hour % 6 === 0
                        ? <g>
                          <line x1={x} y1={graphHeight} x2={x} y2={graphHeight + 12} stroke='black' />
                          <text x={x - 35} y={graphHeight + 26} fill='black'>
                            {`${hour}:00`}
                          </text>
                        </g>
                        : null
                      }
                    </g>
                  )
                })}
                {/* Add baseline to chart */}
                <line
                  x1={0}
                  y1={graphHeight}
                  x2={svgWidth}
                  y2={graphHeight}
                  stroke='black'
                  strokeWidth={2} />
              </svg>
            </div>
          </Col>
          <Col xs={12} md={2} style={{marginTop: 50}}>
            <Button>
              <h4>{numStops} Stops</h4>
            </Button>
          </Col>
          <Col xs={12} md={2} style={{marginTop: 50}}>
            <Button>
              <h4>{numTrips} Trips</h4>
            </Button>
          </Col>
          <Col xs={12} md={2} style={{marginTop: 50}}>
            <Button>
              <h4>{numPatterns} Patterns</h4>
            </Button>
          </Col>
        </Row>
      </ListGroupItem>
    )
  }
}
