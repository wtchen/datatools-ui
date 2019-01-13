const {exec} = require('child_process')
const fs = require('fs')
const path = require('path')

const extractZip = require('extract-zip')
const request = require('request')

/**
 * Helper to find and kill a process
 */
function killDetachedProcess (processName, callback) {
  const pidFilename = `${processName}.pid`

  // open pid file to get pid
  fs.readFile(pidFilename, (err, data) => {
    if (err) {
      console.error(`pid file ${pidFilename} could not be read!`)
      return callback(err)
    }

    // attempt to kill process running with pid
    const cmd = `kill ${data}`
    console.log(cmd)
    exec(cmd, err => {
      if (err) {
        console.error(`pid ${data} could not be killed!`)
        return callback(err)
      }

      console.log('Kill command successful')

      // delete pid file
      fs.unlink(pidFilename, err => {
        if (err) {
          console.error(`pid file ${pidFilename} could not be deleted!`)
          return callback(err)
        }
        callback()
      })
    })
  })
}

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
    const reportStream = request('http://localhost:9999/coverage/download')
      .pipe(fs.createWriteStream('e2e-coverage.zip'))

    // handle any error occurred while downloading coverage report
    console.log('Extracting coverage report')
    reportStream.on('error', (err) => {
      console.error(`Error downloading coverage: ${err}`)
      stopCoverageServer(handleCoverageServerStop(reject))
    })

    // unzip the coverage report once it's done downloading
    reportStream.on('finish', () => {
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
    })
  })
}

/**
 * Stub for shutting down a datatools-server instance if needed
 */
function shutdownDatatoolsServer () {
  return Promise.resolve()
}

/**
 * Stub for shutting down a client if needed
 */
function shutdownClient () {
  return Promise.resolve()
}

module.exports = function () {
  return Promise.all([
    collectCoverageAndStopSever(),
    shutdownDatatoolsServer(),
    shutdownClient()
  ])
}
