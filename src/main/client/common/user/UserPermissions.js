import { getConfigProperty } from '../util/config'
import objectPath from 'object-path'

export default class UserPermissions {
  constructor (datatoolsApps) {
    // check for map of datatools apps and get the right application
    const datatoolsJson = datatoolsApps && datatoolsApps.constructor === Array
      ? datatoolsApps.find(dt => dt.client_id === getConfigProperty('auth0.client_id'))
      : datatoolsApps
    this.appPermissionLookup = {}
    if (datatoolsJson && datatoolsJson.permissions) {
      for (var appPermission of datatoolsJson.permissions) {
        this.appPermissionLookup[appPermission.type] = appPermission
      }
    }

    this.organizationLookup = {}
    const orgs = datatoolsJson && datatoolsJson.organizations
    if (orgs) {
      for (var organization of orgs) {
        this.organizationLookup[organization.organization_id] = organization
      }
    }

    this.orgPermissionLookup = {}
    const orgPermissions = objectPath.get(datatoolsJson, `organizations.0.permissions`)
    if (orgPermissions) {
      for (var p of orgPermissions) {
        this.orgPermissionLookup[p.type] = p
      }
    }

    this.projectLookup = {}
    if (datatoolsJson && datatoolsJson.projects) {
      for (var project of datatoolsJson.projects) {
        this.projectLookup[project.project_id] = project
      }
    }
  }

  isApplicationAdmin () {
    return ('administer-application' in this.appPermissionLookup)
  }

  hasOrganization (orgId) {
    if (this.isApplicationAdmin()) return true
    return (orgId in this.organizationLookup)
  }

  getOrganizationId () {
    const keys = Object.keys(this.organizationLookup)
    return keys && keys.length ? keys[0] : null
  }

  // as opposed to the specific isOrganizationAdmin, this method checks for generic admin access to some organization
  canAdministerAnOrganization () {
    if (this.isApplicationAdmin()) return true
    return ('administer-organization' in this.orgPermissionLookup)
  }

  isOrganizationAdmin (orgId = null) {
    if (this.isApplicationAdmin()) return true
    return this.hasOrganization(orgId) && this.getOrganizationPermission(orgId, 'administer-organization') != null
  }

  getOrganizationPermission (organizationId, permissionType) {
    if (!this.hasOrganization(organizationId)) return null
    var organizationPermissions = this.getOrganizationPermissions(organizationId)
    for (var permission of organizationPermissions) {
      if (permission.type === permissionType) return permission
    }
    return null
  }

  getOrganizationPermissions (organizationId) {
    if (!this.hasOrganization(organizationId)) return null
    return this.organizationLookup[organizationId].permissions
  }

  hasProject (projectId, organizationId = null) {
    if (this.isOrganizationAdmin(organizationId)) return true
    return (projectId in this.projectLookup)
  }

  isProjectAdmin (projectId, organizationId) {
    if (this.isApplicationAdmin()) return true
    // TODO: make project admin subject to org admin
    if (this.isOrganizationAdmin(organizationId)) return true
    return this.hasProject(projectId) && this.getProjectPermission(projectId, 'administer-project') != null
  }

  getProjectPermissions (projectId) {
    if (!this.hasProject(projectId)) return null
    return this.projectLookup[projectId].permissions
  }

  getProjectDefaultFeeds (projectId) {
    if (!this.hasProject(projectId)) return null
    return this.projectLookup[projectId].defaultFeeds || []
  }

  hasProjectPermission (organizationId, projectId, permissionType) {
    if (this.isProjectAdmin(projectId, organizationId)) return true
    let p = this.getProjectPermission(projectId, permissionType)
    return (p !== null)
  }

  getProjectPermission (projectId, permissionType) {
    if (!this.hasProject(projectId)) return null
    var projectPermissions = this.getProjectPermissions(projectId)
    for (var permission of projectPermissions) {
      if (permission.type === permissionType) return permission
    }
    return null
  }

  hasFeed (listOfFeeds, feedId) {
    if (listOfFeeds.indexOf('*') > -1) return true
    else if (listOfFeeds.indexOf(feedId) > -1) return true
    return null
  }

  hasFeedPermission (organizationId, projectId, feedId, permissionType) {
    if (this.isProjectAdmin(projectId, organizationId)) return true
    let p = this.getProjectPermission(projectId, permissionType)
    if (p !== null) {
      let defaultFeeds = this.getProjectDefaultFeeds(projectId)
      let permissionFeeds = p.feeds || []
      if (this.hasFeed(defaultFeeds, feedId)) return true
      if (this.hasFeed(permissionFeeds, feedId)) return true
    }
    return null
  }
}

module.exports = UserPermissions
