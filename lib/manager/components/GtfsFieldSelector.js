// @flow

import React from 'react'
import Select from 'react-select'

import { getGtfsSpec } from '../../common/util/config'

import type { GtfsSpecTable, ReactSelectOption } from '../../types'

type GtfsFieldSelectorProps = {
  onChange: (ReactSelectOption => void),
  selectedField: ?string,
  tableName: ?string
}

/**
 * Obtains the desired GTFS spec table.
 */
function getGtfsTableSpec (tableName: string): ?GtfsSpecTable {
  const spec = getGtfsSpec()
  if (!spec) {
    throw new Error('GTFS spec could not be found!')
  }
  const tableFile = `${tableName}.txt`
  return spec.find(t => t.name === tableFile)
}

/**
 * Dropdown selector to select a field from a given GTFS table.
 */
const GtfsFieldSelector = (props: GtfsFieldSelectorProps) => {
  const { onChange, selectedField, tableName } = props
  let options = []
  let placeholder = 'First, select a table above'
  if (tableName) {
    const table = getGtfsTableSpec(tableName)
    options = table && table.fields.map(field => ({ label: field.name, value: field.name }))
    placeholder = 'Choose the field to normalize'
  }

  return (
    <Select
      clearable={false}
      disabled={!tableName}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      style={{margin: '10px 0px', width: '230px'}}
      value={selectedField}
    />
  )
}

export default GtfsFieldSelector
