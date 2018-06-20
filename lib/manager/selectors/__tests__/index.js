// @flow

import clone from 'lodash/cloneDeep'

import {getActiveProject, getRouteData, getTimetableData} from '../'

import {mockInitialState} from '../../../mock-data'

describe('manager > selectors >', () => {
  describe('getActiveProject', () => {
    it('should get the project', () => {
      const mockProject = {
        id: '1'
      }
      const mockState = {
        projects: {
          active: mockProject.id,
          all: [mockProject]
        }
      }
      expect(getActiveProject(mockState)).toMatchSnapshot()
    })
  })

  // WARNING: these are unit tests where the output of the function being tested
  // is very dependent on downstream implementation
  describe('getTimetableData', () => {
    const mockTimetableData = {
      feed: {
        patterns: [
          {
            stops: [
              {stop_id: '15', stop_name: 'TECHNOLOGY & METRO'},
              {stop_id: '14', stop_name: '1ST & METRO @ LR STATION'}
            ],
            trips: [
              {
                direction_id: 1,
                pattern_id: '248',
                service_id: 'Weekdays',
                stop_times: [
                  {
                    arrival_time: 23580,
                    departure_time: 23580,
                    stop_id: '14',
                    stop_sequence: 1,
                    timepoint: null
                  },
                  {
                    arrival_time: null,
                    departure_time: null,
                    stop_id: '15',
                    stop_sequence: 2,
                    timepoint: null
                  }
                ],
                trip_headsign: '10 SANTA CLARA CALTRAIN VIA AIRPORT',
                trip_id: '2369269',
                trip_short_name: null
              },
              {
                direction_id: 1,
                pattern_id: '248',
                service_id: 'Weekdays',
                stop_times: [
                  {
                    arrival_time: 28980,
                    departure_time: 28980,
                    stop_id: '14',
                    stop_sequence: 1,
                    timepoint: null
                  },
                  {
                    arrival_time: null,
                    departure_time: null,
                    stop_id: '15',
                    stop_sequence: 2,
                    timepoint: null
                  }
                ],
                trip_headsign: '10 SANTA CLARA CALTRAIN VIA AIRPORT',
                trip_id: '2369292',
                trip_short_name: null
              }
            ]
          }
        ]
      }
    }

    it('should get the data when no data is fetched', () => {
      expect(getTimetableData(mockInitialState)).toMatchSnapshot()
    })

    it('should get the data when data is available', () => {
      const mockState = clone(mockInitialState)
      mockState.gtfs.timetables.data = mockTimetableData
      expect(getTimetableData(mockState)).toMatchSnapshot()
    })

    it('should get the data when data is available and timepoint filter is set', () => {
      const mockState = clone(mockInitialState)
      mockState.gtfs.filter.timepointFilter = true
      mockState.gtfs.timetables.data = mockTimetableData
      expect(getTimetableData(mockState)).toMatchSnapshot()
    })

    it('should get the data when data is available and show arrivals filter is set', () => {
      const mockState = clone(mockInitialState)
      mockState.gtfs.filter.showArrivals = true
      mockState.gtfs.timetables.data = mockTimetableData
      expect(getTimetableData(mockState)).toMatchSnapshot()
    })
  })

  // WARNING: these are unit tests where the output of the function being tested
  // is very dependent on downstream implementation
  describe('getRouteDetailsData', () => {
    it('should output blank array when no route data exists', () => {
      expect(getRouteData(mockInitialState)).toMatchSnapshot()
    })

    it('should output data when route data exists', () => {
      const mockState = clone(mockInitialState)
      mockState.gtfs.routes.routeDetails.data = {
        numRoutes: 1,
        routes: [
          {
            route_id: '10',
            route_short_name: '10',
            route_long_name: 'SANTA CLARA TRANSIT- METRO AIRPORT',
            route_desc: null,
            stops: [
              {
                stop_id: '20'
              },
              {
                stop_id: '5228'
              }
            ],
            trips: [
              {
                pattern_id: '284',
                stop_times: [
                  {
                    arrival_time: 23820,
                    departure_time: 23820
                  }
                ]
              }
            ]
          }
        ]
      }

      expect(getRouteData(mockState)).toMatchSnapshot()
    })
  })
})
