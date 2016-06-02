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
  feedVersionId: null,
  timestamp: null,
  tableData: {},
  validation: {},
  gtfsEntityLookup: {}
}, action) => {
  let newTableData, fields, rowData
  switch (action.type) {
    case 'CLEAR_GTFSEDITOR_CONTENT':
      return {
        feedVersionId: null,
        timestamp: null,
        tableData: {},
        validation: null,
        gtfsEntityLookup: {}
      }
    case 'RECEIVE_GTFSEDITOR_TABLE':
      newTableData = {}
      fields = Object.keys(action.entities[0])
      newTableData[action.tableId] = action.entities
        // .map((line, rowIndex) => {
        //   console.log(line, rowIndex)
        //   const values = line.split(',')
        //   rowData = { origRowIndex: rowIndex }
        //   for(let f = 0; f < fields.length; f++) {
        //     rowData[fields[f]] = values[f]
        //   }
        //   return rowData
        // })
      return update(state, {
        tableData: {$set: newTableData}
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
        feedVersionId: {$set: action.feedVersionId},
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
