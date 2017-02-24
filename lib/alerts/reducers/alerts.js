import clone from 'clone'
import mergeable from 'redux-merge-reducers'

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
  let alerts, entities
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
    case 'RECEIVED_GTFS_STOPS_AND_ROUTES':
      if (action.module !== 'ALERTS') {
        return state
      }
      entities = state.entities
      alerts = clone(state.all)
      // for those entities we requested, assign the gtfs data to the saved entities
      for (var i = 0; i < entities.length; i++) {
        const feed = action.results.feeds.find(f => f.feed_id === entities[i].entity.AgencyId)
        if (feed) {
          const gtfs = entities[i].type === 'stop'
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
        const ent = entities[i]
        if (ent.gtfs && alerts) {
          const alert = alerts.find(a => a.id === ent.entity.AlertId)
          const selectedEnt = alert.affectedEntities.find(e => e.id === ent.entity.Id)
          selectedEnt[ent.type] = ent.gtfs
        }
      }

      return {
        isFetching: false,
        all: alerts,
        entities: [],
        filter: {
          searchText: null,
          filter: 'ACTIVE'
        }
      }

    case 'RECEIVED_RTD_ALERTS':
      const entityList = []
      alerts = action.rtdAlerts
      for (let i = 0; i < alerts.length; i++) {
        const action = alerts[i]
        if (typeof action !== 'undefined' && action.ServiceAlertEntities && action.ServiceAlertEntities.length > 0) {
          for (var j = 0; j < action.ServiceAlertEntities.length; j++) {
            const ent = action.ServiceAlertEntities[j]
            if (ent.StopId !== null) {
              entityList.push({type: 'stop', entity: ent, gtfs: {}})
            }
            if (ent.RouteId !== null) {
              entityList.push({type: 'route', entity: ent, gtfs: {}})
            }
          }
        }
      }
      const allAlerts = action.rtdAlerts ? action.rtdAlerts.map((rtdAlert) => {
        // let activeIndex = action.projects.findIndex(p => p.id == config.activeProjectId)
        const project = action.activeProject // action.projects[activeIndex]

        const alert = {
          id: rtdAlert.Id,
          title: rtdAlert.HeaderText,
          description: rtdAlert.DescriptionText,
          cause: rtdAlert.Cause,
          effect: rtdAlert.Effect,
          editedBy: rtdAlert.EditedBy,
          editedDate: rtdAlert.EditedDate,
          url: rtdAlert.Url,
          start: rtdAlert.StartDateTime * 1000,
          end: rtdAlert.EndDateTime * 1000,
          published: rtdAlert.Published === 'Yes',
          affectedEntities: rtdAlert.ServiceAlertEntities.map((ent) => {
            const entity = {
              id: ent.Id
            }

            if (ent.AgencyId !== null) {
              const feed = project.feedSources.find(f => getFeedId(f) === ent.AgencyId)
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

            if (ent.RouteType !== null) {
              const mode = modes.find(m => m.gtfsType === ent.RouteType)

              // catch any integers outside of 0 -7 range
              entity.mode = typeof mode !== 'undefined' ? mode : modes.find(m => m.gtfsType === 0)
              entity.type = 'MODE'
            }
            return entity
          })
        }
        return alert
      })
      : []

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

// export default alerts
export default mergeable(alerts)
