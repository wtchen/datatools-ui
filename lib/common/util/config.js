// @flow

import objectPath from 'object-path'

import type {ExtensionType, GtfsPlusTable, ModuleType} from '../../types'
import type {GtfsPlusTable} from '../../types'

export function getConfigProperty (propertyString: string): ?any {
  return objectPath.get(window.DT_CONFIG, propertyString)
}

export function getGtfsSpec (): Array<any> {
  return window.DT_CONFIG.modules.editor.spec
}

export function getGtfsPlusSpec (): Array<GtfsPlusTable> {
  return window.DT_CONFIG.modules.gtfsplus.spec
}

/**
 * Create a function to lookup and return a message within a particular component.
 * This function must be called after the config has been initialized.
 */
export function getComponentMessages (componentName: string): string => string {
  const componentMessages = (
    objectPath.get(window.DT_CONFIG, ['messages', 'active', 'components', componentName]) ||
    {}
  )
  return (path: string) => {
    const message = objectPath.get(componentMessages, path)
    if (typeof message === 'string') {
      return message
    } else {
      console.warn(`Couldn't find message entry for ${componentName}.${path}`)
      return `{${path}}`
    }
  }
}

export function isModuleEnabled (moduleName: ModuleType): boolean {
  return !!(
    objectPath.get(window.DT_CONFIG, ['modules', moduleName, 'enabled'])
  )
}

export function isExtensionEnabled (extensionName: ExtensionType): boolean {
  return !!(
    objectPath.get(window.DT_CONFIG, ['extensions', extensionName, 'enabled'])
  )
}

function initializeConfig () {
  if (!process.env.SETTINGS) {
    throw new Error('SETTINGS environment variable not set')
  }
  const config = JSON.parse(process.env.SETTINGS)
  if (config.modules.gtfsplus && config.modules.gtfsplus.enabled) {
    // $FlowFixMe - assume file exists and make flow happy
    config.modules.gtfsplus.spec = require('../../../gtfsplus.yml')
  }
  // $FlowFixMe - assume file exists and make flow happy
  config.modules.editor.spec = require('../../../gtfs.yml')

  const languages = [
    // $FlowFixMe - assume file exists and make flow happy
    require('../../../i18n/english.yml'),
    // $FlowFixMe - assume file exists and make flow happy
    require('../../../i18n/espanol.yml'),
    // $FlowFixMe - assume file exists and make flow happy
    require('../../../i18n/francais.yml')
  ]

  // For some weird reason that probably has to do with how yaml files are
  // required in the test environment, the message files are stored with an
  // object key that contains the full path. Therefore, do a little hack to
  // fix this.
  // TODO: change this in mastarm?
  if (process.env.NODE_ENV === 'test') {
    languages.forEach(lang => {
      Object.keys(lang).forEach(key => {
        if (key.indexOf('.') > -1) {
          objectPath.set(lang, key, lang[key])
        }
      })
    })
  }

  // is an array containing all the matching modules
  config.messages = {}
  config.messages.all = languages
  const languageId = window.localStorage.getItem('lang')
    ? window.localStorage.getItem('lang')
    : navigator.language

  config.messages.active =
    languages.find(l => l._id === languageId) ||
      languages.find(l => l._id === 'en-US')

  // console.log('config', config)
  window.DT_CONFIG = config
}

initializeConfig()
