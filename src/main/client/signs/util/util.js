export const getFeedsForPermission = (project, user, permission) => {
  return project && project.feedSources ? project.feedSources.filter((feed) => {
    return user.permissions.hasFeedPermission(project.id, feed.id, permission) !== null
  }) : []
}

// ensure list of feeds contains all agency IDs for set of entities
export const checkEntitiesForFeeds = (entities, feeds) => {
  // if (!entities) return true
  // console.log(entities)
  let publishableIds = feeds.map(f => f.id)
  let entityIds = entities.map(e => e.agency.id)
  for (var i = 0; i < entityIds.length; i++) {
    if (publishableIds.indexOf(entityIds[i]) === -1) return false
  }
  return true
}
