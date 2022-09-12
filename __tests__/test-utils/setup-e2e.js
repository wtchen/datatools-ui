const AggregateError = require('aggregate-error')
const fs = require('fs-extra')
const fetch = require('isomorphic-fetch')

const {
  collectingCoverage,
  getTestFolderFilename,
  spawnDetachedProcess
} = require('./utils')

/**
 * delete and recreate test results folder
 */
function recreateEndToEndTestResultDirectory () {
  const testFolderFilename = getTestFolderFilename()
  fs.removeSync(testFolderFilename)
  fs.ensureDirSync(testFolderFilename)
}

/**
 * Verifies that the needed items in order to run the e2e tests locally have
 * been setup properly.
 */
async function verifySetupForLocalEnvironment () {
  const errors = []

  // make sure services are running
  const endpointChecks = [
    {
      name: 'Front-end server',
      url: 'http://datatools-ui:9966'
    }, {
      name: 'Back-end server',
      url: 'http://datatools-server:4000'
    }, {
      name: 'OTP server',
      url: 'http://datatools-server:8080'
    }
  ]

  // Make sure that certain e2e folders have permissions (assumes running on Linux/MacOS).
  const desiredMode = 0o2777
  await fs.ensureDir('/tmp/otp', desiredMode) // For otp-runner manifest files
  await fs.ensureDir('/tmp/otp/graphs', desiredMode) // For OTP graph
  await fs.ensureDir('/var/log', desiredMode) // For otp-runner log
  await fs.ensureDir('/opt/otp', desiredMode) // For OTP jar referenced by otp-runner

  await Promise.all(
    endpointChecks.map(
      endpoint => (
        // return an executed promise
        async () => {
          try {
            const fetchResult = await fetch(endpoint.url)
            if (fetchResult.status >= 400) {
              throw new Error('Bad response')
            }
          } catch (e) {
            errors.push(
              new Error(
                `Unable to fetch from ${endpoint.name} (${endpoint.url})`
              )
            )
          }
        }
      )()
    )
  )

  // TODO: verify that aws credentials have been setup properly

  if (errors.length > 0) {
    throw new AggregateError(errors)
  }
}

/**
 * Start a server to collect coverage from the e2e tests.
 */
function startCoverageServer () {
  return new Promise((resolve, reject) => {
    console.log('starting coverage server')

    try {
      spawnDetachedProcess(
        'node',
        ['__tests__/test-utils/e2e-coverage-collector-server.js'],
        'e2e-coverage-collector-server'
      )
    } catch (e) {
      console.error(`error starting coverage server: ${e}`)
      return reject(e)
    }

    console.log('successfully started coverage server')
    resolve()
  })
}

/**
 * Perform all needed actions to get the current environment ready for
 * performing the e2e tests. This is called from the e2e-environment.js.
 */
module.exports = async function () {
  // syncrhonously recreate the test results directory in to avoid race
  // conditions
  recreateEndToEndTestResultDirectory()

  // do different setup depending on runtime environment
  const setupItems = []
  setupItems.push(verifySetupForLocalEnvironment())
  if (collectingCoverage) setupItems.push(startCoverageServer())

  return Promise.all(setupItems)
    .catch(e => {
      console.error(`e2e setup failed! ${e}`)
      throw e
    })
}
