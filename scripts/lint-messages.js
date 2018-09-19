// @flow

const fs = require('fs')
const path = require('path')

const safeLoad = require('js-yaml').safeLoad
const objectPath = require('object-path')

let atLeastOneErrorFound = false
const foundMessages = {}
const messages = {}

// read in language data
const languages = fs.readdirSync('i18n')
languages.forEach(langFile => {
  // $FlowFixMe not sure why there's an error here
  messages[langFile] = safeLoad(fs.readFileSync(path.join('i18n', langFile)))
})

/**
 * Recursively explore a directory looking for .js files to analyze
 */
function exploreDir (filePath) {
  fs.readdirSync(filePath).forEach(fileOrFolder => {
    const fileOrFolderPath = path.join(filePath, fileOrFolder)
    const stats = fs.statSync(fileOrFolderPath)
    if (stats.isDirectory()) {
      exploreDir(fileOrFolderPath)
    } else if (fileOrFolder.indexOf('.js') > -1) {
      analyzeFile(fileOrFolderPath)
    }
  })
}

/**
 * Analyze a .js file to check for messages
 */
function analyzeFile (filePath) {
  const classRegex = /class (\w*) extends MessageComponent/gm
  const contents = fs.readFileSync(filePath, { encoding: 'utf8' }).split('\n')
  let curClass
  let lineIdx = 0
  contents.forEach(line => {
    lineIdx++

    // find a MessageComponent class
    const classMatch = classRegex.exec(line)
    if (classMatch) {
      curClass = classMatch[1]
      return
    }

    // look for a message
    if (curClass) {
      const messageIndex = line.indexOf('this.messages(')
      if (messageIndex > -1) {
        // determine what the message path is
        // if the first character is not ' or ` it's a variable
        const firstChar = line[messageIndex + 14]
        if (firstChar === "'") {
          // isolate string so regex doesn't pick up anything before
          const message = line.substring(
            messageIndex + 15,
            line.indexOf(firstChar, messageIndex + 16)
          )
          objectPath.set(foundMessages, `${curClass}.${message}`, true)
        } else {
          // TODO: analyze some kind of comment outlining message possibilities
          console.warn(
            `unable to determine message object path from variable or template string in file ${filePath} on line ${lineIdx}`
          )
        }
      }
    }
  })
}

// iterate through files and tally up what was found and what wasn't
exploreDir('lib')

// analyze differences of messages in language files
Object.keys(messages).forEach(langFile => {
  const langMessages = messages[langFile]

  function reconcileObject (obj, pathSoFar) {
    Object.keys(obj).forEach(key => {
      const nextPath = pathSoFar ? `${pathSoFar}.${key}` : key
      if (typeof obj[key] === 'string') {
        Object.keys(messages)
          .filter(compareLangFile => compareLangFile !== langFile)
          .forEach(compareLangFile => {
            const compareLangMessages = messages[compareLangFile]['components']
            if (obj[key] === objectPath.get(compareLangMessages, nextPath)) {
              // FIXME: make this cause an error once variables and
              // template strings are accounted for
              console.warn(`WARNING: message ${nextPath} in ${langFile} is the same as the message in ${compareLangFile}`)
            }
          })
      } else {
        reconcileObject(obj[key], nextPath)
      }
    })
  }

  reconcileObject(langMessages['components'])
})

// analyze what defined messages in the language files were found and which were not
Object.keys(messages).forEach(langFile => {
  const langMessages = messages[langFile]

  function reconcileObject (obj, pathSoFar) {
    Object.keys(obj).forEach(key => {
      const nextPath = pathSoFar ? `${pathSoFar}.${key}` : key
      if (typeof obj[key] === 'string') {
        if (!objectPath.get(foundMessages, nextPath)) {
          // FIXME: make this cause an error once variables and
          // template strings are accounted for
          console.warn(`WARNING: message ${nextPath} in ${langFile} not found in any .js files`)
        }
      } else {
        reconcileObject(obj[key], nextPath)
      }
    })
  }

  reconcileObject(langMessages['components'])
})

// analyze which messages found in the .js files were found or not in the language files
function reconcileFoundObject (obj, pathSoFar) {
  Object.keys(obj).forEach(key => {
    const nextPath = pathSoFar ? `${pathSoFar}.${key}` : key
    if (typeof obj[key] === 'boolean') {
      Object.keys(messages).forEach(langFile => {
        const langMessages = messages[langFile]['components']
        if (!objectPath.get(langMessages, nextPath)) {
          atLeastOneErrorFound = true
          console.error(`ERROR: message ${nextPath} not defined in language file ${langFile}`)
        }
      })
    } else {
      reconcileFoundObject(obj[key], nextPath)
    }
  })
}

reconcileFoundObject(foundMessages)

if (atLeastOneErrorFound) {
  process.exit(2)
} else {
  console.log('no errors found with messages!')
}
