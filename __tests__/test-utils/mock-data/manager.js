// @flow

import clone from 'lodash/cloneDeep'

import UserPermissions from '../../../lib/common/user/UserPermissions'
import UserSubscriptions from '../../../lib/common/user/UserSubscriptions'

import type {Bounds} from '../../../lib/types'

function makeMockDeployment (project) {
  return {
    customBuildConfig: null,
    customRouterConfig: null,
    dateCreated: 1553292345720,
    deployedTo: null,
    feedSourceId: null,
    feedVersions: [],
    id: 'mock-deployment-id',
    invalidFeedSources: [],
    lastDeployed: null,
    lastUpdated: 1553292345726,
    name: 'mock-deployment',
    organizationId: null,
    osmFileId: null,
    otpCommit: null,
    project,
    projectBounds: (null: ?Bounds), // not sure why this flow type annotation is needed (see https://git.io/fjJCm)
    routerId: (null: ?string), // not sure why this flow type annotation is needed (see https://git.io/fjJCm)
    user: (null: ?any) // not sure why this flow type annotation is needed (see https://git.io/fjJCm)
  }
}

export const mockProject = {
  autoFetchFeeds: true,
  autoFetchHour: 0,
  autoFetchMinute: 0,
  bounds: null,
  buildConfig: {
    fares: null,
    fetchElevationUS: null,
    stationTransfers: null,
    subwayAccessTime: null
  },
  dateCreated: 1526305321824,
  defaultTimeZone: null,
  deployments: [],
  feedSources: [],
  id: 'mock-project-id',
  lastUpdated: 1553236399556,
  name: 'mock-project',
  organizationId: null,
  otpServers: [],
  pinnedDeploymentId: null,
  routerConfig: {
    carDropoffTime: null,
    numItineraries: null,
    requestLogFile: null,
    stairsReluctance: null,
    updaters: null,
    walkSpeed: null
  },
  useCustomOsmBounds: false,
  user: null
}

export const mockFeedWithVersion = {
  dateCreated: 1536195264564,
  deployable: false,
  editorNamespace: 'gzek_ztquwiwjmselpeswgbsrre',
  externalProperties: {},
  id: 'mock-feed-with-version-id',
  isPublic: false,
  lastFetched: 1543389038810,
  lastUpdated: 1543389038810,
  latestValidation: {
    agencies: null,
    agencyCount: 1,
    avgDailyRevenueTime: 0,
    bounds: {
      north: 39.0486949672717,
      south: 38.92884,
      east: -76.481211,
      west: -76.5673055566884
    },
    endDate: '20190801',
    errorCount: 78,
    loadFailureReason: null,
    loadStatus: 'SUCCESS',
    routeCount: 10,
    startDate: '20180801',
    stopCount: 237,
    stopTimesCount: 11170,
    tripCount: 415
  },
  latestVersionId: 'mock-version-id',
  name: 'test feed with a version',
  noteCount: 0,
  organizationId: null,
  projectId: mockProject.id,
  publishedVersionId: null,
  retrievalMethod: 'MANUALLY_UPLOADED',
  s3Url: null,
  snapshotVersion: null,
  url: 'http://mdtrip.org/googletransit/AnnapolisTransit/google_transit.zip',
  user: null
}

export const mockFeedWithoutVersion = {
  dateCreated: 1544831411569,
  deployable: true,
  editorNamespace: null,
  externalProperties: {},
  id: 'mock-feed-without-version-id',
  isPublic: false,
  lastFetched: null,
  name: 'test feed with no version',
  noteCount: 0,
  organizationId: null,
  projectId: mockProject.id,
  publishedVersionId: null,
  retrievalMethod: 'FETCHED_AUTOMATICALLY',
  s3Url: null,
  snapshotVersion: null,
  url: null,
  user: null
}

export const mockFeedVersion = {
  feedSource: mockFeedWithVersion,
  id: 'mock-feed-version',
  nextVersionId: null,
  previousVersionId: null,
  updated: 1526404888925,
  validationResult: {
    agencies: null,
    agencyCount: 1,
    avgDailyRevenueTime: 0,
    bounds: {
      east: -121.54902915,
      north: 37.558388156,
      south: 36.974922178,
      west: -122.173638697
    },
    endDate: '20180701',
    errorCount: 5525,
    loadFailureReason: null,
    loadStatus: 'SUCCESS',
    routeCount: 86,
    startDate: '20180409',
    stopCount: 3878,
    stopTimesCount: 393925,
    tripCount: 8874
  },
  version: 1
}

export const mockProjectWithDeployments = clone(mockProject)
mockProjectWithDeployments.id = 'mock-project-with-deployments-id'
mockProjectWithDeployments.name = 'mock-project-with-deployments'
const mockDeployment = makeMockDeployment(mockProjectWithDeployments)
mockDeployment.feedVersions.push(mockFeedVersion)
mockProjectWithDeployments.deployments.push(mockDeployment)
mockProjectWithDeployments.feedSources.push(mockFeedWithVersion)

/***************************************************************************
 User helpers
 ***************************************************************************/

/**
 * Creates a mock manager user state based off of a mock auth0 response.
 */
function makeUser (profile) {
  return {
    isCheckingLogin: false,
    token: 'mock-token',
    profile,
    permissions: new UserPermissions(profile.app_metadata.datatools),
    recentActivity: null,
    redirectOnSuccess: null,
    subscriptions: new UserSubscriptions(profile.app_metadata.datatools)
  }
}

const mockAuth0Response = {
  email: 'mock-user@conveyal.com',
  email_verified: true,
  clientID: 'mock-client-id',
  user_id: 'auth0|12345',
  picture: 'https://s.gravatar.com/avatar/f8660ca52d1229e3d55e88f2db4affda?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fmu.png',
  nickname: 'mock-user',
  identities: [{
    user_id: '12345',
    provider: 'auth0',
    connection: 'Username-Password-Authentication',
    isSocial: false
  }],
  updated_at: '2019-03-21T19:05:30.180Z',
  created_at: '2016-03-04T18:59:22.569Z',
  name: 'mock-user@conveyal.com',
  user_metadata: {
    lang: 'en',
    datatools: [{
      client_id: 'mock-client-id',
      sidebarExpanded: false,
      hideTutorial: true,
      editor: {
        map_id: 'mapbox.streets'
      }
    }]
  },
  last_password_reset: '2017-07-13T13:58:01.021Z',
  jti: 'gibberish',
  app_metadata: {
    datatools: [{
      permissions: [{
        type: 'administer-application'
      }],
      projects: [],
      client_id: 'mock-client-id',
      subscriptions: [],
      organizations: []
    }]
  },
  persistent: {},
  sub: 'auth0|12345'
}

export const mockAdminUser = makeUser(mockAuth0Response)
