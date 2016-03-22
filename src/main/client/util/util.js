export default function defaultSorter(a, b) {
  if(a.isCreating && !b.isCreating) return -1
  if(!a.isCreating && b.isCreating) return 1
  if(a.name < b.name) return -1
  if(a.name > b.name) return 1
  return 0
}
