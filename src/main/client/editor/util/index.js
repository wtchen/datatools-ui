import { getAbbreviatedStopName } from '../util/gtfs'

export const CLICK_OPTIONS = ['DRAG_HANDLES', 'ADD_STOP_AT_CLICK', 'ADD_STOPS_AT_INTERVAL', 'ADD_STOPS_AT_INTERSECTIONS']
export const YEAR_FORMAT = 'YYYY-MM-DD'
export const TIMETABLE_FORMATS = ['HH:mm:ss', 'h:mm:ss a', 'h:mm:ssa', 'h:mm a', 'h:mma', 'h:mm', 'HHmm', 'hmm', 'HH:mm'].map(format => `YYYY-MM-DDT${format}`)

export function isTimeFormat (type) {
  return /TIME/.test(type)
}

export function getTimetableColumns (pattern, stops, hideDepartureTimes) {
  const columns = [
    {
      name: 'Block ID',
      width: 60,
      key: 'blockId',
      type: 'TEXT',
      placeholder: '300'
    },
    {
      name: 'Trip ID',
      width: 200,
      key: 'gtfsTripId',
      type: 'TEXT',
      placeholder: '12345678'
    },
    {
      name: 'Trip Headsign',
      width: 200,
      key: 'tripHeadsign',
      type: 'TEXT',
      placeholder: 'Destination via Transfer Center'
    }
  ]
  if (pattern && pattern.patternStops) {
    if (!pattern.useFrequency) {
      pattern.patternStops.map((ps, index) => {
        let stop = stops ? stops.find(st => st.id === ps.stopId) : null
        let stopName = stop ? stop.stop_name : ps.stopId
        let abbreviatedStopName = stop ? getAbbreviatedStopName(stop) : ps.stopId
        const TIME_WIDTH = 80
        columns.push({
          name: abbreviatedStopName,
          title: stopName,
          width: TIME_WIDTH,
          key: `stopTimes.${index}.arrivalTime`,
          colSpan: '2',
          hidden: false,
          type: 'ARRIVAL_TIME',
          placeholder: 'HH:MM:SS'
        })
        columns.push({
          key: `stopTimes.${index}.departureTime`,
          width: TIME_WIDTH,
          hidden: hideDepartureTimes,
          type: 'DEPARTURE_TIME',
          placeholder: 'HH:MM:SS'
        })
      })
    }
    // columns added if using freqency schedule type
    else {
      columns.push({
        name: 'Start time',
        width: 100,
        key: 'startTime',
        type: 'TIME',
        placeholder: 'HH:MM:SS'
      })
      columns.push({
        name: 'End time',
        width: 100,
        key: 'endTime',
        type: 'TIME',
        placeholder: 'HH:MM:SS'
      })
      columns.push({
        name: 'Headway',
        width: 60,
        key: 'headway',
        type: 'MINUTES',
        placeholder: '15 (min)'
      })
    }
  }
  return columns
}
