import update from 'react-addons-update'
import clone from 'clone'

import { getFeedId } from '../../common/util/modules'

const signs = (state = {
  isFetching: false,
  all: [],
  entities: [],
  filter: {
    searchText: null,
    filter: 'ALL'
  }
}, action) => {
  let signs, entities
  switch (action.type) {
    case 'SET_SIGN_VISIBILITY_SEARCH_TEXT':
      return update(state, {filter: {searchText: {$set: action.text}}})
    case 'SET_SIGN_VISIBILITY_FILTER':
      return update(state, {filter: {filter: {$set: action.filter}}})
    case 'REQUEST_RTD_SIGNS':
      return {
        isFetching: true,
        all: [],
        filter: {
          searchText: null,
          filter: 'ALL'
        }
      }
    case 'RECEIVED_GTFS_STOPS_AND_ROUTES':
      if (action.module !== 'SIGNS') {
        return state
      }
      entities = state.entities
      signs = clone(state.all)
      // for those entities we requested, assign the gtfs data to the saved entities
      for (let i = 0; i < entities.length; i++) {
        let feed = action.results.feeds.find(f => f.feed_id === entities[i].entity.AgencyId)
        if (feed) {
          let gtfs = entities[i].type === 'stop'
            ? feed.stops.find(s => s.stop_id === entities[i].entity.StopId)
            : entities[i].type === 'route'
            ? feed.routes.find(s => s.route_id === entities[i].entity.RouteId)
            : null
          if (gtfs) {
            gtfs.feed_id = feed.feed_id
          }
          entities[i].gtfs = gtfs
        }
      }
      // iterate over processed gtfs entities
      for (let i = 0; i < entities.length; i++) {
        let ent = entities[i]
        if (ent.gtfs && signs) {
          let sign = signs.find(s => s.id === ent.entity.DisplayConfigurationId)
          let selectedEnt = sign && sign.affectedEntities.find(e => e.agencyAndStop === ent.entity.agencyAndStop)
          if (selectedEnt && ent.type === 'stop') {
            selectedEnt.stop = ent.gtfs
          }
          // route is an array for signs
          if (ent.type === 'route') {
            let route = ent.gtfs ? ent.gtfs : ent.entity
            selectedEnt.route.push(route)
          }
        }
      }

      return {
        isFetching: false,
        all: signs,
        entities: [],
        filter: {
          searchText: null,
          filter: 'ALL'
        }
      }
    case 'RECEIVED_RTD_DISPLAYS':
      if (state.all !== null) {
        let displayMap = {}
        for (let i = 0; i < action.rtdDisplays.length; i++) {
          let d = action.rtdDisplays[i]
          if (!d.DraftDisplayConfigurationId && !d.PublishedDisplayConfigurationId) {
            continue
          }
          if (d.DraftDisplayConfigurationId) {
            if (displayMap[d.DraftDisplayConfigurationId] && displayMap[d.DraftDisplayConfigurationId].findIndex(display => display.Id === d.Id) === -1) {
              displayMap[d.DraftDisplayConfigurationId].push(d)
            } else if (!displayMap[d.DraftDisplayConfigurationId]) {
              displayMap[d.DraftDisplayConfigurationId] = []
              displayMap[d.DraftDisplayConfigurationId].push(d)
            }
          }
          if (d.PublishedDisplayConfigurationId) {
            if (displayMap[d.PublishedDisplayConfigurationId] && displayMap[d.PublishedDisplayConfigurationId].findIndex(display => display.Id === d.Id) === -1) {
              displayMap[d.PublishedDisplayConfigurationId].push(d)
            } else if (!displayMap[d.PublishedDisplayConfigurationId]) {
              displayMap[d.PublishedDisplayConfigurationId] = []
              displayMap[d.PublishedDisplayConfigurationId].push(d)
            }
          }
        }
        let newSigns = state.all.map(s => {
          s.displays = displayMap[s.id] ? displayMap[s.id] : []
          return s
        })
        return update(state, {all: {$set: newSigns}})
      }
      return state
    case 'RECEIVED_RTD_SIGNS':
      const entityList = []
      signs = action.rtdSigns
      for (var i = 0; i < signs.length; i++) {
        let action = signs[i]
        if (typeof action !== 'undefined' && action.DisplayConfigurationDetails && action.DisplayConfigurationDetails.length > 0) {
          for (var j = 0; j < action.DisplayConfigurationDetails.length; j++) {
            let ent = action.DisplayConfigurationDetails[j]
            ent.agencyAndStop = ent.AgencyId + ent.StopId
            if (ent.StopId !== null) {
              entityList.push({type: 'stop', entity: ent, gtfs: {}})
            }
            if (ent.RouteId !== null) {
              entityList.push({type: 'route', entity: ent, gtfs: {}})
            }
          }
        }
      }
      const allSigns = action.rtdSigns.map((rtdSign) => {
        let project = action.activeProject
        let details = rtdSign.DisplayConfigurationDetails || []
        let entities = {}
        for (var i = 0; i < details.length; i++) {
          let ent = details[i]
          let currentEntity = entities[ent.AgencyId + ent.StopId]
          // if entity already exists, push RouteId to existing array
          if (currentEntity) {
            entities[ent.AgencyId + ent.StopId].route_id.push(ent.RouteId)
          } else {
            // else, construct new object for entity
            let feed = project.feedSources.find(f => getFeedId(f) === ent.AgencyId)
            entities[ent.AgencyId + ent.StopId] = {
              id: ent.Id,
              agencyAndStop: ent.AgencyId + ent.StopId
            }
            entities[ent.AgencyId + ent.StopId].agency = feed
            entities[ent.AgencyId + ent.StopId].agency_id = ent.AgencyId
            if (ent.StopId !== null) {
              entities[ent.AgencyId + ent.StopId].stop_id = ent.StopId
              entities[ent.AgencyId + ent.StopId].type = 'STOP'
            }
            if (ent.RouteId !== null) {
              entities[ent.AgencyId + ent.StopId].route_id = []
              entities[ent.AgencyId + ent.StopId].route = []
              entities[ent.AgencyId + ent.StopId].route_id.push(ent.RouteId)
            }
          }
        }
        let sign = {
          id: rtdSign.Id,
          title: rtdSign.ConfigurationDescription,
          editedBy: rtdSign.EditedBy,
          editedDate: rtdSign.EditedDate,
          published: rtdSign.DraftDisplayConfigurationStatus === 'Published',
          affectedEntities: Object.keys(entities).map(key => entities[key])
        }
        return sign
      })
      return {
        isFetching: false,
        all: allSigns,
        entities: entityList,
        filter: {
          searchText: null,
          filter: 'ALL'
        }
      }
    default:
      return state
  }
}

export default signs
