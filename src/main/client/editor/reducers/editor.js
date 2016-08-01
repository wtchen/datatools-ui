import update from 'react-addons-update'
import polyUtil from 'polyline-encoded'
import { getControlPoints } from '../util/gtfs'

const mapStop = (s) => {
  return {
    // datatools props
    id: s.id,
    feedId: s.feedId,
    bikeParking: s.bikeParking,
    carParking: s.carParking,
    pickupType: s.pickupType,
    dropOffType: s.dropOffType,

    // gtfs spec props
    stop_code: s.stopCode,
    stop_name: s.stopName,
    stop_desc: s.stopDesc,
    stop_lat: s.lat,
    stop_lon: s.lon,
    zone_id: s.zoneId,
    stop_url: s.stopUrl,
    location_type: s.locationType,
    parent_station: s.parentStation,
    stop_timezone: s.stopTimezone,
    wheelchair_boarding: s.wheelchairBoarding,
    stop_id: s.gtfsStopId
  }
}
const defaultState = {
  feedSourceId: null,
  active: {},
  editSettings: {
    editGeometry: false,
    followStreets: true,
    snapToStops: true,
    addStops: false,
    hideStops: false,
    controlPoints: [],
    coordinatesHistory: [],
    actions: []
  },
  mapState: {
    zoom: null,
    bounds: null
  },
  tableData: {},
  validation: null
}
const editor = (state = defaultState, action) => {
  let stateUpdate, newTableData, fields, rowData, mappedEntities, activeEntity, activeSubEntity, newState, routeIndex, agencyIndex, fareIndex, calendarIndex, scheduleExceptionIndex, controlPoints, coordinates
  switch (action.type) {
    case 'REQUESTING_FEED_INFO':
      if (state.feedSourceId && action.feedId !== state.feedSourceId) {
        return defaultState
      }
      return state
    case 'UPDATE_MAP_SETTING':
      return update(state, {
        mapState: {
          [action.setting]: {$set: action.value}
        }
      })
    case 'TOGGLE_EDIT_SETTING':
      if (action.setting === 'editGeometry' && !state.editSettings.editGeometry) {
        controlPoints = getControlPoints(state.active.subEntity, state.editSettings.snapToStops)
        return update(state, {
          editSettings: {
            [action.setting]: {$set: !state.editSettings[action.setting]},
            controlPoints: {$set: [controlPoints]}
          }
        })
      } else {
        return update(state, {
          editSettings: {
            [action.setting]: {$set: !state.editSettings[action.setting]}
          }
        })
      }
    case 'UNDO_TRIP_PATTERN_EDITS':
      patternIndex = state.active.entity.tripPatterns.findIndex(p => p.id === state.active.subEntityId)
      let lastActionIndex = state.editSettings.actions.length - 1
      let lastActionType = state.editSettings.actions[lastActionIndex]
      let lastCoordinatesIndex = state.editSettings.coordinatesHistory.length - 1
      let lastControlPointsIndex = state.editSettings.controlPoints.length - 1
      stateUpdate = {
        editSettings: {
          // coordinatesHistory: {$splice: [[lastEditIndex, 1]]},
          // controlPoints: {$splice: [[lastEditIndex, 1]]},
          actions: {$splice: [[lastActionIndex, 1]]}
        }
      }
      switch (lastActionType) {
        case 'ADD_CONTROL_POINT':
          stateUpdate.editSettings.controlPoints = {$splice: [[lastControlPointsIndex, 1]]}
          break
        case 'UPDATE_CONTROL_POINT':
          stateUpdate.editSettings.controlPoints = {$splice: [[lastControlPointsIndex, 1]]}
          stateUpdate.editSettings.coordinatesHistory = {$splice: [[lastCoordinatesIndex, 1]]}
          coordinates = state.editSettings.coordinatesHistory[lastCoordinatesIndex]
          if (coordinates) {
            stateUpdate.active = {
              entity: {tripPatterns: {[patternIndex]: {shape: {coordinates: {$set: coordinates}}}}}
            }
          }
          break
        case 'REMOVE_CONTROL_POINT':
          stateUpdate.editSettings.controlPoints = {$splice: [[lastControlPointsIndex, 1]]}
          stateUpdate.editSettings.coordinatesHistory = {$splice: [[lastCoordinatesIndex, 1]]}
          coordinates = state.editSettings.coordinatesHistory[lastCoordinatesIndex]
          if (coordinates) {
            stateUpdate.active = {
              entity: {tripPatterns: {[patternIndex]: {shape: {coordinates: {$set: coordinates}}}}}
            }
          }
          break
      }
      return update(state, stateUpdate)
    case 'ADD_CONTROL_POINT':
      controlPoints = [...state.editSettings.controlPoints[state.editSettings.controlPoints.length - 1]]
      controlPoints.splice(action.index, 0, action.controlPoint)
      return update(state, {
        editSettings: {
          controlPoints: {$push: [controlPoints]},
          actions: {$push: [action.type]}
        }
      })
    case 'REMOVE_CONTROL_POINT':
      controlPoints = [...state.editSettings.controlPoints[state.editSettings.controlPoints.length - 1]]
      controlPoints.splice(action.index, 1)
      return update(state, {
        editSettings: {
          controlPoints: {$push: [controlPoints]},
          actions: {$push: [action.type]}
        }
      })
    case 'UPDATE_CONTROL_POINT':
      let newControlPoints = []
      controlPoints = state.editSettings.controlPoints[state.editSettings.controlPoints.length - 1]
      for (var i = 0; i < controlPoints.length; i++) {
        newControlPoints.push(Object.assign({}, controlPoints[i]))
      }
      console.log(newControlPoints[action.index].distance)
      let newest = update(newControlPoints, {[action.index]: {point: {$set: action.point}, distance: {$set: action.distance}}})
      console.log(newest[action.index].distance)
      return update(state, {
        editSettings: {
          controlPoints: {$push: [newest]},
          actions: {$push: [action.type]}
        }
      })
    case 'CREATE_GTFS_ENTITY':
      if (action.component === 'trippattern') {
        activeEntity = {
          isCreating: true,
          name: '',
          id: 'new',
          feedId: action.feedSourceId,
          ...action.props
        }
        routeIndex = state.tableData.route.findIndex(r => r.id === action.props.routeId)
        return update(newState || state, {
          tableData: {route: {[routeIndex]: {tripPatterns: {$unshift: [activeEntity]}}}},
          active: {
            entity: {tripPatterns: {$unshift: [activeEntity]}},
            // edited: {$set: typeof action.props !== 'undefined'}
          }
        })
      }
      else {
        activeEntity = {
          isCreating: true,
          name: '',
          id: 'new',
          feedId: action.feedSourceId,
          ...action.props
        }
        // if tableData's component array is undefined, add it
        if(!state.tableData[action.component]) {
          console.log('adding new '+action.component+' array');
          newState = update(state, {
            tableData: {[action.component]: {$set: []}}
          })
        }
        return update(newState || state, {
          tableData: {[action.component]: {$unshift: [activeEntity]}},
          // active: {
          //   entity: {$set: activeEntity},
          //   edited: {$set: typeof action.props !== 'undefined'}
          // }
        })
      }
    case 'SETTING_ACTIVE_GTFS_ENTITY':
      activeEntity = action.component === 'feedinfo'
        ? Object.assign({}, state.tableData[action.component])
        : state.tableData[action.component] && action.entityId
        ? Object.assign({}, state.tableData[action.component].find(e => e.id === action.entityId))
        : null
      switch (action.subComponent) {
        case 'trippattern':
          activeSubEntity = activeEntity && activeEntity.tripPatterns ? Object.assign({}, activeEntity.tripPatterns.find(p => p.id === action.subEntityId)) : null
          controlPoints = getControlPoints(activeSubEntity, state.editSettings.snapToStops)
          coordinates = activeSubEntity && activeSubEntity.shape && activeSubEntity.shape.coordinates
          break
      }
      let active = {
        feedSourceId: action.feedSourceId,
        entity: activeEntity,
        entityId: action.entityId,
        subEntity: activeSubEntity,
        subEntityId: action.subEntityId,
        component: action.component,
        subComponent: action.subComponent,
        subSubComponent: action.subSubComponent,
        edited: activeEntity && activeEntity.id === 'new',
      }
      stateUpdate = {
        editSettings: {
          controlPoints: {$set: controlPoints},
        },
        active: {$set: active},
      }
      if (coordinates) {
        stateUpdate.coordinatesHistory = {$set: [coordinates]}
      }
      return update(state, stateUpdate)
    case 'RESET_ACTIVE_GTFS_ENTITY':
      switch (action.component) {
        case 'trippattern':
          routeIndex = state.tableData.route.findIndex(r => r.id === action.entity.routeId)
          // activeEntity = Object.assign({}, state.tableData.route[routeIndex])
          patternIndex = state.tableData.route[routeIndex].tripPatterns.findIndex(p => p.id === action.entity.id)
          activeEntity = Object.assign({}, state.tableData.route[routeIndex].tripPatterns[patternIndex])
          return update(state, {
            active: {
              entity: {tripPatterns: {[patternIndex]: {$set: activeEntity}}},
              edited: {$set: false}
            },
          })
        case 'feedinfo':
          activeEntity = Object.assign({}, state.tableData[action.component])
          return update(state, {
            active: {
              entity: {$set: activeEntity},
              edited: {$set: false}
            },
          })
        default:
          activeEntity = state.tableData[action.component].find(e => e.id === action.entity.id)
          return update(state, {
            active: {
              entity: {$set: activeEntity},
              edited: {$set: false}
            },
          })
      }
    case 'UPDATE_ACTIVE_GTFS_ENTITY':
      switch (action.component) {
        case 'trippattern':
          patternIndex = state.active.entity.tripPatterns.findIndex(p => p.id === action.entity.id)
          activeEntity = Object.assign({}, state.active.entity.tripPatterns[patternIndex])
          for (var key in action.props) {
            console.log(key, action.props[key])
            activeEntity[key] = action.props[key]

          }
          console.log(activeEntity)
          stateUpdate = {
            active: {
              entity: {tripPatterns: {[patternIndex]: {$set: activeEntity}}},
              edited: {$set: true}
            },
          }
          if (action.props && 'shape' in action.props) {
            // add previous coordinates to history
            // stateUpdate.editSettings = {coordinatesHistory: {$push: [action.props.shape.coordinates]}}
            coordinates = state.active.entity.tripPatterns[patternIndex].shape && state.active.entity.tripPatterns[patternIndex].shape.coordinates
            if (coordinates)
              stateUpdate.editSettings = {coordinatesHistory: {$push: [state.active.entity.tripPatterns[patternIndex].shape.coordinates]}}
          }
          return update(state, stateUpdate)
        // case 'feedinfo':
          // activeEntity = Object.assign({}, state.active.entity)
        // case 'timetable':
        //   activeEntity = Object.assign({}, state.active.entity)
        //   patternIndex = activeEntity.tripPatterns.findIndex(p => p.id === action.entity.id)
        //   for (var key in action.props) {
        //     activeEntity.tripPatterns[patternIndex][key] = action.props[key]
        //   }
        //   return update(state, {
        //     active: {entity: {$set: activeEntity}},
        //     edited: {$set: true}
        //   })
        default:
          activeEntity = Object.assign({}, state.active.entity)
          for (var key in action.props) {
            activeEntity[key] = action.props[key]
          }
          return update(state, {
            active: {
              entity: {$set: activeEntity},
              edited: {$set: true}
            },
          })
      }
    case 'RECEIVE_AGENCIES':
      const agencies = action.agencies.map(ent => {
        return {
          // datatools props
          id: ent.id,
          feedId: ent.feedId,

          // gtfs spec props
          agency_id: ent.gtfsAgencyId,
          agency_name: ent.name,
          agency_url: ent.url,
          agency_timezone: ent.timezone,
          agency_lang: ent.lang,
          agency_phone: ent.phone,
          agency_fare_url: ent.fare_url,
          agency_email: ent.email,
        }
      })
      agencyIndex = state.active.entity && action.agencies.findIndex(a => a.id === state.active.entity.id)
      if (agencyIndex !== -1) {
        return update(state, {
          tableData: {agency: {$set: agencies}},
          active: {
            entity: {$set: agencies[agencyIndex]},
            edited: {$set: false}
          }
        })
      } else {
        return update(state, {
          tableData: {agency: {$set: agencies}}
        })
      }
    case 'RECEIVE_FARES':
      const fares = action.fares.map(fare => {
        return {
          // datatools props
          id: fare.id,
          feedId: fare.feedId,
          description: fare.description,
          fareRules: fare.fareRules,

          // gtfs spec props
          fare_id: fare.gtfsFareId,
          price: fare.price,
          currency_type: fare.currencyType,
          payment_method: fare.paymentMethod,
          transfers: fare.transfers,
          transfer_duration: fare.transferDuration,
        }
      })
      fareIndex = state.active.entity && action.fares.findIndex(f => f.id === state.active.entity.id)
      if (fareIndex !== -1) {
        return update(state, {
          tableData: {fare: {$set: fares}},
          active: {
            entity: {$set: fares[fareIndex]},
            edited: {$set: false}
          }
        })
      } else {
        return update(state, {
          tableData: {fare: {$set: fares}}
        })
      }
    case 'RECEIVE_FEED_INFO':
      if (!action.feedInfo) return state
      const feedInfo = {
        // datatools props
        id: action.feedInfo.id,
        color: action.feedInfo.color,
        defaultLat: action.feedInfo.defaultLat,
        defaultLon: action.feedInfo.defaultLon,
        defaultRouteType: action.feedInfo.defaultRouteType,

        // gtfs spec props
        feed_end_date: action.feedInfo.feedEndDate,
        feed_start_date: action.feedInfo.feedStartDate,
        feed_lang: action.feedInfo.feedLang,
        feed_publisher_name: action.feedInfo.feedPublisherName,
        feed_publisher_url: action.feedInfo.feedPublisherUrl,
        feed_version: action.feedInfo.feedVersion,
      }
      if (state.active.component === 'feedinfo') {
        return update(state, {
          tableData: {feedinfo: {$set: feedInfo}},
          active: {
            entity: {$set: feedInfo},
            edited: {$set: false}
          }
        })
      } else {
        return update(state, {
          tableData: {feedinfo: {$set: feedInfo}}
        })
      }
    case 'RECEIVE_CALENDARS':
      const calendars = action.calendars ? action.calendars.map(c => {
        return {
          // datatools props
          id: c.id,
          feedId: c.feedId,
          description: c.description,

          // gtfs spec props
          service_id: c.gtfsServiceId,
          monday: c.monday ? 1 : 0,
          tuesday: c.tuesday ? 1 : 0,
          wednesday: c.wednesday ? 1 : 0,
          thursday: c.thursday ? 1 : 0,
          friday: c.friday ? 1 : 0,
          saturday: c.saturday ? 1 : 0,
          sunday: c.sunday ? 1 : 0,
          start_date: c.startDate,
          end_date: c.endDate,
        }
      }) : null
      calendarIndex = state.active.entity && action.calendars.findIndex(c => c.id === state.active.entity.id)
      if (calendarIndex !== -1) {
        return update(state, {
          tableData: {calendar: {$set: calendars}},
          active: {
            entity: {$set: calendars[calendarIndex]},
            edited: {$set: false}
          }
        })
      } else {
        return update(state, {
          tableData: {calendar: {$set: calendars}}
        })
      }
    case 'RECEIVE_SCHEDULE_EXCEPTIONS':
      const scheduleExceptions = action.scheduleExceptions ? action.scheduleExceptions.map(se => {
        return {
          // datatools props
          id: se.id,
          name: se.name,
          feedId: se.feedId,
          exemplar: se.exemplar,
          dates: se.dates,
          customSchedule: se.customSchedule,

          // gtfs spec props
          // gtfs_prop: se.gtfs_prop
        }
      }) : []
      scheduleExceptionIndex = state.active.entity && action.scheduleExceptions.findIndex(se => se.id === state.active.entity.id)
      if (scheduleExceptionIndex !== -1) {
        return update(state, {
          tableData: {scheduleexception: {$set: scheduleExceptions}},
          active: {
            entity: {$set: scheduleExceptions[scheduleExceptionIndex]},
            edited: {$set: false}
          }
        })
      } else {
        return update(state, {
          tableData: {scheduleexception: {$set: scheduleExceptions}}
        })
      }
    case 'RECEIVE_ROUTES':
      // feedTableData = state.tableData[action.feedId]
      // if (!feedTableData)
      //   feedTableData = {}
      const routes = action.routes ? action.routes.map(r => {
        return {
          // datatools props
          id: r.id,
          feedId: r.feedId,
          routeBrandingUrl: r.routeBrandingUrl,

          // gtfs spec props
          agency_id: r.agencyId,
          route_short_name: r.routeShortName,
          route_long_name: r.routeLongName,
          route_desc: r.routeDesc,
          route_type: r.gtfsRouteType,
          route_url: r.routeUrl,
          route_color: r.routeColor,
          route_text_color: r.routeTextColor,
          route_id: r.gtfsRouteId
        }
      }) : []
      // feedTableData.route = routes
      routeIndex = state.active.entity && action.routes.findIndex(r => r.id === state.active.entity.id)
      if (routeIndex !== -1) {
        let followStreets = routes[routeIndex] ? routes[routeIndex].route_type === 3 || routes[routeIndex].route_type === 0 : true
        return update(state, {
          tableData: {route: {$set: routes}},
          active: {
            entity: {$set: routes[routeIndex]},
            edited: {$set: false}
          },
          editSettings: {
            followStreets: {$set: followStreets}
          }
        })
      } else {
        return update(state, {
          tableData: {route: {$set: routes}}
        })
      }
    case 'RECEIVE_TRIP_PATTERNS':
      return update(state, {
        tripPatterns: {$set:
          Object.keys(action.tripPatterns).map(key => {
            return {
              id: key,
              latLngs: action.tripPatterns[key].shape ? polyUtil.decode(action.tripPatterns[key].shape) : null
            }
          })
        }
      })
    case 'RECEIVE_TRIP_PATTERNS_FOR_ROUTE':
      routeIndex = state.tableData.route.findIndex(r => r.id === action.routeId)
      let activePattern = state.active.subEntityId && action.tripPatterns.find(p => p.id === state.active.subEntityId)
      if (routeIndex === -1) {
        return state
      }
      // set controlPoints initially and then whenever isSnappingToStops changes
      if (activePattern) {
        controlPoints = getControlPoints(activePattern, state.editSettings.snapToStops)
      }
      else {
        controlPoints = []
      }
      if (state.active.entity.id === action.routeId) {
        return update(state, {
          tableData: {route: {[routeIndex]: {$merge: {tripPatterns: action.tripPatterns}}}},
          active: {
            entity: {$merge: {tripPatterns: action.tripPatterns}},
            subEntity: {$set: Object.assign({}, activePattern)}
          },
          editSettings: {controlPoints: {$set: [controlPoints]}}
        })
      } else {
        return update(state, {
          tableData: {route: {[routeIndex]: {$merge: {tripPatterns: action.tripPatterns}}}}
        })
      }
    case 'RECEIVE_TRIPS_FOR_CALENDAR':
      routeIndex = state.tableData.route.findIndex(r => r.id === action.pattern.routeId)
      let patternIndex = state.tableData.route[routeIndex].tripPatterns.findIndex(p => p.id === action.pattern.id)
      if (state.active.entity.id === action.pattern.routeId) {
        return update(state, {
          tableData: {route: {[routeIndex]: {tripPatterns: {[patternIndex]: {$merge: {[action.calendarId]: action.trips}}}}}},
          active: {entity: {tripPatterns: {[patternIndex]: {$merge: {[action.calendarId]: action.trips}}}}}
        })
      }
      else {
        return update(state, {
          tableData: {route: {[routeIndex]: {tripPatterns: {[patternIndex]: {$merge: {[action.calendarId]: action.trips}}}}}},
        })
      }
    case 'RECEIVE_STOPS':
      const stops = action.stops ? action.stops.map(mapStop) : []

      stopIndex = state.active.entity && action.stops.findIndex(s => s.id === state.active.entity.id)
      if (stopIndex !== -1) {
        return update(state, {
          tableData: {stop: {$set: stops}},
          active: {
            entity: {$set: stops[stopIndex]},
            edited: {$set: false}
          }
        })
      } else {
        return update(state, {
          tableData: {stop: {$set: stops}}
        })
      }
    case 'RECEIVE_STOP':
      const stop = mapStop(action.stop)
      console.log(stop)
      let stopIndex = state.tableData.stop.findIndex(s => s.id === stop.id)

      // if stop is active, update active entity
      if (stop.id === state.active.entityId && stopIndex !== -1) {
        stateUpdate = {
          tableData: {stop: {[stopIndex]: {$merge: stop}}},
          active: {entity: {$set: stop}},
          edited: {$set: false},
        }
      }
      else if (stopIndex === -1) {
        stateUpdate = {
          tableData: {stop: {$unshift: [stop]}},
          edited: {$set: false},
        }
      }
      else {
        stateUpdate = {
          tableData: {stop: {[stopIndex]: {$merge: stop}}},
          edited: {$set: false},
        }
      }
      return update(state, stateUpdate)
    case 'CLEAR_GTFSEDITOR_CONTENT':
      return defaultState
    case 'RECEIVE_GTFSEDITOR_TABLE':
      newTableData = {}
      const getMappedEntities = (entities) => {
        switch (action.tableId) {
          case 'agency':
            return action.entities.map(ent => {
              return {
                id: ent.id,
                feedId: ent.feedId,
                agency_id: ent.gtfsAgencyId,
                agency_name: ent.name,
                agency_url: ent.url,
                agency_timezone: ent.timezone,
                agency_lang: ent.lang,
                agency_phone: ent.phone,
                agency_fare_url: ent.fare_url,
                agency_email: ent.email,
              }
            })
          case 'route':
            mappedEntities = action.entities.map(ent => {
              return {
                id: ent.id,
                feedId: ent.feedId,
                agency_id: ent.agencyId,
                route_short_name: ent.routeShortName,
                route_long_name: ent.routeLongName,
                route_desc: ent.routeDesc,
                route_type: ent.routeTypeId,
                route_url: ent.routeUrl,
                route_color: ent.routeColor,
                route_text_color: ent.routeTextColor,
                route_id: ent.gtfsRouteId
              }
            })
            return mappedEntities
          case 'stop':
            return action.entities.map(mapStop)
          case 'calendar':
            return action.entities.map(ent => {
              return {
                service_id: ent.gtfsServiceId,
                monday: ent.monday,
                tuesday: ent.tuesday,
                wednesday: ent.wednesday,
                thursday: ent.thursday,
                friday: ent.friday,
                saturday: ent.saturday,
                sunday: ent.sunday,
                start_date: ent.startDate,
                end_date: ent.endDate,
                description: ent.description,
                routes: ent.routes,
                id: ent.id,
                feedId: ent.feedId,
                numberOfTrips: ent.numberOfTrips
              }
            })
          case 'fare':
            return action.entities.map(ent => {
              return ent
              // return {
              //   id: ent.id,
              //   stop_id: ent.gtfsStopId,
              //   stop_code: ent.stopCode,
              //   stop_name: ent.stopName,
              //   stop_desc: ent.stopDesc,
              //   stop_lat: ent.lat,
              //   stop_lon: ent.lon,
              //   zone_id: ent.zoneId,
              //   stop_url: ent.stopUrl,
              //   location_type: ent.locationType,
              //   parent_station: ent.parentStation,
              //   stop_timezone: ent.stopTimezone,
              //   wheelchair_boarding: ent.wheelchairBoarding,
              //   bikeParking: ent.bikeParking,
              //   carParking: ent.carParking,
              //   pickupType: ent.pickupType,
              //   dropOffType: ent.dropOffType,
              // }
            })
          default:
            return action.entities
        }
      }

      newTableData[action.tableId] = getMappedEntities(action.entities)

      return update(state, {
        tableData: {$merge: newTableData}
      })
    case 'RECEIVE_GTFSEDITOR_CONTENT':
      newTableData = {}
      for(let i = 0; i < action.filenames.length; i++) {
        const lines = action.fileContent[i].split('\n')
        if(lines.length < 2) continue
        fields = lines[0].split(',')
        newTableData[action.filenames[i].split('.')[0]] = lines.slice(1)
          .filter(line => line.split(',').length === fields.length)
          .map((line, rowIndex) => {
            const values = line.split(',')
            rowData = { origRowIndex: rowIndex }
            for(let f = 0; f < fields.length; f++) {
              rowData[fields[f]] = values[f]
            }
            return rowData
          })
      }
      return update(state, {
        feedSourceId: {$set: action.feedSourceId},
        tableData: {$set: newTableData}
      })

    case 'ADD_GTFSEDITOR_ROW':
      // create this table if it doesn already exist
      if(!(action.tableId in state.tableData)) {
        return update(state,
          {tableData:
            {$merge: {[action.tableId]: [action.rowData]} }
          }
        )
      }
      // otherwise, add it to the exising table
      return update(state,
        {tableData:
          {[action.tableId]:
            {$push: [action.rowData]}
          }
        }
      )

    case 'UPDATE_GTFSEDITOR_FIELD':
      return update(state,
        {tableData:
          {[action.tableId]:
            {[action.rowIndex]:
              {[action.fieldName]:
                {$set: action.newValue}
              }
            }
          }
        }
      )

    case 'DELETE_GTFSEDITOR_ROW':
      const table = state.tableData[action.tableId]
      const newTable = [
        ...table.slice(0, action.rowIndex),
        ...table.slice(action.rowIndex + 1)
      ]
      return update(state,
        {tableData:
          {[action.tableId]:
            {$set: newTable}
          }
        }
      )

    case 'RECEIVE_GTFS_ENTITIES':
      const getType = function (entity) {
        if (entity.hasOwnProperty('route_id')) return 'route'
        if (entity.hasOwnProperty('stop_id')) return 'stop'
      }

      const newLookupEntries = {}
      for(const entity of action.gtfsEntities) {
        const type = getType(entity)
        const key = type + '_' + entity[type+'_id']
        newLookupEntries[key] = entity
      }

      return update(state,
        {gtfsEntityLookup:
          {$merge: newLookupEntries}
        }
      )

    case 'RECEIVE_GTFSEDITOR_VALIDATION':
      const validationTable = {}
      for(const issue of action.validationIssues) {
        if(!(issue.tableId in validationTable)) {
          validationTable[issue.tableId] = []
        }
        validationTable[issue.tableId].push(issue)
      }
      return update(state,
        {validation:
          {$set: validationTable}
        }
      )

    default:
      return state
  }
}

export default editor
