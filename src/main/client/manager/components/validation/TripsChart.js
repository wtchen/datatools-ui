import React from 'react'
import moment from 'moment'
// import rd3 from 'rd3'

export default class TripsChart extends React.Component {

  render () {
    const data = Object.keys(this.props.data).map(key => [key, this.props.data[key]])
    const WIDTH = data.length * 4
    const HEIGHT = 200
    const MAX_TRIPS = data.reduce((d, dPrev) => !d || dPrev[1] > d[1] ? dPrev[1] : d[1])
    // const BarChart = rd3.BarChart
    return (
      <div
        style={{
            width: '600px',
            height: HEIGHT + 20 + 'px',
            overflowY: 'scroll'
          }}
      >
      <svg style={{width: WIDTH + 'px', height: HEIGHT + 'px'}}>
        {data.map((d, index) => {
          const dow = moment(d[0]).day()
          console.log(dow)
          return <line
            x1={index * 3} y1={HEIGHT - d[1] / MAX_TRIPS * HEIGHT}
            x2={index * 3} y2={HEIGHT}
            stroke={dow === 0 ? 'red'
                    : dow === 6 ? 'black'
                    : 'blue'}
            stroke-width='8'
          />
        })
        }
      </svg>
      </div>
    )
  }
}
