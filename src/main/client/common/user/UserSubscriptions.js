export default class UserSubscriptions {
  constructor (datatoolsJson) {
    this.subscriptionLookup = {}
    if (datatoolsJson && datatoolsJson.subscriptions) {
      for (var subscription of datatoolsJson.subscriptions) {
        this.subscriptionLookup[subscription.type] = subscription
      }
    }

    // this.targetLookup = {}
    // if (datatoolsJson && datatoolsJson.subscriptions) {
    //   for (var subscription of datatoolsJson.subscriptions) {
    //     for (var i = 0; i < array.length; i++) {
    //       array[i]
    //     }
    //     this.targetLookup[subscription.target] = project
    //   }
    // }
  }
  hasSubscription (subscriptionType) {
    return this.subscriptionLookup[subscriptionType] !== null
  }

  getSubscription (subscriptionType) {
    return this.subscriptionLookup[subscriptionType]
  }

  hasProjectSubscription (projectId, subscriptionType) {
    if (!this.hasSubscription(subscriptionType)) return null
    let subscription = this.getSubscription(subscriptionType)
    return subscription ? subscription.target.indexOf(projectId) !== -1 : false
  }

  hasFeedSubscription (projectId, feedId, subscriptionType) {
    if (!this.hasSubscription(subscriptionType)) return null
    else if (this.hasProjectSubscription(projectId, subscriptionType)) return true
    let subscription = this.getSubscription(subscriptionType)
    return subscription ? subscription.target.indexOf(feedId) !== -1 : false
  }

  // isApplicationAdmin () {
  //   return ('administer-application' in this.appPermissionLookup)
  // }
  //
  // hasProject (projectId) {
  //   return (projectId in this.projectLookup)
  // }
  //
  // isProjectAdmin (projectId) {
  //   if (this.isApplicationAdmin()) return true
  //   return this.hasProject(projectId) && this.getProjectPermission(projectId, 'administer-project') != null
  // }
  //
  // getProjectPermissions (projectId) {
  //   if (!this.hasProject(projectId)) return null
  //   return this.projectLookup[projectId].permissions
  // }
  //
  // getProjectDefaultFeeds (projectId) {
  //   if (!this.hasProject(projectId)) return null
  //   return this.projectLookup[projectId].defaultFeeds || []
  // }
  //
  // hasProjectPermission (projectId, permissionType) {
  //   if (this.isProjectAdmin(projectId)) return true
  //   let p = this.getProjectPermission(projectId, permissionType)
  //   return (p !== null)
  // }
  //
  // getProjectPermission (projectId, permissionType) {
  //   if (!this.hasProject(projectId)) return null
  //   var projectPermissions = this.getProjectPermissions(projectId)
  //   for (var permission of projectPermissions) {
  //     if (permission.type === permissionType) return permission
  //   }
  //   return null
  // }
  //
  // hasFeed (listOfFeeds, feedId) {
  //   if (listOfFeeds.indexOf('*') > -1) return true
  //   else if (listOfFeeds.indexOf(feedId) > -1) return true
  //   return null
  // }
  //
  // hasFeedPermission (projectId, feedId, permissionType) {
  //   if (this.isProjectAdmin(projectId)) return true
  //   let p = this.getProjectPermission(projectId, permissionType)
  //   if (p !== null) {
  //     let defaultFeeds = this.getProjectDefaultFeeds(projectId)
  //     let permissionFeeds = p.feeds || []
  //     if (this.hasFeed(defaultFeeds, feedId)) return true
  //     if (this.hasFeed(permissionFeeds, feedId)) return true
  //   }
  //   return null
  // }
}

module.exports = UserSubscriptions
