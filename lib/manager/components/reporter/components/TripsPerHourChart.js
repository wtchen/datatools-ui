// @flow

import React from 'react'

type Props ={
  maxTripsPerHour: number,
  tripsPerHour: Array<number>
}

export default function (props: Props) {
  const {
    maxTripsPerHour,
    tripsPerHour
  } = props

  const graphHeight = 100
  const spacing = 12
  const leftMargin = 50
  const bottomMargin = 50
  const svgWidth = leftMargin + (tripsPerHour.length * spacing)
  const svgHeight = graphHeight + bottomMargin
  const yAxisMax = Math.ceil(maxTripsPerHour / 10) * 10
  const yAxisPeriod = maxTripsPerHour > 10 ? 5 : 2
  const yAxisLabels = []
  for (var i = yAxisPeriod; i <= yAxisMax; i += yAxisPeriod) {
    yAxisLabels.push(i)
  }

  return (
    <div>
      <h5>Number of trips per hour</h5>
      <div
        style={{
          width: '100%',
          height: `${svgHeight}px`,
          overflowX: 'hidden',
          overflowY: 'hidden',
          border: '#ddd'
        }}>
        <svg style={{width: svgWidth, height: `${svgHeight}px`}}>
          {yAxisLabels.map((label, index) => {
            const y = graphHeight - ((label / yAxisMax) * graphHeight)
            return <g key={index}>
              <line
                x1={0} y1={y}
                x2={svgWidth} y2={y}
                stroke='gray'
                strokeWidth={1}
              />
              <text x={0} y={y - 2} fill='gray'>
                {label}
              </text>
            </g>
          })}
          {tripsPerHour.map((numTrips, hour) => {
            const title = `${hour}:00 - ${numTrips} trips`
            const x = leftMargin + (spacing / 2) + (hour * spacing)

            // generate the bar for this date
            return (
              <g key={hour}>
                <title>{title}</title>
                <line
                  x1={x} y1={graphHeight - ((numTrips / yAxisMax) * graphHeight)}
                  x2={x} y2={graphHeight}
                  title={title}
                  stroke={'#8da0cb'}
                  strokeWidth={10} />
                {/* label x-axis with dates every 14 days */}
                {hour % 6 === 0
                  ? <g>
                    <line x1={x} y1={graphHeight} x2={x} y2={graphHeight + 12} stroke='black' />
                    <text x={x - 35} y={graphHeight + 26} fill='black'>
                      {`${hour}:00`}
                    </text>
                  </g>
                  : null
                }
              </g>
            )
          })}
          {/* Add baseline to chart */}
          <line
            x1={0}
            y1={graphHeight}
            x2={svgWidth}
            y2={graphHeight}
            stroke='black'
            strokeWidth={2} />
        </svg>
      </div>
    </div>
  )
}
