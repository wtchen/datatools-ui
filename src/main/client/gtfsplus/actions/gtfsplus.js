import gtfsPlusTables from '../gtfsPlusTables'

export function addGtfsPlusRow (tableId) {
  const table = gtfsPlusTables.find(t => t.id === tableId)

  let rowData = {}
  for(const field of table.fields) {
    rowData[field.name] = null
  }

  return {
    type: 'ADD_GTFSPLUS_ROW',
    tableId,
    rowData
  }
}

export function updateGtfsPlusField (tableId, rowIndex, fieldName, newValue) {
  return {
    type: 'UPDATE_GTFSPLUS_FIELD',
    tableId,
    rowIndex,
    fieldName,
    newValue
  }
}

export function deleteGtfsPlusRow (tableId, rowIndex) {
  return {
    type: 'DELETE_GTFSPLUS_ROW',
    tableId,
    rowIndex
  }
}
