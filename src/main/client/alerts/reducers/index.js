// import { combineReducers } from 'redux'

import active from './active'
import * as alerts from './alerts'

export default alerts.merge(active)

// export default combineReducers({
//   active,
//   ...alerts
// })
