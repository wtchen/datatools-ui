import Icon from '@conveyal/woonerf/components/icon'
import React, {Component, PropTypes} from 'react'
import {Modal, Button, ButtonToolbar, Checkbox} from 'react-bootstrap'
import {LinkContainer} from 'react-router-bootstrap'

import {getConfigProperty} from '../../common/util/config'

export default class EditorHelpModal extends Component {
  static propTypes = {
    show: PropTypes.bool
  }

  state = {
    showModal: this.props.show,
    hideTutorial: this.props.hideTutorial
  }

  _onToggleTutorial = () => this.setState({hideTutorial: !this.state.hideTutorial})

  _buildFromScratch = () => {
    const {createSnapshot, feedSource} = this.props
    createSnapshot(feedSource, 'Blank')
  }

  _onClickLoad = () => {
    const {feedSource, loadFeedVersionForEditing} = this.props
    const {latestVersionId: feedVersionId, id: feedSourceId} = feedSource
    loadFeedVersionForEditing({feedSourceId, feedVersionId})
  }

  _onClickBeginEditing = () => {
    const {onComponentMount} = this.props
    // To begin editing, the GtfsEditor on mount function is called in order to
    // fetch the base GTFS and perform any other initialization activities (e.g.
    // to create an exclusive lock to edit the feed).
    onComponentMount(this.props)
    this.close()
  }

  close = () => {
    if (this.state.hideTutorial !== this.props.hideTutorial) {
      this.props.setTutorialHidden(!this.props.hideTutorial)
    }
    this.setState({ showModal: false })
  }

  open () {
    this.setState({ showModal: true })
  }

  render () {
    const {feedSource, isNewFeed, show, status} = this.props
    if (!show) {
      return null
    }
    const {Body, Footer, Header, Title} = Modal
    return (
      <Modal
        show={this.state.showModal}
        onHide={this.close}
        // Prevent closure of modal if there is no snapshot yet
        backdrop={isNewFeed ? 'static' : undefined}>
        <Header closeButton={!isNewFeed}>
          <Title>Welcome to the GTFS Editor</Title>
        </Header>
        <Body>
          {isNewFeed
            ? <div>
              {status.snapshotFinished
                ? <p className='text-center'>Snapshot created successfully!</p>
                : <p>
                  There is no feed loaded in the editor. To begin editing you can either
                  start from scratch or import an existing version (if a version exists).
                </p>
              }
              {status.snapshotFinished
                ? <Button
                  block
                  bsSize='large'
                  bsStyle='primary'
                  data-test-id='begin-editing-button'
                  onClick={this._onClickBeginEditing} >
                  <Icon type='check' /> Begin editing
                </Button>
                : <ButtonToolbar>
                  <Button
                    block
                    bsSize='large'
                    data-test-id='edit-from-scratch-button'
                    disabled={status.creatingSnapshot}
                    onClick={this._buildFromScratch}
                  >
                    <Icon type='file' /> Start from scratch
                  </Button>
                  <Button
                    block
                    bsSize='large'
                    data-test-id='import-latest-version-button'
                    disabled={!feedSource.latestVersionId || status.creatingSnapshot}
                    onClick={this._onClickLoad}
                  >
                    <Icon type='upload' /> Import latest version
                  </Button>
                </ButtonToolbar>
              }
            </div>
            : <p>For instructions on using the editor, view the{' '}
              <a
                target='_blank'
                href={`${getConfigProperty('application.docs_url')}/en/latest/user/editor/introduction/`} >
                documentation
              </a>.
            </p>
          }
          {/* <Carousel>
            <Item>
              <img width={900} height={500} alt='900x500' src='https://react-bootstrap.github.io/assets/carousel.png' />
              <Caption>
                <h3>First slide label</h3>
                <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
              </Caption>
            </Item>
            <Item>
              <img width={900} height={500} alt='900x500' src='https://react-bootstrap.github.io/assets/carousel.png' />
              <Caption>
                <h3>Second slide label</h3>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              </Caption>
            </Item>
            <Item>
              <img width={900} height={500} alt='900x500' src='https://react-bootstrap.github.io/assets/carousel.png' />
              <Caption>
                <h3>Third slide label</h3>
                <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
              </Caption>
            </Item>
          </Carousel> */}
        </Body>
        <Footer>
          {!isNewFeed && <small className='pull-left'>
            <Checkbox
              checked={this.state.hideTutorial}
              onChange={this._onToggleTutorial}>
              Do not show when editor opens
            </Checkbox>
          </small>}
          {isNewFeed
            ? <LinkContainer to={feedSource ? `/feed/${feedSource.id}` : `/home`}>
              <Button><Icon type='chevron-left' /> Back to feed source</Button>
            </LinkContainer>
            : <Button onClick={this.close}>Close</Button>
          }
        </Footer>
      </Modal>
    )
  }
}
