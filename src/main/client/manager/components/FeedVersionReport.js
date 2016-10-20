import React, {Component, PropTypes} from 'react'
import { Row, Col, Image, Button, Panel, ControlLabel, Label, Tabs, Tab, Glyphicon, FormControl, ButtonGroup, ButtonToolbar, ListGroup, ListGroupItem } from 'react-bootstrap'
import moment from 'moment'
import Icon from 'react-fa'
import numeral from 'numeral'
import Rcslider from 'rc-slider'
import EditableTextField from '../../common/components/EditableTextField'
import ActiveGtfsMap from '../../gtfs/containers/ActiveGtfsMap'
import { VersionButtonToolbar } from './FeedVersionViewer'
import { getComponentMessages, getMessage, getConfigProperty, isModuleEnabled } from '../../common/util/config'

// import Feed from './reporter/containers/Feed'
import Patterns from './reporter/containers/Patterns'
import Routes from './reporter/containers/Routes'
import Stops from './reporter/containers/Stops'
import GtfsValidationSummary from './validation/GtfsValidationSummary'
import TripsChart from './validation/TripsChart'
import ActiveDateTimeFilter from './reporter/containers/ActiveDateTimeFilter'

const dateFormat = 'MMM. DD, YYYY'
const timeFormat = 'h:MMa'
const MAP_HEIGHTS = [200, 400]
const ISO_BANDS = []
for (var i = 0; i < 24; i++) {
  ISO_BANDS.push(300 * (i + 1))
}
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
    fetchValidationResult: PropTypes.func,
    // downloadFeedClicked: PropTypes.func,
    // loadFeedVersionForEditing: PropTypes.func
  }
  constructor (props) {
    super(props)
    this.state = {
      tab: 'feed',
      mapHeight: MAP_HEIGHTS[0],
      isochroneBand: 60 * 60
    }
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
        paginationShowsTotal: true,
        sizePerPageList: [10, 20, 50, 100]
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
                maxHeight: `${this.state.mapHeight}px`,
                overflowY: 'hidden',
                padding: '0px'
              }}
              >
              <ButtonGroup bsSize='small' style={{position: 'absolute', zIndex: 1000, right: 5, top: 5}}>
                <Button active={this.state.mapHeight === MAP_HEIGHTS[0]} onClick={() => this.setState({mapHeight: MAP_HEIGHTS[0]})}>Slim</Button>
                <Button active={this.state.mapHeight === MAP_HEIGHTS[1]} onClick={() => this.setState({mapHeight: MAP_HEIGHTS[1]})}>Large</Button>
              </ButtonGroup>
              <ActiveGtfsMap
                ref='map'
                version={this.props.version}
//                feeds={[this.props.version.feedSource]}
                disableRefresh
                disableScroll
                disablePopup
                showBounds={this.state.tab === 'feed' || this.state.tab === 'accessibility'}
                showIsochrones={this.state.tab === 'accessibility'}
                isochroneBand={this.state.isochroneBand}
                // onStopClick={this.props.onStopClick}
                // onRouteClick={this.props.onRouteClick}
                // newEntityId={this.props.newEntityId}
                // searchFocus={this.state.searchFocus}
                // entities={this.state.searching}
                // popupAction={this.props.popupAction}
                height={this.state.mapHeight}
                width='100%'
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
              onSelect={(key) => {
                if (this.state.tab !== key) {
                  this.selectTab(key)
                }
              }}
              id='uncontrolled-tab-example'
              bsStyle='pills'
              unmountOnExit
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
                {
                /*<Feed
                  version={this.props.version}
                  selectTab={(key) => this.selectTab(key)}
                  tableOptions={tableOptions}
                />*/
              }
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
              {isModuleEnabled('validator')
                ? [
                <Tab eventKey={'validation'} title='Validation'>
                  <GtfsValidationSummary
                    version={this.props.version}
                    key='validation'
                    feedVersionIndex={this.props.feedVersionIndex}
                    fetchValidationResult={() => { this.props.fetchValidationResult(this.props.version) }}
                  />
                </Tab>,
                <Tab eventKey={'accessibility'} title='Accessibility' key='accessibility'>
                  <div>
                    <Row>
                      <Col xs={12}>
                        <p className='lead text-center'>Click on map above to show travel shed for this feed.</p>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6} mdOffset={3} xs={12} style={{marginBottom: '20px'}}>
                        <ControlLabel>Travel time</ControlLabel>
                        <Rcslider
                          min={5}
                          max={120}
                          defaultValue={this.state.isochroneBand / 60}
                          onChange={(value) => this.setState({isochroneBand: value * 60})}
                          step={5}
                          marks={{
                            15: '¼ hour',
                            30: '½ hour',
                            60: <strong>1 hour</strong>,
                            120: '2 hours'
                          }}
                          tipFormatter={(value) => {
                            return `${value} minutes`
                          }}
                        />
                      </Col>
                    </Row>
                    <ActiveDateTimeFilter
                      version={this.props.version}
                    />
                  </div>
                </Tab>,
                <Tab eventKey={'timeline'} title='Timeline' key='timeline'>
                  <Row>
                    <Col xs={12}>
                      <p className='lead text-center'>Number of trips per date of service.</p>
                    </Col>
                  </Row>
                  <TripsChart
                    validationResult={this.props.version.validationResult}
                    fetchValidationResult={() => { this.props.fetchValidationResult(version) }}
                  />
                </Tab>
              ]
              : null
            }
            </Tabs>
            </ListGroupItem>
        </ListGroup>
      </Panel>
  }
}
