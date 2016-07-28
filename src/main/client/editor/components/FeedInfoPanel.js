import React, {Component, PropTypes} from 'react'
import { Button, Row, Col, Dropdown, MenuItem, Tooltip, OverlayTrigger } from 'react-bootstrap'
import Icon from 'react-fa'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import CreateSnapshotModal from './CreateSnapshotModal'

export default class FeedInfoPanel extends Component {

  static propTypes = {
    feedSource: PropTypes.object,
    feedInfo: PropTypes.object,
    createSnapshot: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.state = {
      right: 5
    }
  }

  render () {
    let { feedSource, feedInfo } = this.props
    let panelWidth = '400px'
    let panelHeight = '100px'
    let panelStyle = {
      backgroundColor: 'white',
      position: 'absolute',
      right: this.state.right,
      bottom: 20,
      borderRadius: '5px',
      height: panelHeight,
      width: panelWidth
    }
    if (!feedInfo || !feedSource) {
      return null
    }
    return (
      <ReactCSSTransitionGroup transitionName={`slide-${this.state.right > 0 ? 'right' : 'left'}`} transitionEnterTimeout={500} transitionLeaveTimeout={300}>
      <div style={panelStyle}>
        <CreateSnapshotModal ref='snapshotModal'
          onOkClicked={(name, comment) => {
            this.props.createSnapshot(feedSource, name, comment)
          }}
        />
        <Row>
          <Col xs={2}>
            <Button
              style={{height: panelHeight}}
              onClick={() => {
                if (this.state.right > 0) {
                  this.setState({right: -370})
                }
                else {
                  this.setState({right: 5})
                }
              }}
            >
              <Icon name={this.state.right > 0 ? 'caret-right' : 'caret-left'}/>
            </Button>
          </Col>
          <Col xs={10}>
            <h3>
              Editing {feedSource.name}
              {'  '}
              <Dropdown
                onSelect={(key) => {
                  // this.addStopToPattern(activePattern, stop, key)
                }}
              >
                <OverlayTrigger placement='top' overlay={<Tooltip id='snapshot-tooltip'>Take snapshot</Tooltip>}>
                  <Button
                    bsStyle='primary'
                    onClick={(e) => {
                      this.refs.snapshotModal.open()
                    }}
                  >
                    <Icon name='camera'/>
                  </Button>
                </OverlayTrigger>
                <OverlayTrigger placement='top' overlay={<Tooltip id='snapshot-tooltip'>Revert to snapshot</Tooltip>}>
                  <Dropdown.Toggle bsStyle='primary'>
                    <Dropdown.Menu style={{maxHeight: '200px', overflowY: 'scroll'}}>
                      <MenuItem value={0} eventKey={0}>
                        Revert to snapshot
                      </MenuItem>
                      {
                      //   activePattern.patternStops && activePattern.patternStops.map((stop, i) => {
                      //   let addIndex = activePattern.patternStops.length - i
                      //   if (index === activePattern.patternStops.length - 1 && index === addIndex - 1) {
                      //     return null
                      //   }
                      //   // disable adding stop to current position or directly before/after current position
                      //   return (
                      //     <MenuItem disabled={index >= addIndex - 2 && index <= addIndex} value={addIndex - 1} eventKey={addIndex - 1}>
                      //       {addIndex === 1 ? 'Add to beginning' : `Insert as stop #${addIndex}`}
                      //     </MenuItem>
                      //   )
                      // })
                    }
                    </Dropdown.Menu>
                  </Dropdown.Toggle>
                </OverlayTrigger>
              </Dropdown>
            </h3>
          </Col>
        </Row>
      </div>
      </ReactCSSTransitionGroup>
    )
  }
}
