import modes from '../modes'

const signs = (state = {
  isFetching: false,
  all: [],
  entities: []
}, action) => {
  let foundIndex
  switch (action.type) {
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
        all: []
      }
    case 'RECEIVED_GTFS_ENTITIES':
      let index = 0
      for (var i = 0; i < action.gtfsObjects.length; i++) {
        let ent = action.gtfsObjects[i]
        if (typeof ent.gtfs !== 'undefined' && action.gtfsSigns) {
          let sign = action.gtfsSigns.find(a => a.id === ent.entity.SignId)
          let selectedEnt = sign.affectedEntities.find(e => e.id === ent.entity.Id)
          selectedEnt[ent.type] = ent.gtfs
        }
      }

      return {
        isFetching: false,
        all: action.gtfsSigns,
        entities: []
      }

    case 'RECEIVED_RTD_SIGNS':
      const entityList = []
      console.log(action.rtdSigns)
      let signs = action.rtdSigns
      for (var i = 0; i < signs.length; i++) {
        let action = signs[i]
        if (typeof action !== 'undefined' && action.SignEntities && action.SignEntities.length > 0) {

          for (var j = 0; j < action.SignEntities.length; j++) {
            let ent = action.SignEntities[j]
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

        let sign = {
          id: rtdSign.Id,
          title: rtdSign.ConfigurationDescription,
          // description: rtdSign.ConfigurationDescription,
          editedBy: rtdSign.EditedBy,
          editedDate: rtdSign.EditedDate,
          published: rtdSign.DraftDisplayConfigurationStatus === 'Published',
          affectedEntities: rtdSign.DisplayConfigurationDetails.map((ent) => {
            let entity = {
              id: ent.Id
            }

            if (ent.AgencyId !== null) {
              let feed = project.feedSources.find(f => f.externalProperties.MTC.AgencyId === ent.AgencyId)
              entity.agency = feed
              entity.type = 'AGENCY'
            }
            // stop goes ahead of route type and route because it's an optional field in the below
            if (ent.StopId !== null) {
              entity.stop_id = ent.StopId
              entity.type = 'STOP'
            }
            if (ent.RouteId !== null) {
              entity.route_id = ent.RouteId
              entity.type = 'ROUTE'
            }
            return entity
          })
        }
        return sign
      })

      return {
        isFetching: false,
        all: allSigns,
        entities: entityList
      }

    default:
      return state
  }
}

export default signs
