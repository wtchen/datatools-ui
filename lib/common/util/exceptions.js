// @flow

import moment from 'moment'

import type {ParsedRangesAndDates} from '../../types'

// Method to filter out new dates (0's) so that flow is happy
// We have to use a reducer to keep flow happy.
export function filterOutNewDates (dates: Array<string | 0>): Array<string> {
  const outputDates: Array<string> = []
  const filter = (acc, current) => {
    typeof current === 'string' && acc.push(current)
    return acc
  }
  dates.reduce(filter, outputDates)
  return outputDates
}

/**
 * This method adds a range of dates from startRange to endRange to the dates array, inclusively according to startInclusive
 * and endInclusive.
 */
export function addRangeOfDates (
  startRange: moment,
  endRange: moment,
  dates: Array<string>,
  startInclusive: boolean,
  endInclusive: boolean
) {
  const datesToAdd = []
  while (endRange.unix() >= startRange.unix()) {
    if (endRange.unix() === startRange.unix() && !endInclusive) break
    if (datesToAdd.length === 0 && !startInclusive) {
      startInclusive = true
      continue
    }
    datesToAdd.push(startRange.format('YYYYMMDD'))
    startRange.add(1, 'days')
  }
  datesToAdd.forEach(date => {
    if (!dates.some(el => el === date)) {
      dates.push(date)
    }
  })
  return dates
}

/**
 * This method removes a range of dates from startRange to endRange to the dates array, inclusively according to startInclusive
 * and endInclusive.
 */
export function removeRangeOfDates (
  startRange: moment,
  endRange: moment,
  dates: Array<string>,
  startInclusive: boolean,
  endInclusive: boolean
) {
  const datesToRemove = []
  while (endRange.unix() >= startRange.unix()) {
    if (endRange.unix() === startRange.unix() && !endInclusive) break
    if (datesToRemove.length === 0 && !startInclusive) {
      startInclusive = true
      startRange.add(1, 'days')
      continue
    }
    datesToRemove.push(startRange.format('YYYYMMDD'))
    startRange.add(1, 'days')
  }
  dates = (dates.filter(date => !datesToRemove.some(el => el === date)): Array<string>)
  return dates
}

function datesAreConsecutive (next: ?string, currentDate: moment): boolean {
  if (!next) return false
  const nextDate = moment(next)

  if (next && nextDate.diff(currentDate, 'days') === 1) return true
  else return false
}

function previousDateIsConsecutive (prev: ?string, currentDate: moment): boolean {
  if (!prev) return false
  const prevDate = moment(prev)

  if (prev && currentDate.diff(prevDate, 'days') === 1) return true
  else return false
}

/**
 * This method extracts any ranges from a list of dates that are either being generated
 * or obtained from the back end.
 */
export function createDateRangesFromDates (acc: ParsedRangesAndDates, current: string, currentIndex: number, dates: Array<string>) {
  if (!current) return acc

  const next = dates[currentIndex + 1]
  const prev = dates[currentIndex - 1]
  const currentDate = moment(current)

  if (datesAreConsecutive(next, currentDate)) {
    // If previous date, this date, and next date are all consecutive we already have a range for this defined,
    // and we just need to update the accumulator.
    if (previousDateIsConsecutive(prev, currentDate)) {
      const range = acc.ranges.pop()
      if (typeof range !== 'object') return
      acc.ranges.push({
        startDate: range.startDate,
        startIndex: range.startIndex,
        endDate: next,
        endIndex: currentIndex + 1
      })
    } else {
      // Initial range creation
      acc.ranges.push({
        startDate: current,
        startIndex: currentIndex,
        endDate: next,
        endIndex: currentIndex + 1
      })
    }
  } else {
    if (previousDateIsConsecutive(prev, currentDate)) return acc // Do nothing, this entry has been accounted for
    else {
      // Display non consecutive dates as single dates. We need the original index to update the date later.
      acc.dates.push({date: current, index: currentIndex})
    }
  }
  return acc
}
