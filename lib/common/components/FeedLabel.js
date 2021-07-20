import React from 'react'
import tinycolor from 'tinycolor2'

const getComplementaryColor = (cssHex, strength) => {
  const color = tinycolor(cssHex)

  const complementary = color.isDark()
    ? color.lighten(strength)
    : color.darken(strength + 10)
  return complementary.toHexString()
}

export default function Label (props) {
  const { name, color, small } = props

  return (
    <span
      className={`feedLabel ${small ? 'small' : ''}`}
      style={{
        backgroundColor: color,
        color: getComplementaryColor(color, 45),
        borderColor: getComplementaryColor(color, 10)
      }}
    >
      {name}
    </span>
  )
}
