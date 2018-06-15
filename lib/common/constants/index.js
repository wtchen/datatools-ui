// @flow
const SECURE: string = 'secure/'
export const API_PREFIX: string = `/api/manager/`
export const SECURE_API_PREFIX: string = `${API_PREFIX}${SECURE}`
// TODO: move GTFS_API_PREFIX to gtfs sub path
// export const GTFS_API_PREFIX: string = `${API_PREFIX}gtfs/`
export const GTFS_API_PREFIX: string = `${API_PREFIX}`
export const GTFS_GRAPHQL_PREFIX: string = `${SECURE_API_PREFIX}gtfs/graphql`
export const EDITOR_PREFIX: string = `/api/editor/`
export const SECURE_EDITOR_PREFIX: string = `${EDITOR_PREFIX}${SECURE}`
