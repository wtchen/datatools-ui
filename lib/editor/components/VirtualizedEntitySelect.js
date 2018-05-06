import React, {Component, PropTypes} from 'react'
import VirtualizedSelect from 'react-virtualized-select'

import { getEntityName } from '../util/gtfs'

export default class VirtualizedEntitySelect extends Component {
  static propTypes = {
    entities: PropTypes.array,
    component: PropTypes.string,
    entityKey: PropTypes.string
  }

  state = {
    value: this.props.value,
    options: []
  }

  /**
   * This component can hold a large number of options, so its
   * shouldComponentUpdate method checks only for changes in state (i.e., the
   * selected value) and a change in length of its entities.
   */
  // shouldComponentUpdate (nextProps, nextState) {
  //   if (nextState.value !== this.state.value || this.state.options.length !== nextState.options.length) {
  //     return true
  //   }
  //   const nextEntities = nextProps.entities || []
  //   const currentEntities = this.props.entities || []
  //   if (nextEntities.length !== currentEntities.length) {
  //     console.log('entities length changed', nextEntities, currentEntities)
  //     return true
  //   }
  //   return false
  // }

  componentWillReceiveProps (nextProps) {
    if (this.state.value !== nextProps.value && typeof this.props.value !== 'undefined') {
      this.setState({value: nextProps.value})
    }
  }

  _onChange = (value) => {
    const {onChange} = this.props
    this.setState({value})
    onChange && onChange(value)
  }

  _entityToOption = entity => {
    const {entityKey} = this.props
    const key = entityKey || 'id'
    return {
      value: entity[key],
      label: getEntityName(entity) || '[Unnamed]',
      entity
    }
  }

  render () {
    const {
      clearable,
      component,
      entities,
      optionRenderer,
      style
    } = this.props
    const {value} = this.state
    let disabled = false
    let placeholder = `Select ${component}...`
    let options = []
    if (entities.length > 10000) {
      console.warn(`Entity list too large (count=${entities.length}). Disabling entity selector.`)
      disabled = true
      placeholder = 'Selector disabled. List is too large.'
    } else {
      options = entities.map(this._entityToOption)
    }
    return (
      <VirtualizedSelect
        placeholder={placeholder}
        options={options}
        searchable
        disabled={disabled}
        clearable={typeof clearable !== 'undefined' ? clearable : true}
        onChange={this._onChange}
        value={value}
        style={style}
        optionRenderer={optionRenderer} />
    )
  }
}
