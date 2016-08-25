import objectPath from 'object-path'

export const getConfigProperty = (propertyString) => {
  return objectPath.get(window.DT_CONFIG, propertyString)
}

export const getComponentMessages = (componentName) => {
  return objectPath.get(window.DT_CONFIG, ['messages', 'active', componentName]) || {}
}

export const getMessage = (messages, path) => {
  const message = objectPath.get(messages, path)
  return typeof message === 'string' ? message : `{${path}}`
}

export const isModuleEnabled = (moduleName) => {
  return objectPath.get(window.DT_CONFIG, ['modules', moduleName, 'enabled'])
}

export const isExtensionEnabled = (extensionName) => {
  return objectPath.get(window.DT_CONFIG, ['extensions', extensionName, 'enabled'])
}
