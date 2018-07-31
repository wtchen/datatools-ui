// @flow

import fetch from 'isomorphic-fetch'

import {getHeaders} from './util'

export function uploadFile ({file, url, token}: {file: File, url: string, token: string}) {
  return fetch(url, {
    method: 'post',
    headers: getHeaders(token, true, 'application/zip'),
    body: file
  })
}
