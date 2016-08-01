import { secureFetch } from '../../common/util/util'
import { setActiveGtfsEntity } from './editor'

//// FARES

export function savingFare (feedId, fare) {
  return {
    type: 'SAVING_FARE',
    feedId,
    fare
  }
}

export function receiveFare (feedId, fare) {
  return {
    type: 'RECEIVE_FARE',
    feedId,
    fare
  }
}

export function saveFare (feedId, fare) {
  return function (dispatch, getState) {
    const data = {
      // datatools props
      id: fare.id === 'new' ? null : fare.id,
      feedId: fare.feedId,
      description: fare.description,
      fareRules: fare.fareRules,

      // gtfs spec props
      gtfsFareId: fare.fare_id,
      price: fare.price,
      currencyType: fare.currency_type,
      paymentMethod: fare.payment_method,
      transfers: fare.transfers,
      transferDuration: fare.transfer_duration,
    }
    const method = fare.id !== 'new' ? 'put' : 'post'
    const url = fare.id !== 'new'
      ? `/api/manager/secure/fare/${fare.id}?feedId=${feedId}`
      : `/api/manager/secure/fare?feedId=${feedId}`
    return secureFetch(url, getState(), method, data)
      .then(res => res.json())
      .then(f => {

        // dispatch(receiveFare(feedId, fare))
        dispatch(fetchFares(feedId))
        .then(() => {
          if (fare.id === 'new') {
            dispatch(setActiveGtfsEntity(feedId, 'fare', f.id))
          }
          return f
        })
      })
  }
}

export function deletingFare (feedId, fare) {
  return {
    type: 'DELETING_FARE',
    feedId,
    fare
  }
}

export function deleteFare (feedId, fare) {
  return function (dispatch, getState) {
    dispatch(deletingFare(feedId, fare))
    if (fare.id === 'new') {
      return dispatch(fetchFares(feedId))
    }
    const url = `/api/manager/secure/fare/${fare.id}?feedId=${feedId}`
    return secureFetch(url, getState(), 'delete')
      .then(res => res.json())
      .then(fare => {
        dispatch(fetchFares(feedId))
      })
  }
}

export function requestingFares (feedId) {
  return {
    type: 'REQUESTING_FARES',
    feedId
  }
}

export function receiveFares (feedId, fares) {
  return {
    type: 'RECEIVE_FARES',
    feedId,
    fares
  }
}

export function fetchFares (feedId) {
  return function (dispatch, getState) {
    dispatch(requestingFares(feedId))
    const url = `/api/manager/secure/fare?feedId=${feedId}`
    return secureFetch(url, getState())
      .then(res => res.json())
      .then(fares => {
        dispatch(receiveFares(feedId, fares))
        return fares
      })
  }
}
