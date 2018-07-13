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
