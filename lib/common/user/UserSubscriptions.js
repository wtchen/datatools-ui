import { getConfigProperty } from '../util/config'

export default class UserSubscriptions {
  constructor (datatoolsApps) {
    const datatoolsJson = datatoolsApps && datatoolsApps.constructor === Array
      ? datatoolsApps.find(dt => dt.client_id === getConfigProperty('auth0.client_id'))
      : datatoolsApps
    this.subscriptionLookup = {}
    if (datatoolsJson && datatoolsJson.subscriptions) {
      for (var subscription of datatoolsJson.subscriptions) {
        this.subscriptionLookup[subscription.type] = subscription
      }
    }
  }
  hasSubscription (subscriptionType) {
    return this.subscriptionLookup[subscriptionType] !== null
  }

  getSubscription (subscriptionType) {
    return this.subscriptionLookup[subscriptionType]
  }

  hasProjectSubscription (projectId, subscriptionType) {
    if (!this.hasSubscription(subscriptionType)) return null
    const subscription = this.getSubscription(subscriptionType)
    return subscription ? subscription.target.indexOf(projectId) !== -1 : false
  }

  hasFeedSubscription (projectId, feedId, subscriptionType) {
    if (!this.hasSubscription(subscriptionType)) return null
    else if (this.hasProjectSubscription(projectId, subscriptionType)) return true
    const subscription = this.getSubscription(subscriptionType)
    return subscription ? subscription.target.indexOf(feedId) !== -1 : false
  }
}

module.exports = UserSubscriptions
