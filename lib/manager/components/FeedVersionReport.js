import React, {Component, PropTypes} from 'react'
import { Row, Col, Button, Panel, ControlLabel, Label, Tabs, Tab, ButtonGroup, ListGroup, ListGroupItem } from 'react-bootstrap'
import moment from 'moment'
import {Icon} from '@conveyal/woonerf'
import numeral from 'numeral'
import Rcslider from 'rc-slider'
import fileDownload from 'react-file-download'
import area from 'turf-area'
import bboxPoly from 'turf-bbox-polygon'

import EditableTextField from '../../common/components/EditableTextField'
import ActiveGtfsMap from '../../gtfs/containers/ActiveGtfsMap'
import { VersionButtonToolbar } from './FeedVersionViewer'
import { getComponentMessages, getConfigProperty, getMessage, isModuleEnabled, isExtensionEnabled } from '../../common/util/config'
import { getProfileLink } from '../../common/util/util'
// import { downloadAsShapefile } from '../util'
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
    isPublic: PropTypes.bool,
    hasVersions: PropTypes.bool,
    feedVersionRenamed: PropTypes.func,
    fetchValidationResult: PropTypes.func,
    publishFeedVersion: PropTypes.func
  }
  constructor (props) {
    super(props)
    this.state = {
      tab: 'feed',
      mapHeight: MAP_HEIGHTS[0],
      isochroneBand: 60 * 60
    }
  }
  getBoundsArea (bounds) {
    const poly = bounds && bboxPoly([bounds.west, bounds.south, bounds.east, bounds.east])
    return poly && area(poly)
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
  renderIsochroneMessage (version) {
    if (version.isochrones && version.isochrones.features) {
      return <span>
        Move marker or change date/time to recalculate travel shed.<br />
        <Button
          bsStyle='success'
          bsSize='small'
          onClick={() => {
            // TODO: add shapefile download (currently shp-write does not support isochrones)
            // downloadAsShapefile(version.isochrones, {folder: 'isochrones', types: {line: 'isochrones'}})
            fileDownload(JSON.stringify(version.isochrones), `isochrones_${version.feedSource.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`)
          }}>
          <Icon type='download' /> Export isochrones
        </Button>
      </span>
    } else if (version.isochrones) {
      return 'Reading transport network, please try again later.'
    } else {
      return 'Click on map above to show travel shed for this feed.'
    }
  }
  renderValidatorTabs (version) {
    if (!isModuleEnabled('validator')) {
      return null
    }
    const validatorTabs = [
      {
        title: 'Validation',
        key: 'validation',
        component: <GtfsValidationSummary
          version={version}
          key='validation'
          feedVersionIndex={this.props.feedVersionIndex}
          fetchValidationResult={() => { this.props.fetchValidationResult(version) }}
        />
      },
      {
        title: 'Accessibility',
        key: 'accessibility',
        component: <div>
          <Row>
            <Col xs={12}>
              {/* isochrone message */}
              <p className='lead text-center'>
                {this.renderIsochroneMessage(version)}
              </p>
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
            version={version}
          />
        </div>
      },
      {
        title: 'Timeline',
        key: 'timeline',
        component: <div>
          <Row>
            <Col xs={12}>
              <p className='lead text-center'>Number of trips per date of service.</p>
            </Col>
          </Row>
          <TripsChart
            validationResult={version.validationResult}
            fetchValidationResult={() => { this.props.fetchValidationResult(version) }}
          />
        </div>
      }
    ]
    return validatorTabs.map(t => (
      <Tab eventKey={t.key} title={t.title} key={t.key}>
        {t.component}
      </Tab>
    ))
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
            ? <Icon title='Feed loaded successfully, and is error-free!' className='text-success' type='check' style={{marginRight: 10}} />
            : version.validationSummary.errorCount > 0
            ? <Icon title='Feed loaded successfully, but has errors.' className='text-warning' type='exclamation-triangle' style={{marginRight: 10}} />
            : <Icon title='Feed did not load successfully, something has gone wrong!' className='text-danger' type='times' style={{marginRight: 10}} />
          }
          {this.props.isPublic
            ? <span>{version.name}</span>
            : <EditableTextField
              inline
              value={version.name}
              maxWidth={40}
              disabled={this.props.isPublic}
              onChange={(value) => this.props.feedVersionRenamed(version, value)} />
          }
          <VersionButtonToolbar
            {...this.props}
          />
        </h4>
        <small title={moment(version.updated).format(dateFormat + ', ' + timeFormat)}>
          <Icon type='clock-o' /> Version published {moment(version.updated).fromNow()} by {version.user ? <a href={getProfileLink(version.user)}><strong>{version.user}</strong></a> : '[unknown]'}
        </small>
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
    const countFields = ['agencyCount', 'routeCount', 'tripCount', 'stopTimesCount']
    return (
      <Panel
        bsStyle='info'
        header={versionHeader}
        footer={<span><Icon type='file-archive-o' /> {numeral(version.fileSize || 0).format('0 b')} zip file last modified at {version.fileTimestamp ? moment(version.fileTimestamp).format(timeFormat + ', ' + dateFormat) : 'N/A' }</span>}
      >
        <ListGroup fill>
          <ListGroupItem
            style={{
              maxHeight: `${this.state.mapHeight}px`,
              overflowY: 'hidden',
              padding: '0px'
            }}
            >
            <ButtonGroup bsSize='small' style={{position: 'absolute', zIndex: 100, right: 5, top: 5}}>
              <Button active={this.state.mapHeight === MAP_HEIGHTS[0]} onClick={() => this.setState({mapHeight: MAP_HEIGHTS[0]})}>Slim</Button>
              <Button active={this.state.mapHeight === MAP_HEIGHTS[1]} onClick={() => this.setState({mapHeight: MAP_HEIGHTS[1]})}>Large</Button>
            </ButtonGroup>
            <ActiveGtfsMap
              ref='map'
              version={this.props.version}
              disableRefresh
              disableScroll
              disablePopup
              renderTransferPerformance
              showBounds={this.state.tab === 'feed' || this.state.tab === 'accessibility'}
              showIsochrones={this.state.tab === 'accessibility'}
              isochroneBand={this.state.isochroneBand}
              height={this.state.mapHeight}
              width='100%'
            />
          </ListGroupItem>
          <ListGroupItem>
            <h4>
              {isExtensionEnabled('mtc')
                ? <Button
                  disabled={this.props.isPublished}
                  className='pull-right'
                  bsStyle={this.props.isPublished ? 'success' : 'warning'}
                  onClick={() => this.props.publishFeedVersion(version)}
                >
                  {this.props.isPublished
                    ? <span><Icon type='check-circle' /> Published</span>
                    : <span>Publish to MTC</span>
                  }
                </Button>
                : null
              }
              <Icon type='calendar' /> {`Valid from ${moment(version.validationSummary.startDate).format(dateFormat)} to ${moment(version.validationSummary.endDate).format(dateFormat)}`}
              {' '}
              {this.getVersionDateLabel(version)}
            </h4>
            <p>
              {version.validationSummary && version.validationSummary.avgDailyRevenueTime
                ? <span><Icon type='clock-o' /> {Math.floor(version.validationSummary.avgDailyRevenueTime / 60 / 60 * 100) / 100} hours daily service (Tuesday)</span>
                : null
              }
              {version.validationSummary && version.validationSummary.bounds && getConfigProperty('application.dev')
                ? <span><Icon type='globe' /> {this.getBoundsArea(version.validationSummary.bounds)} square meters</span>
                : null
              }
            </p>
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
                  {countFields.map(c => (
                    <Col xs={3} className='text-center' key={c}>
                      <p title={`${version.validationSummary[c]}`} style={{marginBottom: '0px', fontSize: '200%'}}>{numeral(version.validationSummary[c]).format('0 a')}</p>
                      <p style={{marginBottom: '0px'}}>{getMessage(messages, c)}</p>
                    </Col>
                  ))}
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
              {this.renderValidatorTabs(version)}
            </Tabs>
          </ListGroupItem>
        </ListGroup>
      </Panel>
    )
  }
}
