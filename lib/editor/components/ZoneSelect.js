// @flow

import React, {Component} from 'react'
import Select from 'react-select'

type SelectOption = {
  label: any,
  value: string,
  create?: boolean
}

type Props = {
  addCreateOption?: boolean,
  onChange: any => void,
  placeholder: string,
  value: any,
  options: Array<SelectOption>
}

type State = {
  value: any
}

export default class ZoneSelect extends Component<Props, State> {
  static defaultProps = {
    placeholder: 'Select zone ID...'
  }

  state = {
    value: null
  }

  /**
   * NOTE: this method adds "Create new zone" custom option when using
   * ZoneSelect to edit stop entities.
   */
  _filterZoneOptions = (options: Array<SelectOption>, filter: string, values: Array<SelectOption>) => {
    // Filter options on already selected values
    const valueKeys = values && values.map(i => i.value)
    let filteredOptions: Array<SelectOption> = valueKeys
      ? options.filter(option => valueKeys.indexOf(option.value) === -1)
      : options
    if (filter !== undefined && filter != null && filter.length > 0) {
      // Filter options on labels
      filteredOptions = filteredOptions
        .filter(option => RegExp(filter, 'ig').test(option.label))
    }
    // Append Addition option
    if (filteredOptions.length === 0) {
      filteredOptions.push({
        label: <span><strong>Create new zone</strong>: {filter}</span>,
        value: filter,
        create: true
      })
    }
    return filteredOptions
  }

  _onChange = (option: SelectOption) => {
    const value = option ? option.value : null
    this.setState({value})
  }

  render () {
    const {addCreateOption, onChange, placeholder, value, options} = this.props
    return (
      <Select
        clearable
        data-test-id='fare-zone-selector'
        filterOptions={addCreateOption && this._filterZoneOptions}
        noResultsText={`No zones found. Specify zones in stop.`}
        onChange={onChange || this._onChange}
        options={options}
        placeholder={placeholder}
        value={value || this.state.value} />
    )
  }
}
