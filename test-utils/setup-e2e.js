const cp = require('child_process')
const fs = require('fs')

/**
 * Start a process that will continue to run after this script ends
 */
function spawnDetachedProcess (cmd, args, name) {
  const processOut = fs.openSync(`./${name}-out.log`, 'w')
  const processErr = fs.openSync(`./${name}-err.log`, 'w')
  console.log(`${cmd} ${args.join(' ')}`)
  const child = cp.spawn(
    cmd,
    args,
    { detached: true, stdio: [ 'ignore', processOut, processErr ] }
  )
  fs.writeFileSync(`${name}.pid`, child.pid)
  child.unref()
}

module.exports = function () {
  return new Promise((resolve, reject) => {
    if (process.env.CI) {
      // create e2e config file with valid auth0 login
      // > configurations/end-to-end/env.yml

      // start client server

      // create config files for client side
      // > configurations/default/env.yml
      // > configurations/default/settings.yml

      // if needed, download, configure and start an instance of datatools-server
      if (process.env.NODE_ENV !== 'server-e2e') {
        // download datatools-server jar

        // create config files for datatools-server
        // > env.yml
        // > settings.yml

        // start datatools-server
      }
    }

    // start e2e coverage server
    spawnDetachedProcess(
      'node',
      ['test-utils/e2e-coverage-collector-server.js'],
      'e2e-coverage-collector-server'
    )

    resolve()
  })
}
