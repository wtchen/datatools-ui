const fetch = require('isomorphic-fetch')
const omit = require('lodash/omit')
const uuid = require('uuid/v4')

// the below json files should have the form of:
// {
//   apiClient: 'SECRET',
//   apiSecret: 'SECRET',
//   domain: 'SECRET.auth0.com',
//   clientId: 'SECRET'
// }
const from = require('./from-client.json')
const to = require('./to-client.json')

async function getManagementToken (connectionSettings) {
  const { apiClient, apiSecret, domain } = connectionSettings

  const token = await fetch(
    `https://${domain}/oauth/token`,
    {
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: apiClient,
        client_secret: apiSecret,
        audience: `https://${domain}/api/v2/`
      }),
      headers: { 'content-type': 'application/json' },
      method: 'POST'
    }
  )
    .then((res) => res.json())
    .then((json) => {
      if (!json.access_token) {
        console.error(json)
        throw new Error('error connecting to Auth0 Management API')
      } else {
        console.log(`received access to management api for domain ${domain}`)
        return json.access_token
      }
    })
  return token
}

async function main () {
  const fromToken = await getManagementToken(from)
  const toToken = await getManagementToken(to)

  // iterate through all users in from manager
  let numUsersFetched = 0
  let totalUsers = Number.POSITIVE_INFINITY
  let page = 0

  while (numUsersFetched < totalUsers) {
    await fetch(
      `https://${from.domain}/api/v2/users?per_page=100&include_totals=true&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${fromToken}`,
          'content-type': 'application/json'
        }
      }
    )
      .then((res) => res.json())
      .then(async (json) => {
        numUsersFetched += json.users.length
        console.log(`fetched ${numUsersFetched} users so far`)
        totalUsers = json.total
        page++
        for (let user of json.users) {
          let shouldCreateInNewApp = false

          // replace all user and app metadata with only the matching from
          // client data and then replace the client id with the to client id
          const metadatas = ['user_metadata', 'app_metadata']
          metadatas.forEach(metadataKey => {
            if (!user[metadataKey]) return
            const metadata = user[metadataKey]
            if (!metadata.datatools) return
            metadata.datatools = metadata.datatools.filter(
              dt => dt.client_id === from.clientId
            )
            if (metadata.datatools.length > 0) {
              shouldCreateInNewApp = true
              metadata.datatools[0].client_id = to.clientId
            }
          })

          if (!shouldCreateInNewApp) continue

          user.password = uuid()
          user.connection = 'Username-Password-Authentication'

          user = omit(
            user,
            [
              'logins_count',
              'last_ip',
              'last_login',
              'last_password_reset',
              'created_at',
              'updated_at',
              'identities',
              'user_id'
            ]
          )

          let createFailed = false
          await fetch(
            `https://${to.domain}/api/v2/users`,
            {
              body: JSON.stringify(user),
              headers: {
                Authorization: `Bearer ${toToken}`,
                'content-type': 'application/json'
              },
              method: 'POST'
            }
          )
            .then(res => {
              if (res.status >= 400) createFailed = true
              return res.json()
            })
            .then(json => {
              if (createFailed) {
                console.error(`created user failed for ${user.email}`)
                console.error(json)
              } else {
                console.log(`created user ${user.email}`)
              }
            })
            .catch(console.error)
        }
      })
  }
}

main()
