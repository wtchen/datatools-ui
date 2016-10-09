import React, {Component, PropTypes} from 'react'
import { Row, Col, Image, Button, Panel, Label, Tabs, Tab, Glyphicon, ButtonToolbar, ListGroup, ListGroupItem } from 'react-bootstrap'
import moment from 'moment'
import Icon from 'react-fa'
import numeral from 'numeral'

import EditableTextField from '../../common/components/EditableTextField'
import { VersionButtonToolbar } from './FeedVersionViewer'
import { getComponentMessages, getMessage, getConfigProperty } from '../../common/util/config'

import Feed from './reporter/containers/Feed'
import Patterns from './reporter/containers/Patterns'
import Routes from './reporter/containers/Routes'
import Stops from './reporter/containers/Stops'

const dateFormat = 'MMM. DD, YYYY'
const timeFormat = 'h:MMa'

export default class FeedVersionReport extends Component {

  static propTypes = {
    version: PropTypes.object,
    versions: PropTypes.array,
    feedVersionIndex: PropTypes.number,
    // versionSection: PropTypes.string,

    isPublic: PropTypes.bool,
    hasVersions: PropTypes.bool,
    // listView: PropTypes.bool,

    // newNotePosted: PropTypes.func,
    // notesRequested: PropTypes.func,
    // fetchValidationResult: PropTypes.func,
    feedVersionRenamed: PropTypes.func,
    // downloadFeedClicked: PropTypes.func,
    // loadFeedVersionForEditing: PropTypes.func
  }
  constructor (props) {
    super(props)
    this.state = {tab: 'feed'}
  }
  getVersionDateLabel (version) {
    const now = +moment()
    const future = version.validationSummary && version.validationSummary.startDate > now
    const expired = version.validationSummary && version.validationSummary.endDate < now
    return version.validationSummary
      ? <Label bsStyle={future ? 'info' : expired ? 'danger' : 'success'}>{future ? 'future' : expired ? 'expired' : 'active'}</Label>
      : null
  }
  selectTab (tab) {
    this.setState({tab})
  }
  render () {
    const version = this.props.version
    const messages = getComponentMessages('FeedVersionReport')

    if (!version) return <p>{getMessage(messages, 'noVersionsExist')}</p>

    const fsCenter = version.validationSummary && version.validationSummary.bounds
      ? `${(version.validationSummary.bounds.east + version.validationSummary.bounds.west) / 2},${(version.validationSummary.bounds.north + version.validationSummary.bounds.south) / 2}`
      : null
    const fsOverlay = fsCenter
      ? `pin-l-bus(${fsCenter})/`
      : ''
    const mapUrl = fsCenter
      ? `https://api.mapbox.com/v4/mapbox.light/${fsOverlay}${fsCenter},6/1000x800@2x.png?access_token=${getConfigProperty('mapbox.access_token')}`
      : ''
    const versionHeader = (
      <div>
      <h4
        style={{margin: '0px'}}
      >
        {/* Name Display / Editor */}
        {version.validationSummary.loadStatus === 'SUCCESS' && version.validationSummary.errorCount === 0
          ? <Icon title='Feed loaded successfully, and is error-free!' className='text-success' name='check' style={{marginRight: 10}}/>
          : version.validationSummary.errorCount > 0
          ? <Icon title='Feed loaded successfully, but has errors.' className='text-warning' name='exclamation-triangle' style={{marginRight: 10}}/>
          : <Icon title='Feed did not load successfully, something has gone wrong!' className='text-danger' name='times' style={{marginRight: 10}}/>
        }
        {this.props.isPublic
          ? <span>{version.name}</span>
          : <EditableTextField inline value={version.name}
              disabled={this.props.isPublic}
              onChange={(value) => this.props.feedVersionRenamed(version, value)}
            />
        }
        <VersionButtonToolbar
          {...this.props}
        />
      </h4>
      <small title={moment(version.updated).format(dateFormat + ', ' + timeFormat)}><Icon name='clock-o'/> Version published {moment(version.updated).fromNow()}</small>
      </div>
    )
    const tableOptions = {
      striped: true,
      search: true,
      hover: true,
      exportCSV: true,
      // maxHeight: '500px',
      pagination: true,
      options: {
        paginationShowsTotal: true
      }
    }
    return <Panel
        bsStyle='info'
        header={versionHeader}
        footer={<span><Icon name='file-archive-o'/> {numeral(version.fileSize || 0).format('0 b')} zip file last modified at {version.fileTimestamp ? moment(version.fileTimestamp).format(timeFormat + ', ' + dateFormat) : 'N/A' }</span>}
      >
        <ListGroup fill>
            <ListGroupItem
              style={{
                maxHeight: '200px',
                overflowY: 'hidden',
                padding: '0px'
              }}
              >
              <Image
                style={{
                  position: 'relative',
                  top: '50%',
                  transform: 'translateY(-30%)'
                }}
                responsive
                src={mapUrl}
              />
            </ListGroupItem>
            <ListGroupItem
              header={
                <h4>
                  {`${moment(version.validationSummary.startDate).format(dateFormat)} to ${moment(version.validationSummary.endDate).format(dateFormat)}`}
                  {' '}
                  <small>
                    {this.getVersionDateLabel(version)}
                  </small>
                </h4>
              }
            >
              <Icon name='calendar'/> {getMessage(messages, 'validDates')}
            </ListGroupItem>
            <ListGroupItem>
            <Tabs
              activeKey={this.state.tab}
              onSelect={(key) => this.selectTab(key)}
              id='uncontrolled-tab-example'
              bsStyle='pills'
            >
              <Tab eventKey={'feed'} title='Summary'>
                <Row>
                  <Col xs={3} className='text-center'>
                    <p title={`${version.validationSummary.agencyCount}`} style={{marginBottom: '0px', fontSize: '200%'}}>{numeral(version.validationSummary.agencyCount).format('0 a')}</p>
                    <p style={{marginBottom: '0px'}}>{getMessage(messages, 'agencyCount')}</p>
                  </Col>
                  <Col xs={3} className='text-center'>
                    <p title={`${version.validationSummary.routeCount}`} style={{marginBottom: '0px', fontSize: '200%'}}>{numeral(version.validationSummary.routeCount).format('0 a')}</p>
                    <p style={{marginBottom: '0px'}}>{getMessage(messages, 'routeCount')}</p>
                  </Col>
                  <Col xs={3} className='text-center'>
                    <p title={`${version.validationSummary.tripCount}`} style={{marginBottom: '0px', fontSize: '200%'}}>{numeral(version.validationSummary.tripCount).format('0 a')}</p>
                    <p style={{marginBottom: '0px'}}>{getMessage(messages, 'tripCount')}</p>
                  </Col>
                  <Col xs={3} className='text-center'>
                    <p title={`${version.validationSummary.stopTimesCount}`} style={{marginBottom: '0px', fontSize: '200%'}}>{numeral(version.validationSummary.stopTimesCount).format('0 a')}</p>
                    <p style={{marginBottom: '0px'}}>{getMessage(messages, 'stopTimesCount')}</p>
                  </Col>
                </Row>
              </Tab>
              <Tab eventKey={'routes'} title='Routes'>
                <Routes
                  version={this.props.version}
                  selectTab={(key) => this.selectTab(key)}
                  tableOptions={tableOptions}
                />
              </Tab>
              <Tab eventKey={'patterns'} title='Patterns'>
              <Patterns
                version={this.props.version}
                selectTab={(key) => this.selectTab(key)}
                tableOptions={tableOptions}
              />
              </Tab>
              <Tab eventKey={'stops'} title='Stops'>
                <Stops
                  version={this.props.version}
                  selectTab={(key) => this.selectTab(key)}
                  tableOptions={tableOptions}
                />
              </Tab>
            </Tabs>
            </ListGroupItem>
        </ListGroup>
      </Panel>
  }
}
