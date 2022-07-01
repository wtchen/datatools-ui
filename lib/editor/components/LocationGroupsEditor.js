// @flow

import React, { useState } from 'react'
import Icon from '@conveyal/woonerf/components/icon'
import { Button } from 'react-bootstrap'
import uuidv4 from 'uuid/v4'

import type { GtfsLocation, GtfsStop } from '../../types'

import VirtualizedEntitySelect from './VirtualizedEntitySelect'

const LocationGroupsEditor = ({ currentValue, stops, locations, processFieldChange }) => {
  const [dropdownShowing, setDropdownShowing] = useState(false)
  const getStationOrLocationName =
    (haltId) => {
      const entity =
        stops.find((stop) => stop.stop_id === haltId) ||
        locations.find((location) => location.location_id === haltId)
      return entity ? entity.stop_name : 'mystery'
    }

  if (!currentValue || typeof currentValue === 'string') return null

  return (
    <>
      <ul>
        {typeof currentValue !== 'string' &&
          currentValue.map((l) => (
            <li>
              {getStationOrLocationName(l)} ({l})
            </li>
          ))}
      </ul>
      {!dropdownShowing && !(stops.length === 0 && locations.length === 0) && <Button
        block
        bsSize='small'
        onClick={() => setDropdownShowing(true)}
      >
        <Icon type='plus' /> Add stop or location by name
      </Button>}
      {dropdownShowing && <VirtualizedEntitySelect
        component={'stop or location'}
        entityKey={'stop_or_location_id'}
        entities={[
          ...stops,
          ...locations.map((l) => {
            return { ...l, id: uuidv4() }
          })
        ].filter((stopOrLocation: GtfsStop | GtfsLocation) => {
          // $FlowFixMe Union types are difficult for flow to understand
          return !currentValue.includes(
            stopOrLocation.stop_id || stopOrLocation.location_id
          )
        })}
        onChange={(change) => {
          processFieldChange([
            ...currentValue,
            change.entity.stop_id || change.entity.location_id
          ])
          setDropdownShowing(false)
        }}
      />}
    </>
  )
}

export default LocationGroupsEditor
