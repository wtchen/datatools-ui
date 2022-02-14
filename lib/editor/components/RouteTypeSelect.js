// @flow

import React, { Component } from 'react'
import DropdownTreeSelect from 'react-dropdown-tree-select'

import type { GtfsSpecField } from '../../types'

type Props = {
  field: GtfsSpecField,
  onRouteTypeChange: any => void,
  routeType: string
}

type State = {
  data: any
}

/**
 * Creates the route types tree structure for the route type selector.
 */
function getRouteTypeOptions (field: GtfsSpecField, routeType: string) {
  const routeTypes = field.options || []
  const standardRouteTypes = routeTypes.filter(opt => parseInt(opt.value, 10) < 100)
  const extendedRouteTypes = routeTypes.filter(opt => parseInt(opt.value, 10) >= 100)

  const routeTypeData = [
    // Show standard route types (< 100) at the top level
    ...standardRouteTypes.map(({ text, value }) => ({
      checked: value === routeType,
      label: `${text} (${value})`,
      value
    })),
    
    // If any, show extended route types initially collapsed
    ...(extendedRouteTypes.length > 0 ? [{
      children: [
        // Group children by type (e.g. all 101-199 route types fall under 100-Railway)
        ...extendedRouteTypes
          .filter(opt => parseInt(opt.value, 10) % 100 === 0)
          .map(category => {
            const routeTypesForCategory = extendedRouteTypes.filter(
              opt => opt.value > category.value && opt.value < category.value + 100
            )

            return {
              checked: category.value === routeType,
              children: routeTypesForCategory.map(({ text, value }) => ({
                checked: value === routeType,
                label: `${text} (${value})`,
                value
              })),
              label: `${category.text} (${category.value})`,
              value: category.value
            }
          })
      ],
      label: 'Extended GTFS Route Types',
      value: 'extended-route-types-header'
    }] : [])
  ]

  return routeTypeData
}

/**
 * Encapsulates a drop-down selector with a hierarchical (tree) list of choices.
 */
export default class RouteTypeSelect extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { data: getRouteTypeOptions(props.field, props.routeType) }
  }

  /**
   * Prevent resetting of any expanded status of the tree hierarchy
   * (datatools polls the backend every 10 seconds and that causes new props
   * to be passed to the editor component).
   */
  shouldComponentUpdate(nextProps: Props) {
    return nextProps.routeType !== this.props.routeType && nextProps.field !== this.props.field
  }

  render() {
    return (
      <DropdownTreeSelect
        className='route-type-select'
        data={this.state.data}
        inlineSearchInput
        mode='radioSelect'
        onChange={this.props.onRouteTypeChange}
      />
    );
  }
}
