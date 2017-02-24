// import { combineReducers } from 'redux'

import active from './active'
import * as signs from './signs'

export default signs.merge(active)

// const allReducers = Object.assign({}, active, signs)
// const reducer = Object.assign({}, signs)
// signs.active = active
// export default combineReducers(signs)
// export default combineReducers({
//   active,
//   ...signs
// })
