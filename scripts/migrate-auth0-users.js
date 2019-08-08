/**
 * A script that will read all users from one Auth0 tenant and create new users
 * in another Auth0 tenant. The existing users' metadata will be ready and only
 * those users with a matching datatools client_id will be copied over. The new
 * users will have new passwords set, so the users will have to reset their
 * passwords to regain access.
 *
 * Two config files are required for this to work. The `from-client.json` will
 * contain information for machine-to-machine connections and the existing
 * client application id that users should have in their metadata. The
 * `to-client.json` file should have information for machine-to-machine
 * connections and the client application id that will replace to old
 * applicaiton client id in their metadata. Each of these files should have the
 * following format:
 *
 * {
 *   "apiClient": "SECRET",
 *   "apiSecret": "SECRET",
 *   "domain": "SECRET.auth0.com",
 *   "clientId": "SECRET"
 * }
 *
 * To run the script, open a cli and type `node migrate-auth0-users.js`
 */

const fetch = require('isomorphic-fetch')
const omit = require('lodash/omit')
const uuid = require('uuid/v4')

// load required config files
const from = require('./from-client.json')
const to = require('./to-client.json')

/**
 * Get a Management API token using machine-to-machine credentials.
 */
async function getManagementToken (connectionSettings) {
  const { apiClient, apiSecret, domain } = connectionSettings

  // make request to auth0 to get a token
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
        // Encountered a problem authenticating with API, raise error
        console.error(json)
        throw new Error('error authenticating with Auth0 Management API')
      } else {
        // Authentication successful
        console.log(`received access to management api for domain ${domain}`)
        return json.access_token
      }
    })
  return token
}

async function main () {
  // get management tokens for both from and to tenants
  const fromToken = await getManagementToken(from)
  const toToken = await getManagementToken(to)

  // iterate through all users in from manager
  let numUsersFetched = 0
  let totalUsers = Number.POSITIVE_INFINITY
  let page = 0

  while (numUsersFetched < totalUsers) {
    // get a batch of 100 users (a limit imposed by auth0)
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
        // update the progress of fetching users
        numUsersFetched += json.users.length
        console.log(`fetched ${numUsersFetched} users so far`)
        totalUsers = json.total
        page++

        // iterate through fetched users
        for (let user of json.users) {
          // only users that have a matching clientId should be created in the
          // new tenant, so assume they shouldn't be created until finding a
          // match
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

          // no match found, continue to the next user in the current batch
          if (!shouldCreateInNewApp) continue

          // can't copy over passwords, so set the password of the copied user
          // as a UUID so that it's extremely unlikely for some random person
          // to guess the password. The user will have to reset their password
          // to gain access.
          user.password = uuid()

          // add required connection name (this is the default value created
          // by Auth0, so it could theoretically be different.)
          user.connection = 'Username-Password-Authentication'

          // omit items that will cause the creation to fail or cause weirdness
          // in new data values
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

          // make request to create user in to tenant
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
              // check if request succeeded
              if (res.status >= 400) createFailed = true
              return res.json()
            })
            .then(json => {
              if (createFailed) {
                // althought the creation failed, don't raise an error as most
                // of the time this was caused by the user already existing
                console.error(`created user failed for ${user.email}`)
                console.error(json)
              } else {
                // user creation successful!
                console.log(`created user ${user.email}`)
              }
            })
            .catch(console.error)
        }
      })
  }
}

main()
