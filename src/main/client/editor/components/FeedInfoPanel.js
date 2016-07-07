import React, {Component, PropTypes} from 'react'
import { Button } from 'react-bootstrap'

import CreateSnapshotModal from './CreateSnapshotModal'

export default class FeedInfoPanel extends Component {

  static propTypes = {
    feedSource: PropTypes.object,
    feedInfo: PropTypes.object,
    createSnapshot: PropTypes.func
  }

  constructor (props) {
    super(props)
  }

  render () {
    let { feedSource, feedInfo } = this.props

    let panelStyle = {
      backgroundColor: 'white',
      position: 'absolute',
      right: 5,
      bottom: 20,
      paddingRight: 5,
      paddingLeft: 5,
      height: 100,
      width: 400
    }
    if (!feedInfo || !feedSource) {
      return null
    }
    return (
      <div style={panelStyle}>

        <CreateSnapshotModal ref='snapshotModal'
          onOkClicked={(name, comment) => {
            this.props.createSnapshot(feedSource, name, comment)
          }}
        />

        <h3>
          Editing {feedSource.name}
          {'  '}
          <Button bsSize='small' bsStyle='primary'
            onClick={() => {
              this.refs.snapshotModal.open()
            }}
          >
            Save snapshot
          </Button>
        </h3>

        <p>{feedInfo.id}</p>

      </div>
    )
  }
}
