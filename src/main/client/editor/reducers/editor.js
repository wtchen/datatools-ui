import update from 'react-addons-update'
import polyUtil from 'polyline-encoded'

const mapStop = (s) => {
  return {
    id: s.id,
    feedId: s.feedId,
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
    bikeParking: s.bikeParking,
    carParking: s.carParking,
    pickupType: s.pickupType,
    dropOffType: s.dropOffType,
    stop_id: s.gtfsStopId
  }
}

const emptyTableData = { }
// let newId = 0
const editor = (state = {
  feedSourceId: null,
  activeEntityId: null,
  activeEntity: null,
  activeComponent: null,
  edited: false,
  tableData: {},
  validation: {},
  gtfsEntityLookup: {}
}, action) => {
  let newTableData, fields, rowData, mappedEntities, feedTableData, activeEntity, activeSubEntity, newState, routeIndex
  switch (action.type) {
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
        // if tripPatterns is undefined, create array
        // console.log(state.tableData.route[routeIndex])
        // if(typeof state.tableData.route[routeIndex].tripPatterns === 'undefined') {
        //   console.log('creating trip patterns array for index' + routeIndex)
        //   newState = update(state, {
        //     tableData: {route: {[routeIndex]: {tripPatterns: {$set: []}}}},
        //     activeEntity: {tripPatterns: {$set: []}}
        //   })
        // }
        return update(newState || state, {
          tableData: {route: {[routeIndex]: {tripPatterns: {$unshift: [activeEntity]}}}},
          activeEntity: {tripPatterns: {$unshift: [activeEntity]}}
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
          // activeEntity: {$set: activeEntity}
        })
      }
    case 'SETTING_ACTIVE_GTFS_ENTITY':
      activeEntity = action.component === 'feedinfo'
        ? state.tableData[action.component]
        : state.tableData[action.component]
        ? state.tableData[action.component].find(e => e.id === action.entityId)
        : null
      switch (action.subComponent) {
        case 'trippattern':
          activeSubEntity = activeEntity && activeEntity.tripPatterns ? activeEntity.tripPatterns.find(p => p.id === action.subEntityId) : null
      }

      return update(state, {
        feedSourceId: {$set: action.feedSourceId},
        activeEntity: {$set: activeEntity},
        activeEntityId: {$set: action.entityId},
        activeSubEntity: {$set: activeSubEntity},
        activeSubEntityId: {$set: action.subEntityId},
        activeComponent: {$set: action.component},
        activeSubComponent: {$set: action.subComponent},
        activeSubSubComponent: {$set: action.subSubComponent},
        edited: {$set: false},
      })
    case 'UPDATE_ACTIVE_GTFS_ENTITY':
      switch (action.component) {
        case 'trippattern':
          activeEntity = Object.assign({}, state.activeEntity)
          patternIndex = activeEntity.tripPatterns.findIndex(p => p.id === action.entity.id)
          for (var key in action.props) {
            activeEntity.tripPatterns[patternIndex][key] = action.props[key]
          }
          return update(state, {
            activeEntity: {$set: activeEntity},
            edited: {$set: true}
          })
        default:
          activeEntity = Object.assign({}, state.activeEntity)
          for (var key in action.props) {
            activeEntity[key] = action.props[key]
          }
          return update(state, {
            activeEntity: {$set: activeEntity},
            edited: {$set: true}
          })
      }
    case 'RECEIVE_AGENCIES':
      const agencies = action.agencies.map(ent => {
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
      return update(state, {
        tableData: {agency: {$set: agencies}}
      })
    case 'RECEIVE_FEED_INFO':
      // newTableData = {}
      // newTableData.feedInfo = action.feedInfo

      return update(state, {
        tableData: {feedinfo: {$set: action.feedInfo}}
      })
    case 'RECEIVE_CALENDARS':

      return update(state, {
        tableData: {calendar: {$set: action.calendars}}
      })
    case 'RECEIVE_ROUTES':
      // feedTableData = state.tableData[action.feedId]
      // if (!feedTableData)
      //   feedTableData = {}
      const routes = action.routes ? action.routes.map(r => {
        return {
          id: r.id,
          feedId: r.feedId,
          agency_id: r.agencyId,
          route_short_name: r.routeShortName,
          route_long_name: r.routeLongName,
          route_desc: r.routeDesc,
          route_type: r.routeTypeId,
          route_url: r.routeUrl,
          route_color: r.routeColor,
          route_text_color: r.routeTextColor,
          route_id: r.gtfsRouteId
        }
      }) : []
      // feedTableData.route = routes
      return update(state, {
        tableData: {route: {$set: routes}}
      })
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
      if (state.activeEntity.id === action.routeId) {
        return update(state, {
          tableData: {route: {[routeIndex]: {$merge: {tripPatterns: action.tripPatterns}}}},
          activeEntity: {$merge: {tripPatterns: action.tripPatterns}}
        })
      } else {
        return update(state, {
          tableData: {route: {[routeIndex]: {$merge: {tripPatterns: action.tripPatterns}}}}
        })
      }
    case 'RECEIVE_TRIPS_FOR_CALENDAR':
      routeIndex = state.tableData.route.findIndex(r => r.id === action.pattern.routeId)
      let patternIndex = state.tableData.route[routeIndex].tripPatterns.findIndex(p => p.id === action.pattern.id)
      return update(state, {
        tableData: {route: {[routeIndex]: {tripPatterns: {[patternIndex]: {$merge: {[action.calendarId]: action.trips}}}}}}
      })
    case 'RECEIVE_STOPS':
      const stops = action.stops ? action.stops.map(mapStop) : []

      return update(state, {
        tableData: {stop: {$set: stops}}
      })
    case 'RECEIVE_STOP':
      const stop = mapStop(action.stop)
      console.log(stop)
      let stopIndex = state.tableData.stop.findIndex(s => s.id === stop.id)
      let stateUpdate

      // if stop is active, update active entity
      if (stop.id === state.activeEntityId && stopIndex !== -1) {
        stateUpdate = {
          tableData: {stop: {[stopIndex]: {$merge: stop}}},
          activeEntity: {$set: stop},
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
      return {
        feedSourceId: null,
        activeEntityId: null,
        activeEntity: null,
        activeSubEntity: null,
        activeSubEntityId: null,
        activeComponent: null,
        activeComponent: null,
        activeSubComponent: null,
        activeSubSubComponent: null,
        edited: false,
        tableData: {},
        validation: null,
        gtfsEntityLookup: {}
      }
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
        if(entity.hasOwnProperty('route_id')) return 'route'
        if(entity.hasOwnProperty('stop_id')) return 'stop'
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
