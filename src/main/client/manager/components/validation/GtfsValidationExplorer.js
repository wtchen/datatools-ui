import React, {Component, PropTypes} from 'react'
import { Grid, Row, Col, ButtonGroup, Button, Glyphicon, Tabs, Tab } from 'react-bootstrap'
import { Link, browserHistory } from 'react-router'

import ManagerPage from '../../../common/components/ManagerPage'
import IssuesMap from './IssuesMap'
import IsochroneMap from './IsochroneMap'
import GtfsValidationSummary from './GtfsValidationSummary'
import TripsChart from './TripsChart'

export default class GtfsValidationExplorer extends Component {

  constructor (props) {
    super(props)
    this.state = {
      activeTab: 'issues'
    }
  }

  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  componentWillReceiveProps (nextProps) {
    //
    if(this.props.version && nextProps && nextProps.version &&
        this.props.version.id !== nextProps.version.id &&
        !nextProps.version.validationResult) {
      console.log('>>>>>>>>>>>>>>> version changed!!!!!');
      this.props.fetchValidationResult(nextProps.version)
    }
  }

  render() {
    const version = this.props.version

    if (!version || !this.props.version.validationResult) {
      return (
        <ManagerPage ref='page'>
          <Grid>
            <Row>
              <Col xs={12}>
              </Col>
            </Row>
          </Grid>
        </ManagerPage>
      )
    }

    const tabRowStyle = { marginTop: '20px' }

    return (
      <ManagerPage ref='page'>
        <Grid>
          <Row>
            <Col xs={8}>
              <ul className='breadcrumb'>
                <li><Link to='/'>Explore</Link></li>
                <li><Link to='/project'>Projects</Link></li>
                <li><Link to={`/project/${this.props.project.id}`}>{this.props.project.name}</Link></li>
                <li><Link to={`/feed/${version.feedSource.id}`}>{version.feedSource.name}</Link></li>
                <li className='active'>Version {version.version} Validation Explorer</li>
              </ul>
            </Col>
            <Col xs={4}>
              <ButtonGroup className='pull-right'>
                <Button href='#'
                  disabled={!version.previousVersionId}
                  onClick={(evt) => {
                    evt.preventDefault()
                    //this.setState({ versionIndex: this.state.versionIndex - 1 })
                    browserHistory.push(`/feed/${version.feedSource.id}/validation/${version.version - 1}`)
                  }}
                >
                  <Glyphicon glyph='arrow-left' /><span className='hidden-xs'> Previous</span><span className='hidden-xs hidden-sm'> Version</span>
                </Button>
                <Button href='#'
                  disabled={!version.nextVersionId}
                  onClick={(evt) => {
                    evt.preventDefault()
                    //this.setState({ versionIndex: this.state.versionIndex - 1 })
                    browserHistory.push(`/feed/${version.feedSource.id}/validation/${version.version + 1}`)
                  }}
                >
                  <span className='hidden-xs'>Next </span><span className='hidden-xs hidden-sm'>Version </span><Glyphicon glyph='arrow-right' />
                </Button>
              </ButtonGroup>


            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <Tabs
                activeKey={this.state.activeTab}
                onSelect={(key) => {
                  this.setState({activeTab: key})
                  setTimeout(() => {
                    console.log('tab switch', key)
                    const map = this.refs[key + '-map']
                    if(map) map.initializeMap()
                  }, 300); // Adjust timeout to tab transition
                }}
              >
                <Tab eventKey="issues" title="Validation Issues">
                  <Row style={tabRowStyle}>
                    <Col xs={7}>
                      <IssuesMap
                        ref="issues-map"
                        version={version}
                        initialized={true}
                      />
                    </Col>
                    <Col xs={5}>
                      <GtfsValidationSummary
                        validationResult={version.validationResult}
                        version={version}
                        validationResultRequested={() => { this.props.validationResultRequested(version) }}
                      />
                    </Col>
                  </Row>
                </Tab>

                <Tab eventKey="isochrones" title="Accessibilty Explorer">
                  <Row style={tabRowStyle}>
                    <Col xs={12}>
                      <IsochroneMap
                        ref="isochrones-map"
                        fetchIsochrones={this.props.fetchIsochrones}
                        version={version}
                      />
                    </Col>
                  </Row>
                </Tab>

                <Tab eventKey="time" title="Time-based Validation">
                  <Row style={tabRowStyle}>
                    <Col xs={12}>
                      <TripsChart data={version.validationResult.tripsPerDate}/>
                    </Col>
                  </Row>
                </Tab>
              </Tabs>
            </Col>
          </Row>
        </Grid>
      </ManagerPage>
    )
  }
}
