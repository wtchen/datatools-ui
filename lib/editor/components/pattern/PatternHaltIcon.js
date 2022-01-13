import React from 'react'
import Icon from '@conveyal/woonerf/components/icon'

const PatternHaltIcon = ({ patternHalt }) => {
  const isLocation = patternHalt && patternHalt.hasOwnProperty('locationId')

  if (isLocation) return <Icon type='compass' />
  return <Icon type='map-marker' />
}

export default PatternHaltIcon
