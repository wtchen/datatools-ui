import { getConfigProperty } from '../../common/util/config'

export function constructNewGtfsPlusRow (tableId) {
  const table = getConfigProperty('modules.gtfsplus.spec')
    .find(t => t.id === tableId)
  const rowData = {}
  for (const field of table.fields) {
    rowData[field.name] = null
  }
  return rowData
}
