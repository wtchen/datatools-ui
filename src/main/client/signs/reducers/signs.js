import update from 'react-addons-update'
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
  console.log(action)
  let foundIndex
  switch (action.type) {
    case 'SET_SIGN_VISIBILITY_SEARCH_TEXT':
      return update(state, {filter: {searchText: {$set: action.text}}})
    case 'SET_SIGN_VISIBILITY_FILTER':
      return update(state, {filter: {filter: {$set: action.filter}}})

    case 'DELETE_SIGN':
      // foundIndex = state.findIndex(a => a.id === action.sign.id)
      // if(foundIndex !== -1) {
      //   return [
      //     ...state.slice(0, foundIndex),
      //     ...state.slice(foundIndex + 1)
      //   ]
      // }

    case 'REQUEST_RTD_SIGNS':
      return {
        isFetching: true,
        all: [],
        filter: {
          searchText: null,
          filter: 'ALL'
        }
      }
    case 'RECEIVED_SIGN_GTFS_ENTITIES':
      let index = 0
      for (var i = 0; i < action.gtfsObjects.length; i++) {
        let ent = action.gtfsObjects[i]
        // console.log(ent.gtfs)
        if (action.gtfsSigns) {
          let sign = action.gtfsSigns.find(a => a.id === ent.entity.DisplayConfigurationId)
          console.log(sign)
          console.log(ent)
          let selectedEnt =
            sign.affectedEntities.find(e => e.agencyAndStop === ent.entity.agencyAndStop) // ||
            // sign.affectedEntities.find(e => e.agency_id === ent.entity.AgencyId && ent.stop_id === ent.entity.StopId)
          console.log(selectedEnt)
          if (selectedEnt && ent.type === 'stop'){
            selectedEnt.stop = ent.gtfs
          }
          if (ent.type === 'route'){
            let route = ent.gtfs ? ent.gtfs : ent.entity
            selectedEnt.route.push(route)
          }
        }
      }

      return {
        isFetching: false,
        all: action.gtfsSigns,
        entities: [],
        filter: {
          searchText: null,
          filter: 'ALL'
        }
      }
    case 'RECEIVED_RTD_DISPLAYS':
      console.log('got displays', state, action.rtdDisplays)
      // let signIndex = state.all.find
      if (state.all !== null) {
        let displayMap = {}
        let count = 0
        for (var i = 0; i < action.rtdDisplays.length; i++) {
          let d = action.rtdDisplays[i]
          if (!d.DraftDisplayConfigurationId && !d.PublishedDisplayConfigurationId)
            continue
          count++
          console.log(d)
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
        console.log(count)
        console.log('display map', displayMap)
        let newSigns = state.all.map(s => {
          s.displays = displayMap[s.id] ? displayMap[s.id] : []
          return s
        })
        console.log(newSigns)
        return update(state, {all: {$set: newSigns}})
      }
      return state
    case 'RECEIVED_RTD_SIGNS':
      const entityList = []
      console.log(action.rtdSigns)
      let signs = action.rtdSigns
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
      console.log('entityList', entityList)

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
          }
          // else, construct new object for entity
          else {
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
