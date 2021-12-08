// @flow

import React, {Component} from 'react'
import Select from 'react-select'

import type {ZoneOption} from '../../types'

type Props = {
  addCreateOption?: boolean,
  onChange: ?ZoneOption => void,
  options: Array<ZoneOption>,
  placeholder: string,
  value: ?ZoneOption
}

type State = {
  value: any
}

export default class LocationGroupSelect extends Component<Props, State> {
  static defaultProps = {
    placeholder: 'Select location group ID...'
  }

  state = {
    value: null
  }

  /**
   * NOTE: this method adds "Create new location group" custom option when using
   * ZoneSelect to edit stop entities.
   */
  _filterLocationGroupOptions = (options: Array<ZoneOption>, filter: String, values: Array<ZoneOption>) => {
    // Filter options on already selected values
    const valueKeys = values && values.map(i => i.value)
    let filteredOptions: Array<ZoneOption> = valueKeys
      ? options.filter(option => valueKeys.indexOf(option.value) === -1) // If valueKeys exist, filter options down to only those that appy to values not in valueKeys
      : options // Otherwise keep all options
    if (filter != null && filter.length > 0) { // != null condition checks both undefined and null
      // Filter options on labels
      filteredOptions = filteredOptions
        .filter(option => RegExp(filter, 'ig').test(option.label)) // We search for the filter text, ignoring casing in the option label
    }
    // Append Addition option
    if (filteredOptions.length === 0) {
      filteredOptions.push({
        label: <span><strong>Create new location group</strong>: {filter}</span>,
        value: filter,
        create: true
      })
    }
    return filteredOptions
  }

  _onChange = (option: ZoneOption) => {
    const value = option ? option.value : null
    this.setState({value})
  }

  render () {
    const {addCreateOption, onChange, options, placeholder, value} = this.props
    const filterOptions = addCreateOption ? this._filterLocationGroupOptions : undefined
    if (value && typeof value === 'string' && !options.find(option => option.value === value)) {
      console.warn(`${value} not found in location group options. Adding to options.`)
      options.push({label: value, value})
    }
    return (
      <Select
        clearable
        data-test-id='location-group-selector'
        filterOptions={filterOptions}
        noResultsText={'No location groups found. Specify location groupings in stops/locations.'}
        onChange={onChange || this._onChange}
        options={options}
        placeholder={placeholder}
        value={value || this.state.value}
      />
    )
  }
}
