import React, {Component, PropTypes} from 'react'
import { Button, ButtonGroup, DropdownButton, Dropdown, MenuItem, Tooltip, OverlayTrigger } from 'react-bootstrap'
import Icon from 'react-fa'
import { browserHistory } from 'react-router'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import CreateSnapshotModal from './CreateSnapshotModal'
import { componentList } from '../util/gtfs'

export default class FeedInfoPanel extends Component {

  static propTypes = {
    feedSource: PropTypes.object,
    project: PropTypes.object,
    feedInfo: PropTypes.object,
    createSnapshot: PropTypes.func,
    setActiveGtfsEntity: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.state = {
      right: 5
    }
  }

  render () {
    let { feedSource, feedInfo } = this.props
    if (!feedInfo) return null
    let panelWidth = '400px'
    let panelHeight = '100px'
    let panelStyle = {
      // backgroundColor: 'white',
      position: 'absolute',
      right: this.state.right,
      bottom: 20,
      borderRadius: '5px',
      // height: panelHeight,
      width: panelWidth
    }
    if (!feedInfo || !feedSource) {
      return null
    }
    const toolbarVisible = this.state.right > 0
    return (
      <ReactCSSTransitionGroup transitionName={`slide-${this.state.right > 0 ? 'right' : 'left'}`} transitionEnterTimeout={500} transitionLeaveTimeout={300}>
      <div style={panelStyle}>
        <CreateSnapshotModal ref='snapshotModal'
          onOkClicked={(name, comment) => {
            this.props.createSnapshot(feedSource, name, comment)
          }}
        />
          <ButtonGroup>
            <OverlayTrigger placement='top' overlay={<Tooltip id='hide-tooltip'>{toolbarVisible ? 'Hide toolbar' : 'Show toolbar'}</Tooltip>}>
              <Button
                onClick={() => {
                  if (toolbarVisible) {
                    this.setState({right: -370})
                  }
                  else {
                    this.setState({right: 5})
                  }
                }}
              >
                <Icon name={toolbarVisible ? 'caret-right' : 'caret-left'}/>
              </Button>
            </OverlayTrigger>
            <DropdownButton dropup title={`Editing ${feedSource && feedSource.name}`} id='navigation-dropdown'
              onSelect={key => {
                switch (key) {
                  case '1':
                    return browserHistory.push(`/project/${this.props.project.id}`)
                  case '2':
                    return browserHistory.push(`/feed/${this.props.feedSource.id}`)
                }
              }}
            >
              <MenuItem eventKey='1'><Icon name='reply'/> Back to project</MenuItem>
              <MenuItem eventKey='2'><Icon name='reply'/> Back to feed source</MenuItem>
            </DropdownButton>
            <DropdownButton pullRight dropup title={<span><Icon name='plus'/></span>}
              id='add-entity-dropdown'
              onSelect={key => {
                console.log(key)
                this.props.setActiveGtfsEntity(feedSource.id, key, 'new')
              }}
            >
              {componentList.map(c => {
                return (
                  <MenuItem key={c} eventKey={c}>Add {c}</MenuItem>
                )
              })}
            </DropdownButton>
            <Button
              onClick={() => {

              }}
            >
              <Icon name='crosshairs'/>
            </Button>
              {
                <Dropdown
                  dropup
                  pullRight
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
                    <Dropdown.Toggle bsStyle='primary'/>
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
              </Dropdown>
            }
          </ButtonGroup>
      </div>
      </ReactCSSTransitionGroup>
    )
  }
}
