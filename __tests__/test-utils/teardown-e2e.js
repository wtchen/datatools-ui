const fs = require('fs')
const path = require('path')

const extractZip = require('extract-zip')

const {
  collectingCoverage,
  downloadFile,
  isCi,
  isUiRepo,
  killDetachedProcess
} = require('./utils')

/**
 * Function to kill the coverage server
 */
function stopCoverageServer (callback) {
  console.log('Killing coverage collector server')
  killDetachedProcess('e2e-coverage-collector-server', callback)
}

/**
 * download e2e coverage results and then shut down e2e coverage server
 */
function collectCoverageAndStopSever () {
  if (!collectingCoverage) return Promise.resolve()

  return new Promise((resolve, reject) => {
    /**
     * Helper to perform a promise fulfillment after stopping the coverage server
     */
    function handleCoverageServerStop (actionAfterSuccessfulStop) {
      return (err) => {
        if (err) {
          console.error(`An error occurred while trying to stop the coverage server: ${err}`)
          return reject(err)
        }
        console.log('Coverage collector server killed successfully')
        actionAfterSuccessfulStop()
      }
    }

    // download and save coverage report
    console.log('Downloading coverage report')
    downloadFile(
      'http://localhost:9999/coverage/download',
      'e2e-coverage.zip',
      (err) => {
        if (err) {
          console.error(`Error downloading coverage: ${err}`)
          return stopCoverageServer(handleCoverageServerStop(reject))
        }

        // unzip the coverage report once it's done downloading
        console.log('Extracting coverage report')
        extractZip(
          'e2e-coverage.zip',
          {dir: path.join(process.cwd(), 'coverage-e2e')},
          (err) => {
            if (err) {
              console.error(`error unzipping coverage report: ${err}`)
              return stopCoverageServer(handleCoverageServerStop(reject))
            }
            fs.unlink('e2e-coverage.zip', err => {
              if (err) console.error(`Error deleting coverage zip file: ${err}`)
            })
            stopCoverageServer(handleCoverageServerStop(resolve))
          }
        )
      }
    )
  })
}

/**
 * Stub for shutting down a datatools-server instance if needed
 */
function shutdownDatatoolsServer () {
  if (!isCi || !isUiRepo) return Promise.resolve()

  return new Promise((resolve, reject) => {
    console.log('stopping datatools-server')
    killDetachedProcess('datatools-server', err => {
      if (err) return reject(err)
      resolve()
    })
  })
}

/**
 * Stub for shutting down a client if needed
 */
function shutdownClient () {
  if (!isCi) return Promise.resolve()

  return new Promise((resolve, reject) => {
    console.log('stopping client dev server')
    killDetachedProcess('client-dev-server', err => {
      if (err) return reject(err)
      resolve()
    })
  })
}

module.exports = function () {
  return Promise.all([
    collectCoverageAndStopSever(),
    shutdownDatatoolsServer(),
    shutdownClient()
  ])
}
