export function defaultSorter(a, b) {
  if(a.isCreating && !b.isCreating) return -1
  if(!a.isCreating && b.isCreating) return 1
  if(a.name < b.name) return -1
  if(a.name > b.name) return 1
  return 0
}

export function retrievalMethodString(method) {
  switch (method) {
    case 'MANUALLY_UPLOADED': return 'Manually Uploaded'
    case 'FETCHED_AUTOMATICALLY': return 'Fetched Automatically'
    case 'PRODUCED_IN_HOUSE': return 'Produced In-house'
  }
}
