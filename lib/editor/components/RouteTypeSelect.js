// @flow

import React, { Component } from 'react'
import DropdownTreeSelect from 'react-dropdown-tree-select'

import type { GtfsSpecField } from '../../types'

type Props = {
  field: GtfsSpecField,
  onRouteTypeChange: (any, any) => void,
  routeType: number
}

type State = {
  data: any
}

type NumericalOption = {
  text: string,
  value: number
}

function convertValueToNumber ({ text, value }: { text: string, value: string }): NumericalOption {
  return {
    text,
    value: parseInt(value, 10)
  }
}
/**
 * Determines whether a route is standard or not.
 */
function isStandardRouteType ({ value }: { value: number }) {
  return value < 100
}

/**
 * Creates the route types tree structure for the route type selector.
 */
function getRouteTypeOptions (field: GtfsSpecField, routeType: number) {
  // Convert option values into numbers.
  const routeTypes = (field.options || []).map(convertValueToNumber)

  const standardRouteTypes = routeTypes.filter(isStandardRouteType)
  const extendedRouteTypes = routeTypes.filter(opt => !isStandardRouteType(opt))
  // If a custom value was provided, show it.
  // (at this time, entering non-standard values is not supported.)
  const customRouteTypes = []
  if (!routeTypes.find(opt => opt.value === routeType)) {
    customRouteTypes.push({
      text: 'Custom',
      value: routeType
    })
  }

  // Helper function that converts a field option to an entry for the tree selector.
  // It is inline because it uses the routeType argument.
  const toTreeOption = ({ text, value }: NumericalOption) => ({
    checked: value === routeType,
    label: `${text} (${value})`,
    value
  })

  // Variant of the function above for standard route types
  // that includes a data-test-id for e2e tests.
  const toTreeOptionWithDataId = (opt: NumericalOption) => ({
    ...toTreeOption(opt),
    dataset: { testId: `route-type-option-${opt.value}` }
  })

  // Display in this order:
  // - non-standard/unknown route type used for this route, if applicable,
  // - standard route types
  // - extended route types, if configured.
  return [
    ...customRouteTypes.map(toTreeOption),
    ...standardRouteTypes.map(toTreeOptionWithDataId),
    ...(extendedRouteTypes.length > 0 ? [{
      children: [
        // Group children by category (e.g. all 101-199 route types fall under 100-Railway).
        // Get all the categories here.
        ...extendedRouteTypes
          .filter(opt => opt.value % 100 === 0)
          .map(category => ({
            ...toTreeOption(category),
            // Add the children for each category.
            children: extendedRouteTypes
              .filter(
                opt => opt.value > category.value && opt.value < category.value + 100
              )
              .map(toTreeOption)
          }))
      ],
      // Used for CSS no-pointer and font effects.
      className: 'extended-values-node',
      label: 'Extended GTFS Route Types'
    }] : [])
  ]
}

/**
 * Encapsulates a drop-down selector with a hierarchical (tree) list of choices,
 * and filters out unnecessary prop changes to prevent flicker.
 */
export default class RouteTypeSelect extends Component<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = { data: getRouteTypeOptions(props.field, props.routeType) }
  }

  /**
   * Prevent resetting of any expanded status of the tree hierarchy
   * (datatools polls the backend every 10 seconds and that causes new props
   * to be passed to the editor component).
   */
  shouldComponentUpdate (nextProps: Props) {
    return nextProps.routeType !== this.props.routeType &&
      nextProps.field !== this.props.field
  }

  render () {
    return (
      <DropdownTreeSelect
        className='route-type-select'
        data={this.state.data}
        inlineSearchInput
        mode='radioSelect'
        onChange={this.props.onRouteTypeChange}
      />
    )
  }
}
