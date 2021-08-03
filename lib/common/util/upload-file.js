// @flow

import fetch from 'isomorphic-fetch'

import {getHeaders} from './util'

export function uploadFile ({
  file, mimeType, token, url
}: {
  file: File, mimeType: ?string, token: string, url: string
}) {
  // This previously defaulted to zip. This is included for backwards compatibility
  const mime = mimeType || 'application/zip'

  return fetch(url, {
    method: 'post',
    headers: getHeaders(token, true, mime),
    body: file
  })
}
