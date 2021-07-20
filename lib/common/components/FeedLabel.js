import React from 'react'
import tinycolor from 'tinycolor2'
import Icon from '@conveyal/woonerf/components/icon'

const getComplementaryColor = (cssHex, strength) => {
  const color = tinycolor(cssHex)

  const complementary = color.isDark()
    ? color.lighten(strength)
    : color.darken(strength + 10)
  return complementary.toHexString()
}

export default function Label (props) {
  const { name, color, small, adminOnly } = props

  return (
    <span
      className={`feedLabel ${small ? 'small' : ''}`}
      style={{
        backgroundColor: color,
        color: getComplementaryColor(color, 45),
        borderColor: getComplementaryColor(color, 10)
      }}
    >
      {adminOnly ? <Icon type='lock' /> : ''}
      {name}
    </span>
  )
}
