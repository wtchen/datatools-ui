export function findProjectByFeedSource (state, feedSourceId) {
  return state.projects.all
    ? state.projects.all.find(p => {
      if (!p.feedSources) {
        return false
      }
      return (p.feedSources.findIndex(fs => fs.id === feedSourceId) !== -1)
    })
    : null
}
