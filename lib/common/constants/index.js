// @flow

import type {RetrievalMethod} from '../../types'

const SECURE: string = 'secure/'
export const API_PREFIX: string = `/api/manager/`
export const SECURE_API_PREFIX: string = `${API_PREFIX}${SECURE}`
export const GTFS_GRAPHQL_PREFIX: string = `${SECURE_API_PREFIX}gtfs/graphql`
export const EDITOR_PREFIX: string = `/api/editor/`
export const SECURE_EDITOR_PREFIX: string = `${EDITOR_PREFIX}${SECURE}`
export const DEFAULT_DESCRIPTION = 'A command center for managing, editing, validating, and deploying GTFS.'
export const DEFAULT_LOGO = 'https://d2tyb7byn1fef9.cloudfront.net/ibi_group_black-512x512.png'
export const DEFAULT_LOGO_SMALL = 'https://d2tyb7byn1fef9.cloudfront.net/ibi_group-128x128.png'
export const DEFAULT_TITLE = 'Data Tools'

export const RETRIEVAL_METHODS: Array<RetrievalMethod> = [
  'MANUALLY_UPLOADED',
  'FETCHED_AUTOMATICALLY',
  'PRODUCED_IN_HOUSE',
  'SERVICE_PERIOD_MERGE',
  'REGIONAL_MERGE',
  'VERSION_CLONE'
]
