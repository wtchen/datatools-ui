import shpwrite from 'shp-write'

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

const DEFAULT_OPTIONS = {
  folder: 'myshapes',
  types: {
    point: 'mypoints',
    polygon: 'mypolygons',
    line: 'mylines'
  }
}

// Currently does not work for MultiPolygon isochrones
export function downloadAsShapefile (geojson, options = DEFAULT_OPTIONS) {
  shpwrite.download(geojson, options)
}
