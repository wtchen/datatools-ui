const {exec, spawn} = require('child_process')
const fs = require('fs')

const {safeDump, safeLoad} = require('js-yaml')
const request = require('request')

const collectingCoverage = process.env.COLLECT_COVERAGE
const isCi = !!process.env.CI
const isUiRepo = process.env.TRAVIS_REPO_SLUG === 'conveyal/datatools-ui'

/**
 * Download a file using a stream
 */
function downloadFile (url, filename, callback) {
  console.log(`downloading file: ${url}`)
  const dlStream = request(url).pipe(fs.createWriteStream(filename))

  let callbackCalled = false

  // handle any error occurred while downloading file
  dlStream.on('error', (err) => {
    console.error(`Error downloading from: ${url}.  Error: ${err}`)
    callbackCalled = true
    if (!callbackCalled) callback(err)
  })

  dlStream.on('finish', () => {
    if (!callbackCalled) {
      callbackCalled = true
      console.log(`successfully downloaded file: ${filename}`)
      callback()
    }
  })
}

/**
 * Find and kill a process
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
        console.error(`pid ${data} (${processName}) could not be killed!`)
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
 * Load yaml from a file into a js object
 */
function loadYamlFile (filename, callback) {
  fs.readFile(filename, (err, data) => {
    if (err) return callback(err)
    try {
      callback(null, safeLoad(data))
    } catch (e) {
      callback(e)
    }
  })
}

function promisifiedKillDetachedProcess (processName) {
  return new Promise((resolve, reject) => {
    console.log(`stopping ${processName}`)
    killDetachedProcess(`${processName}`, err => {
      if (err) return reject(err)
      resolve()
    })
  })
}

/**
 * Make sure certain environment variables are definted
 */
function requireEnvVars (varnames) {
  const undefinedVars = []
  varnames.forEach(varname => {
    if (!process.env[varname]) {
      undefinedVars.push(varname)
    }
  })
  if (undefinedVars.length > 0) {
    throw new Error(`Required environment variables missing: ${undefinedVars.join(', ')}`)
  }
}

/**
 * Start a process that will continue to run after this script ends
 */
function spawnDetachedProcess (cmd, args, name) {
  const processOut = fs.openSync(`./${name}-out.log`, 'w')
  const processErr = fs.openSync(`./${name}-err.log`, 'w')
  const child = spawn(
    cmd,
    args,
    { detached: true, stdio: [ 'ignore', processOut, processErr ] }
  )
  console.log(`${cmd} ${args.join(' ')} running as pid ${child.pid}`)
  fs.writeFileSync(`${name}.pid`, child.pid)
  child.unref()
}

/**
 * Write a js object into a yaml formatted file
 */
function writeYamlFile (filename, obj, callback) {
  fs.writeFile(filename, safeDump(obj), callback)
}

module.exports = {
  collectingCoverage,
  downloadFile,
  isCi,
  isUiRepo,
  killDetachedProcess,
  loadYamlFile,
  promisifiedKillDetachedProcess,
  requireEnvVars,
  spawnDetachedProcess,
  writeYamlFile
}
