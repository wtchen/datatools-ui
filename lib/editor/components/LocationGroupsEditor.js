// @flow

// $FlowFixMe React hook bindings not picked up
import React, { useState } from 'react'
import Icon from '@conveyal/woonerf/components/icon'
import { Button } from 'react-bootstrap'
import uuidv4 from 'uuid/v4'

import type { GtfsLocation, GtfsStop } from '../../types'

import VirtualizedEntitySelect from './VirtualizedEntitySelect'

type Props = {
  currentValue: Array<string> | string,
  locations: Array<GtfsLocation>,
  processFieldChange: (val: any) => void,
  stops: Array<GtfsStop>
}

const LocationGroupsEditor = ({ currentValue, stops, locations, processFieldChange }: Props) => {
  const [dropdownShowing, setDropdownShowing] = useState(false)
  const getStationOrLocationName =
    (haltId) => {
      const entity =
        stops.find((stop) => stop.stop_id === haltId) ||
        locations.find((location) => location.location_id === haltId)
      return entity ? entity.stop_name : 'mystery'
    }
  if (!currentValue) currentValue = []

  const deleteHalt = (haltId) => {
    if (typeof currentValue === 'string') return

    processFieldChange(
      currentValue.filter(id => id !== haltId)
    )
  }

  return (
    <>
      <ul>
        {typeof currentValue !== 'string' &&
          currentValue.map((l) => (
            <li key={l}>
              {getStationOrLocationName(l)} ({l})<Button bsSize='small' bsStyle='link' onClick={() => deleteHalt(l)}>
                <Icon type='trash' />
              </Button>
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
          // $FlowFixMe Flow struggles with union types
        ].filter((stopOrLocation: GtfsStop | GtfsLocation) => {
          return !currentValue.includes(
            // $flowfixme making this flow compatible would introduce a lot of unneeded code
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
