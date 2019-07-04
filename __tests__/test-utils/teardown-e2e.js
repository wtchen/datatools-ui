const fs = require('fs')
const path = require('path')

const archiver = require('archiver')
const each = require('async-each')
const extractZip = require('extract-zip')
const fetch = require('isomorphic-fetch')
const createPushToS3 = require('mastarm/lib/push-to-s3')
const Slack = require('slack')

const {
  collectingCoverage,
  downloadFile,
  getTestFolderFilename,
  isCi,
  isUiRepo,
  killDetachedProcess,
  promisifiedKillDetachedProcess
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
    const coverageReportFilename = getTestFolderFilename('e2e-coverage.zip')
    downloadFile(
      'http://localhost:9999/coverage/download',
      coverageReportFilename,
      (err) => {
        if (err) {
          console.error(`Error downloading coverage: ${err}`)
          return stopCoverageServer(handleCoverageServerStop(reject))
        }

        // unzip the coverage report once it's done downloading
        console.log('Extracting coverage report')
        extractZip(
          coverageReportFilename,
          {dir: path.join(process.cwd(), 'coverage-e2e')},
          (err) => {
            if (err) {
              console.error(`error unzipping coverage report: ${err}`)
              return stopCoverageServer(handleCoverageServerStop(reject))
            }
            fs.unlink(coverageReportFilename, err => {
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

  return promisifiedKillDetachedProcess('datatools-server')
}

/**
 * Stub for shutting down a client if needed
 */
function shutdownClient () {
  if (!isCi) return Promise.resolve()

  return promisifiedKillDetachedProcess('client-dev-server')
}

/**
 * Stub for shutting down a client if needed
 */
function shutdownOtp () {
  if (!isCi) return Promise.resolve()

  return promisifiedKillDetachedProcess('otp')
}

/**
 * Search for all *.log files, zip them up and then upload them to a defined
 * slack channel (if defined)
 */
function uploadLogs () {
  const slackConfigured = process.env.SLACK_TOKEN && process.env.SLACK_CHANNEL
  const msTeamsConfigured = process.env.MS_TEAMS_WEBHOOK_URL
  if (!(slackConfigured || msTeamsConfigured)) {
    console.warn('Log upload environment variables undefined, not uploading logs anywhere!')
    return
  }

  const logsZipfile = 'logs.zip'
  const repo = process.env.TRAVIS_BUILD_DIR.split(path.sep).pop()
  const buildNum = process.env.TRAVIS_BUILD_NUMBER
  const uploadedLogsFilename = `${repo}-build-${buildNum}-e2e-logs.zip`
  const testResults = require(path.resolve(`./${getTestFolderFilename('results.json')}`))

  const output = fs.createWriteStream(logsZipfile)
  const archive = archiver('zip')

  function makeUploadFailureHandler (handlerErrorMsg) {
    return (err) => {
      console.error(handlerErrorMsg)
      console.error(`failed to upload logs due to error: ${err}`)
    }
  }

  function uploadToMicrosoftTeams (teamsCallback) {
    if (!msTeamsConfigured) {
      teamsCallback()
    }

    function sendCard (s3uploadSuccessfull) {
      console.log('posting message to MS Teams')
      const actions = [{
        '@type': 'OpenUri',
        name: `View Travis Build #${buildNum}`,
        targets: [
          {
            os: 'default',
            uri: process.env.TRAVIS_BUILD_WEB_URL
          }
        ]
      }]

      if (s3uploadSuccessfull) {
        actions.push({
          '@type': 'OpenUri',
          name: 'Download Logs',
          targets: [
            {
              os: 'default',
              uri: 'https://docs.microsoft.com/outlook/actionable-messages'
            }
          ]
        })
      }

      fetch(
        process.env.MS_TEAMS_WEBHOOK_URL,
        {
          method: 'POST',
          body: JSON.stringify({
            '@context': 'https://schema.org/extensions',
            '@type': 'MessageCard',
            themeColor: '0072C6',
            title: `${repo} e2e test ${testResults.success ? 'passed. ✅' : 'failed. ❌'}`,
            text: `${testResults.numPassedTests} / ${testResults.numTotalTests} tests passed`,
            potentialAction: actions
          })
        }
      )
        .then(res => {
          if (res.status >= 400) {
            return teamsCallback(new Error('Post to MS Teams failed!'))
          }
          console.log('successfully posted to MS Teams')
          teamsCallback()
        })
        .catch(e => {
          console.error('Failed to post to MS Teams: ', e)
          teamsCallback(e)
        })
    }

    // upload logs to s3
    if (process.env.S3_BUCKET) {
      createPushToS3({ s3bucket: process.env.S3_BUCKET })(
        {
          body: fs.readFileSync(logsZipfile),
          outfile: uploadedLogsFilename
        }
      )
        .then(() => {
          console.log('successfully uploaded to s3')
          sendCard(true)
        })
        .catch(e => {
          console.error('Failed to upload logs to s3: ', e)
          sendCard(false)
        })
    } else {
      sendCard(false)
    }
  }

  function uploadToSlack (slackCallback) {
    if (!slackConfigured) {
      // environment variables not defined right to upload, so callback with
      // success as there is nothing to do
      slackCallback()
    }
    const slack = new Slack({ token: process.env.SLACK_TOKEN })

    console.log('uploading log zipfiles to slack')
    slack.files.upload(
      {
        channels: process.env.SLACK_CHANNEL,
        file: fs.createReadStream(logsZipfile),
        filename: uploadedLogsFilename,
        filetype: 'zip',
        initial_comment: `View build logs here: ${process.env.TRAVIS_BUILD_WEB_URL}`
      },
      err => {
        if (err) return slackCallback(err)

        console.log('successfully uploaded logs to slack')
        slackCallback()
      }
    )
  }

  // handle errors if they happen
  archive.on(
    'error',
    makeUploadFailureHandler('An error occurred while archiving')
  )
  output.on(
    'error',
    makeUploadFailureHandler('An error occurred while writing the zip file')
  )

  output.on('close', () => {
    console.log(`Successfully zipped ${archive.pointer()} total bytes`)
    each(
      [uploadToSlack, uploadToMicrosoftTeams],
      (uploader, uploaderCallback) => uploader(uploaderCallback),
      err => {
        if (err) {
          return makeUploadFailureHandler(
            'An error occurred while uploading the logs'
          )(err)
        }

        console.log('successfully uploaded logs')
      }
    )
  })

  archive.pipe(output)

  // glob all log files in cwd into zip
  archive.glob('./*.log')
  // glob all png files (e2e error screenshots) into zip
  archive.glob('./e2e-error-*.png')
  archive.finalize()
}

module.exports = function () {
  // upload the logs after teardown completes because the json results are not
  // written by Jest until after teardown 'completes'
  process.nextTick(() => {
    setTimeout(() => {
      uploadLogs()
    }, 3333)
  })
  return Promise.all([
    collectCoverageAndStopSever(),
    shutdownDatatoolsServer(),
    shutdownClient(),
    shutdownOtp()
  ])
}
