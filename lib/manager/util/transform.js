// @flow
import toSentenceCase from '../../common/util/to-sentence-case'

import type {FeedTransformation, FeedVersion} from '../../types'

/**
 * Returns human readable name for transformation type.
 */
export function getTransformationName (
  type: string,
  transformation?: FeedTransformation,
  versions?: Array<FeedVersion>
) {
  let name = type
    // Remove transformation from name.
    .replace('Transformation', '')
    // Regex finds/captures words in camel case string and splits camel-cased words.
    // Derived from: https://stackoverflow.com/a/18379358/915811
    .replace(/([a-z])([A-Z])/g, '$1 $2')
  name = toSentenceCase(name)
  // Contextualize name if transformation is provided.
  if (transformation) {
    const {csvData, table, sourceVersionId} = transformation
    const stringText = csvData ? `below text` : '[insert text]'
    name = name.replace('string', stringText)
    const tableText = table ? `${table} file` : '[choose table]'
    name = name.replace('file', tableText)
    if (versions) {
      const version = versions.find(v => v.id === sourceVersionId)
      const versionText = version ? `version ${version.version}` : '[choose version]'
      name = name.replace('version', versionText)
    }
  }
  return name
}
