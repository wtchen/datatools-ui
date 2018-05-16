// @flow

export function getTableFatalExceptions (version: any): Array<string> {
  const tableFatalExceptions = []
  for (const key in version.feedLoadResult) {
    if (version.feedLoadResult.hasOwnProperty(key)) {
      const loadItem = version.feedLoadResult[key]
      if (loadItem && loadItem.fatalException) {
        tableFatalExceptions.push({
          tableName: key,
          ...loadItem
        })
        break
      }
    }
  }
  return tableFatalExceptions
}
