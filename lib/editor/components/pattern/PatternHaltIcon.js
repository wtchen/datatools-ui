import React from 'react'
import Icon from '@conveyal/woonerf/components/icon'

import { patternHaltIsLocation } from '../../util/location'

const PatternHaltIcon = ({ patternHalt }) => {
  const isLocation = patternHalt && patternHaltIsLocation(patternHalt)

  if (isLocation) return <Icon type='compass' />
  return <Icon type='map-marker' />
}

export default PatternHaltIcon
