import fetch from 'isomorphic-fetch'

export function uploadFile ({file, url, token}) {
  return fetch(url, {
    method: 'post',
    headers: {
      'Authorization': 'Bearer ' + token,
      // 'Content-Type': 'application/zip'
    },
    body: file
  })
}
