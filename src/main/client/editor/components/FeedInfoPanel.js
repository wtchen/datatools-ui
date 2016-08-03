import React, {Component, PropTypes} from 'react'
import { Button, ButtonGroup, DropdownButton, Dropdown, MenuItem, Tooltip, OverlayTrigger } from 'react-bootstrap'
import Icon from 'react-fa'
import { browserHistory } from 'react-router'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import CreateSnapshotModal from './CreateSnapshotModal'
import { gtfsIcons } from '../util/gtfs'

export default class FeedInfoPanel extends Component {

  static propTypes = {
    feedSource: PropTypes.object,
    project: PropTypes.object,
    feedInfo: PropTypes.object,
    createSnapshot: PropTypes.func,
    setActiveEntity: PropTypes.func
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
    let panelWidth = 280
    // let panelHeight = '100px'
    let panelStyle = {
      // backgroundColor: 'white',
      position: 'absolute',
      right: this.state.right,
      bottom: 20,
      borderRadius: '5px',
      // height: panelHeight,
      width: `${panelWidth}px`
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
                    this.setState({right: 30 - panelWidth})
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
                this.props.setActiveEntity(feedSource.id, key, {id: 'new'})
              }}
            >
              {gtfsIcons.map(c => {
                if (!c.addable) return null
                let name = c.id === 'scheduleexception' ? 'schedule exception' : c.id
                return (
                  <MenuItem key={c.id} eventKey={c.id}><Icon fixedWidth name={c.icon}/> Add {name}</MenuItem>
                )
              })}
            </DropdownButton>
            {
            // <Button
            //   onClick={() => {
            //
            //   }}
            // >
            //   <Icon name='crosshairs'/>
            // </Button>
            }
              {
                <Dropdown
                  dropup
                  pullRight
                  onSelect={key => {
                    let snapshot = this.props.feedSource.editorSnapshots.find(s => s.id === key)
                    this.props.showConfirmModal({
                      title: `Restore ${key}?`,
                      body: `Are you sure you want to restore this snapshot?`,
                      onConfirm: () => {
                        this.props.restoreSnapshot(feedSource, snapshot)
                      }
                    })
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
                    <Dropdown.Toggle
                      bsStyle='primary'
                      onClick={() => {
                        this.props.getSnapshots(feedSource)
                      }}
                    />
                    <Dropdown.Menu style={{maxHeight: '200px', overflowY: 'scroll'}}>
                      {this.props.feedSource && this.props.feedSource.editorSnapshots
                        ? this.props.feedSource.editorSnapshots.map(snapshot => {
                            return (
                              <MenuItem key={snapshot.id} eventKey={snapshot.id}><Icon name='reply'/> Revert to {snapshot.id}</MenuItem>
                            )
                          })
                        : <MenuItem disabled eventKey={null}>No snapshots</MenuItem>
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
