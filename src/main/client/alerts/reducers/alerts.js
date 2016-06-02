import modes from '../modes'
import update from 'react-addons-update'
import { getFeedId } from '../../common/util/modules'

const alerts = (state = {
  isFetching: false,
  all: [],
  entities: [],
  filter: {
    searchText: null,
    filter: 'ACTIVE'
  }
}, action) => {
  let foundIndex
  switch (action.type) {
    case 'SET_ALERT_VISIBILITY_SEARCH_TEXT':
      return update(state, {filter: {searchText: {$set: action.text}}})
    case 'SET_ALERT_VISIBILITY_FILTER':
      return update(state, {filter: {filter: {$set: action.filter}}})
    case 'SET_ALERT_SORT':
      return update(state, {filter: {sort: {$set: action.sort}}})
    case 'SET_ALERT_AGENCY_FILTER':
      return update(state, {filter: {feedId: {$set: action.feedId}}})
    case 'DELETE_ALERT':

    case 'REQUEST_RTD_ALERTS':
      return {
        isFetching: true,
        all: [],
        filter: {
          searchText: null,
          filter: 'ACTIVE'
        }
      }
    case 'RECEIVED_ALERT_GTFS_ENTITIES':
      let index = 0
      for (var i = 0; i < action.gtfsObjects.length; i++) {
        let ent = action.gtfsObjects[i]
        if (typeof ent.gtfs !== 'undefined'  && action.gtfsAlerts){
          let alert = action.gtfsAlerts.find(a => a.id === ent.entity.AlertId)
          let selectedEnt = alert.affectedEntities.find(e => e.id === ent.entity.Id)
          selectedEnt[ent.type] = ent.gtfs
        }
      }

      return {
        isFetching: false,
        all: action.gtfsAlerts,
        entities: [],
        filter: {
          searchText: null,
          filter: 'ACTIVE'
        }
      }

    case 'RECEIVED_RTD_ALERTS':
      const entityList = []
      console.log(action.rtdAlerts)
      let alerts = action.rtdAlerts
      for (var i = 0; i < alerts.length; i++) {
        let action = alerts[i]
        if (typeof action !== 'undefined' && action.ServiceAlertEntities && action.ServiceAlertEntities.length > 0){

          for (var j = 0; j < action.ServiceAlertEntities.length; j++) {
            let ent = action.ServiceAlertEntities[j]
            if (ent.StopId !== null){
              entityList.push({type: 'stop', entity: ent, gtfs: {}})
            }
            if (ent.RouteId !== null){
              entityList.push({type: 'route', entity: ent, gtfs: {}})
            }
          }
        }
      }
      console.log('entityList', entityList)

      const allAlerts = action.rtdAlerts.map((rtdAlert) => {
        //let activeIndex = action.projects.findIndex(p => p.id == config.activeProjectId)
        let project = action.activeProject // action.projects[activeIndex]

        let alert = {
          id: rtdAlert.Id,
          title: rtdAlert.HeaderText,
          description: rtdAlert.DescriptionText,
          cause: rtdAlert.Cause,
          effect: rtdAlert.Effect,
          editedBy: rtdAlert.EditedBy,
          editedDate: rtdAlert.EditedDate,
          url: rtdAlert.Url,
          start: rtdAlert.StartDateTime*1000,
          end: rtdAlert.EndDateTime*1000,
          published: rtdAlert.Published === "Yes",
          affectedEntities: rtdAlert.ServiceAlertEntities.map((ent) => {
            let entity = {
              id: ent.Id,
            }

            if(ent.AgencyId !== null) {
              let feed = project.feedSources.find(f => getFeedId(f) === ent.AgencyId)
              entity.agency = feed
              entity.type = 'AGENCY'
            }

            // stop goes ahead of route type and route because it's an optional field in the below
            if(ent.StopId !== null) {
              entity.stop_id = ent.StopId
              entity.type = 'STOP'
            }
            if(ent.RouteId !== null) {
              entity.route_id = ent.RouteId
              entity.type = 'ROUTE'
            }

            if(ent.RouteType !== null) {
              let mode = modes.find(m => m.gtfsType === ent.RouteType)

              // catch any integers outside of 0 -7 range
              entity.mode = typeof mode !== 'undefined' ? mode : modes.find(m => m.gtfsType === 0)
              entity.type = 'MODE'
            }



            return entity
          })
        }
        return alert
      })

      return {
        isFetching: false,
        all: allAlerts,
        entities: entityList,
        filter: {
          searchText: null,
          filter: 'ACTIVE'
        }
      }

    default:
      return state
  }
}

export default alerts
