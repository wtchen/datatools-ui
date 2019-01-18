const NodeEnvironment = require('jest-environment-node')

/**
 * This class does 3 major things.
 *
 * 1) It sets some environment variables that do persist in the rest of the e2e
 *    test script.
 * 2) It runs the setup scripts before the end-to-end test script is ran.
 * 3) It runs the teardown scripts after the end-to-end test script is ran.
 *
 * It is much cleaner to do 2 and 3 in here because the setup and teardown
 * scripts take a while to complete and are setting up the overall environment
 * for the e2e tests which when ran in a CI environment require the starting
 * of various servers.  Also, even if ran locally, collecting coverage requires
 * starting a server as well.
 */
class EndToEndEnvironment extends NodeEnvironment {
  constructor (config) {
    process.env.COLLECT_COVERAGE = true
    super(config)
  }

  async setup () {
    await require('./setup-e2e')()
    await super.setup()
    console.log('finished setting up EndToEndEnvironment')
  }

  async teardown () {
    await require('./teardown-e2e')()
    await super.teardown()
  }

  runScript (script) {
    return super.runScript(script)
  }
}

module.exports = EndToEndEnvironment
