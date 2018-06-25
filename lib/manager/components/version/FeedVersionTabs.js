import React, {PropTypes, Component} from 'react'
import { Row, Col, Tabs, Tab, ListGroupItem } from 'react-bootstrap'
import numeral from 'numeral'

import Patterns from '../reporter/containers/Patterns'
import Routes from '../reporter/containers/Routes'
import Stops from '../reporter/containers/Stops'
import TripsChart from '../validation/TripsChart'
import FeedVersionAccessibility from './FeedVersionAccessibility'
import {getComponentMessages, getMessage, isModuleEnabled} from '../../../common/util/config'

export default class FeedVersionTabs extends Component {
  static propTypes = {
    version: PropTypes.object
  }

  _onClickTab = (key) => {
    if (this.props.tab !== key) {
      this.props.selectTab(key)
    }
  }

  renderValidatorTabs = (version, feedVersionIndex, isochroneBand, onChangeIsochroneBand) => {
    const VALIDATOR_TABS = [{
      title: 'Timeline',
      key: 'timeline',
      component: <div>
        <Row>
          <Col xs={12}>
            <p className='lead text-center'>Number of trips per date of service.</p>
          </Col>
        </Row>
        <TripsChart validationResult={version.validationResult} />
      </div>
    }]
    if (isModuleEnabled('validator')) {
      // Show accessibility isochrones if validator enabled
      VALIDATOR_TABS.push({
        title: 'Accessibility',
        key: 'accessibility',
        component: <FeedVersionAccessibility
          isochroneBand={isochroneBand}
          changeIsochroneBand={onChangeIsochroneBand}
          version={version} />
      })
    }
    return VALIDATOR_TABS.map(t => (
      <Tab eventKey={t.key} title={t.title} key={t.key}>
        {t.component}
      </Tab>
    ))
  }

  render () {
    const {version, feedVersionIndex, isochroneBand, onChangeIsochroneBand} = this.props
    const messages = getComponentMessages('FeedVersionTabs')
    const tableOptions = {
      striped: true,
      search: true,
      hover: true,
      exportCSV: true,
      pagination: true,
      options: {
        paginationShowsTotal: true,
        sizePerPageList: [10, 20, 50, 100]
      }
    }
    const countFields = ['agencyCount', 'routeCount', 'tripCount', 'stopTimesCount']
    return (
      <ListGroupItem>
        {/* Tabs - Summary, Routes, Patterns, Stops, (Validation, Accessibility, Timeline) */}
        <Tabs
          activeKey={this.props.tab}
          onSelect={this._onClickTab}
          id='validator-tabs'
          bsStyle='pills'
          unmountOnExit>
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
              version={version}
              selectTab={this.props.selectTab}
              tableOptions={tableOptions} />
          </Tab>
          <Tab eventKey={'patterns'} title='Patterns'>
            <Patterns
              version={version}
              selectTab={this.props.selectTab}
              tableOptions={tableOptions} />
          </Tab>
          <Tab eventKey={'stops'} title='Stops'>
            <Stops
              version={version}
              selectTab={this.props.selectTab}
              tableOptions={tableOptions} />
          </Tab>
          {this.renderValidatorTabs(version, feedVersionIndex, isochroneBand, onChangeIsochroneBand)}
        </Tabs>
      </ListGroupItem>
    )
  }
}
