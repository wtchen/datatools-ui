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
  shouldComponentUpdate (nextProps, nextState) {
    if (nextState.value !== this.state.value) {
      return true
    }
    const nextEntities = nextProps.entities || []
    const currentEntities = this.props.entities || []
    if (nextEntities.length !== currentEntities.length) {
      // console.log('entities length changed', nextEntities, currentEntities)
      return true
    }
    return false
  }

  componentWillReceiveProps (nextProps) {
    if (this.state.value !== nextProps.value && typeof this.props.value !== 'undefined') {
      this.setState({value: nextProps.value})
    }
    const nextEntities = nextProps.entities || []
    const currentEntities = this.props.entities || []
    if (nextEntities.length !== currentEntities.length) {
      // console.log('entities length changed', nextEntities, currentEntities)
      this.setState({options: nextEntities.map(this._entityToOption)})
    }
  }

  onChange = (value) => {
    this.setState({value})
    this.props.onChange(value)
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
    const {clearable, component, optionRenderer, style} = this.props
    const {options, value} = this.state
    // const options = entities.map(this._entityToOption)
    return (
      <VirtualizedSelect
        // maxHeight={500}
        placeholder={`Select ${component}...`}
        options={options}
        searchable
        clearable={typeof clearable !== 'undefined' ? clearable : true}
        onChange={this.onChange}
        value={value}
        style={style}
        optionRenderer={optionRenderer} />
    )
  }
}
