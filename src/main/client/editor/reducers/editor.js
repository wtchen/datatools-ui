import update from 'react-addons-update'

/*const emptyTableData = {
  'realtime_routes': [],
  'realtime_stops': [],
  'directions': [],
  'realtime_trips': [],
  'stop_attributes': [],
  'timepoints': [],
  'rider_categories': [],
  'fare_rider_categories': [],
  'calendar_attributes': [],
  'farezone_attributes': []
}*/

const emptyTableData = { }

const editor = (state = {
  feedSourceId: null,
  timestamp: null,
  tableData: {},
  validation: {},
  gtfsEntityLookup: {}
}, action) => {
  let newTableData, fields, rowData, mappedEntities, feedTableData
  console.log(action)
  switch (action.type) {
    case 'RECEIVE_AGENCIES':
      return state
    case 'RECEIVE_FEED_INFO':
      newTableData = {}
      newTableData.feedInfo = action.feedInfo

      return update(state, {
        tableData: {feedInfo: {$set: action.feedInfo}}
      })
    case 'RECEIVE_ROUTES':
      // feedTableData = state.tableData[action.feedId]
      // if (!feedTableData)
      //   feedTableData = {}
      const routes = action.routes ? action.routes.map(r => {
        return {
          id: r.id,
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
    case 'RECEIVE_STOPS':
      const stops = action.stops ? action.stops.map(s => {
        // let newStop = {}
        // newStop.id = s.id
        // newStop.stop_id = s.gtfsStopId
        // newStop.stop_code = s.stopCode
        // newStop.stop_name = s.stopName
        // newStop.stop_desc = s.stopDesc
        // newStop.stop_lat = s.lat
        // newStop.stop_lon = s.lon
        // newStop.zone_id = s.zoneId
        // newStop.stop_url = s.stopUrl
        // newStop.location_type = s.locationType
        // newStop.parent_station = s.parentStation
        // newStop.stop_timezone = s.stopTimezone
        // newStop.wheelchair_boarding = s.wheelchairBoarding
        // newStop.bikeParking = s.bikeParking
        // newStop.carParking = s.carParking
        // newStop.pickupType = s.pickupType
        // newStop.dropOffType = s.dropOffType
        // return newStop
        return {
          id: s.id,
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
      }) : []

      return update(state, {
        tableData: {stop: {$set: stops}}
      })
    case 'CLEAR_GTFSEDITOR_CONTENT':
      return {
        feedSourceId: null,
        timestamp: null,
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
            return action.entities.map(ent => {
              return {
                id: ent.id,
                stop_id: ent.gtfsStopId,
                stop_code: ent.stopCode,
                stop_name: ent.stopName,
                stop_desc: ent.stopDesc,
                stop_lat: ent.lat,
                stop_lon: ent.lon,
                zone_id: ent.zoneId,
                stop_url: ent.stopUrl,
                location_type: ent.locationType,
                parent_station: ent.parentStation,
                stop_timezone: ent.stopTimezone,
                wheelchair_boarding: ent.wheelchairBoarding,
                bikeParking: ent.bikeParking,
                carParking: ent.carParking,
                pickupType: ent.pickupType,
                dropOffType: ent.dropOffType
              }
            })
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
            return []
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
        timestamp: {$set: action.timestamp},
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
