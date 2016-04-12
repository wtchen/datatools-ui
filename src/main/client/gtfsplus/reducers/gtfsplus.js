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
