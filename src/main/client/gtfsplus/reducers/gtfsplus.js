import update from 'react-addons-update'

const gtfsplus = (state = {
  tableData: {
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
  }
}, action) => {
  switch (action.type) {
    case 'RECEIVE_GTFSPLUS_CONTENT':
      let newTableData = {}
      for(let i = 0; i < action.filenames.length; i++) {
        const lines = action.fileContent[i].split('\n')
        if(lines.length < 2) continue
        const fields = lines[0].split(',')
        newTableData[action.filenames[i].split('.')[0]] = lines.slice(1)
          .filter(line => line.split(',').length === fields.length)
          .map(line => {
            const values = line.split(',')
            let rowData = {}
            for(let f = 0; f < fields.length; f++) {
              rowData[fields[f]] = values[f]
            }
            return rowData
          })
      }
      return update(state,
        {tableData:
          {$merge: newTableData}
        }
      )
    case 'ADD_GTFSPLUS_ROW':
      return update(state,
        {tableData:
          {[action.tableId]:
            {$push: [action.rowData]}
          }
        }
      )
    case 'UPDATE_GTFSPLUS_FIELD':
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
    case 'DELETE_GTFSPLUS_ROW':
      console.log('DELETE_GTFSPLUS_ROW', state, action);
      const table = state.tableData[action.tableId]
      console.log(table);
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

    default:
      return state
  }
}

export default gtfsplus
