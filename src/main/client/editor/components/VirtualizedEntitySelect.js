import React, {Component, PropTypes} from 'react'
import VirtualizedSelect from 'react-virtualized-select'
import 'react-virtualized/styles.css'
import 'react-select/dist/react-select.css'
import 'react-virtualized-select/styles.css'

import { getEntityName } from '../util/gtfs'

export default class VirtualizedEntitySelect extends Component {

  constructor(props) {
    super(props)
    this.state = {
      value: this.props.value
    };
  }
  componentWillReceiveProps (nextProps) {
    if (this.state.value !== nextProps.value && typeof this.props.value !== 'undefined') {
      this.setState({value: nextProps.value})
    }
  }
  onChange (value) {
    this.setState({value})
    this.props.onChange(value)
  }

  render () {
    let { entities, component, entityKey } = this.props
    let key = entityKey ? entityKey : 'id'
    return (
      <VirtualizedSelect
        // maxHeight={500}
        placeholder={`Select ${component}...`}
        options={entities ? entities.map(entity => ({value: entity[key], label: getEntityName(component, entity) || '[Unnamed]', entity})) : []}
        searchable
        onChange={(value) => this.onChange(value)}
        value={this.state.value}
      />
    )
  }
}
