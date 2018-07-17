// @flow

import moment from 'moment'

import {getConfigProperty} from './config'

export function formatTimestamp (value: number | string, includeTime: boolean = true): string {
  const dateFormat = getConfigProperty('application.date_format') || 'MMM Do YYYY'
  const timeFormat = getConfigProperty('application.time_format') || 'h:MMa'
  return moment(value).format(`${dateFormat}${includeTime ? `, ${timeFormat}` : ''}`)
}

export function fromNow (value: number | string): string {
  return moment(value).fromNow()
}

export function convertSecondsToString (seconds: number): string {
  const hours = Math.floor(seconds / 60 / 60)
  const minutes = Math.floor(seconds / 60) % 60
  return seconds ? `${hours}:${minutes < 10 ? '0' + minutes : minutes}` : '00:00'
}

export function convertStringToSeconds (string: string): number {
  const hourMinute = string.split(':')
  if (!isNaN(hourMinute[0]) && !isNaN(hourMinute[1])) {
    // If both hours and minutes are present
    return (Math.abs(+hourMinute[0]) * 60 * 60) + (Math.abs(+hourMinute[1]) * 60)
  } else if (isNaN(hourMinute[0])) {
    // If less than one hour
    return Math.abs(+hourMinute[1]) * 60
  } else if (isNaN(hourMinute[1])) {
    // If minutes are not present
    return Math.abs(+hourMinute[0]) * 60 * 60
  } else {
    // If no input
    return 0
  }
}
