export const isModuleEnabled = (moduleName) => {
  return DT_CONFIG.modules[moduleName] && DT_CONFIG.modules[moduleName].enabled
}

export const isExtensionEnabled = (extensionName) => {
  return DT_CONFIG.extensions[extensionName] && DT_CONFIG.extensions[extensionName].enabled
}
