import React, { Component, PropTypes } from 'react'
import { FormControl } from 'react-bootstrap'

import { getFeed, getFeedId } from '../../common/util/modules'

export default class AgencySelector extends Component {
  static propTypes = {
    feeds: PropTypes.array,
    entity: PropTypes.object,
    entityUpdated: PropTypes.func
  }
  render () {
    const { feeds, entity, entityUpdated } = this.props
    return (
      <div>
        <FormControl
          componentClass='select'
          value={entity.agency && getFeedId(entity.agency)}
          onChange={(evt) => {
            entityUpdated(entity, 'AGENCY', getFeed(feeds, evt.target.value))
          }}
        >
          {feeds.map((feed) => {
            return <option key={getFeedId(feed)} value={getFeedId(feed)}>{feed.name}</option>
          })}
        </FormControl>
      </div>
    )
  }
}
