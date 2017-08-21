export type Bounds = {
  east: Number,
  north: Number,
  south: Number,
  west: Number
}

export type Entity = {
  agency: ?{},
  agencyId: string
}

export type Feed = {
  latestValidation?: {
    bounds: Bounds
  }
}

type DatatoolsSettings = {
  client_id: string,
  sidebarExpanded: boolean,
  editor: {
    map_id: string
  },
  hideTutorial: boolean
}

export type Profile = {
  user_metadata: {
    datatools: Array<DatatoolsSettings>
  }
}

export type Project = {
  feedSources: Array<Feed>,
  id: string,
  organizationId: string
}
