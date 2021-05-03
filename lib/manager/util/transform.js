// @flow
import {getComponentMessages} from '../../common/util/config'

import type {
  FeedTransformation,
  FeedVersion
} from '../../types'

/**
 * Returns human readable name
 * for transformation type based on messages defined in
 * english.yml#components.FeedTransformationDescriptions.
 */
export function getTransformationName (type: string) {
  const messages = getComponentMessages('FeedTransformationDescriptions')
  return messages(`${type}.name`)
}

/**
 * Returns human readable description
 * for transformation type based on messages defined in
 * english.yml#components.FeedTransformationDescriptions.
 */
export function getTransformationLabel (
  type: string,
  transformation: FeedTransformation,
  versions?: Array<FeedVersion>
) {
  // Get the base component messages.
  const messages = getComponentMessages('FeedTransformationDescriptions')
  if (type !== transformation['@type']) {
    console.error(`Input feed transformation type (${type}) does not match type found in transformation object`, transformation)
  }
  // Otherwise, build the label/description up piece by piece.
  const {sourceVersionId, table} = transformation
  let label = messages(`${type}.label`)
  // Note: Additional placeholder values can be added to this list and the below
  // switch statement.
  const placeholders = ['filePlaceholder', 'tablePlaceholder', 'versionPlaceholder']
  placeholders.forEach(placeholderId => {
    // Replacement text defaults to the placeholder value.
    let replacementText = messages(`general.${placeholderId}`)
    // But if the respective field has data defined, override the placeholder
    // value below.
    switch (placeholderId) {
      case 'filePlaceholder':
        if (transformation.typeName === 'ReplaceFileFromStringTransformation') {
          if (transformation.csvData) replacementText = messages(`general.fileDefined`)
        }
        break
      case 'tablePlaceholder':
        if (table) replacementText = `${table} ${messages(`general.table`)}`
        break
      case 'versionPlaceholder':
        const version = versions && versions.find(v => v.id === sourceVersionId)
        if (version) replacementText = `${messages(`general.version`)} ${version.version}`
        break
      default:
        console.warn(`No case defined for placeholder field: ${placeholderId}`)
        break
    }
    label = label.replace(`%${placeholderId}%`, replacementText)
  })
  return label
}
