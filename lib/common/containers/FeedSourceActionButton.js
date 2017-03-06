import { Component } from 'react'
import { connect } from 'react-redux'

class FeedSourceActionButton extends Component {
  render () {
    // return (
    //   <Dropdown
    //     className='pull-right'
    //     bsStyle='default'
    //     onSelect={key => {
    //       console.log(key)
    //       switch (key) {
    //         case 'delete':
    //           return this.props.deleteFeedSourceClicked()
    //         case 'update':
    //           return this.props.updateFeedClicked()
    //         case 'upload':
    //           return this.props.uploadFeedSourceClicked()
    //         case 'deploy':
    //           return this.props.createDeployment(fs)
    //         case 'public':
    //           return browserHistory.push(`/public/feed/${fs.id}`)
    //       }
    //     }}
    //     id={`feed-source-action-button`}
    //     pullRight
    //   >
    //     <Button
    //       bsStyle='default'
    //       disabled={editGtfsDisabled}
    //       onClick={() => browserHistory.push(`/feed/${fs.id}/edit/`) }
    //     >
    //       <Glyphicon glyph='pencil' /> Edit
    //     </Button>
    //     <Dropdown.Toggle bsStyle='default' />
    //     <Dropdown.Menu>
    //       <MenuItem disabled={disabled  || !fs.url} eventKey='update'><Glyphicon glyph='refresh' /> Update</MenuItem>
    //       <MenuItem disabled={disabled} eventKey='upload'><Glyphicon glyph='upload' /> Upload</MenuItem>
    //       {isModuleEnabled('deployment') || getConfigProperty('application.notifications_enabled')
    //         ? <MenuItem divider />
    //         : null
    //       }
    //       {isModuleEnabled('deployment')
    //         ? <MenuItem disabled={disabled || !fs.deployable} eventKey='deploy'><Glyphicon glyph='globe' /> Deploy</MenuItem>
    //         : null
    //       }
    //       {getConfigProperty('application.notifications_enabled')
    //         ? <WatchButton
    //             isWatching={isWatchingFeed}
    //             user={this.props.user}
    //             target={fs.id}
    //             subscriptionType='feed-updated'
    //             componentClass='menuItem'
    //           />
    //         : null
    //       }
    //       <MenuItem disabled={!fs.isPublic} eventKey='public'><Glyphicon glyph='link' /> View public page</MenuItem>
    //       <MenuItem divider />
    //       <MenuItem disabled={disabled} eventKey='delete'><Icon type='trash' /> Delete</MenuItem>
    //     </Dropdown.Menu>
    //   </Dropdown>
    // )
  }
}

export default connect()(FeedSourceActionButton)
