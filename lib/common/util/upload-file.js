import fetch from 'isomorphic-fetch'

import {getHeaders} from './util'

export function uploadFile ({file, url, token}) {
  return fetch(url, {
    method: 'post',
    headers: getHeaders(token, true, 'application/zip'),
    body: file
  })
}
