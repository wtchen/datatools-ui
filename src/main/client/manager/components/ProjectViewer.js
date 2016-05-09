import React from 'react'
import Helmet from 'react-helmet'
import moment from 'moment'
import moment_tz from 'moment-timezone'
import { Grid, Row, Col, Button, Table, Input, Panel, Glyphicon, Badge, ButtonInput, form } from 'react-bootstrap'
import { Link } from 'react-router'

import ManagerPage from '../../common/components/ManagerPage'
import EditableTextField from '../../common/components/EditableTextField'
import { defaultSorter, retrievalMethodString } from '../../common/util/util'
import languages from '../../common/util/languages'

export default class ProjectsList extends React.Component {

  constructor (props) {
    super(props)

    this.state = {}
  }

  deleteFeedSource (feedSource) {
    this.refs['page'].showConfirmModal({
      title: 'Delete Feed Source?',
      body: `Are you sure you want to delete the feed source ${feedSource.name}?`,
      onConfirm: () => {
        console.log('OK, deleting')
        this.props.deleteFeedSourceConfirmed(feedSource)
      }
    })
  }
  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  render () {

    if(!this.props.project) {
      return <ManagerPage />
    }

    const projectEditDisabled = !this.props.user.permissions.isProjectAdmin(this.props.project.id)
    const filteredFeedSources = this.props.project.feedSources
      ? this.props.project.feedSources.filter(feedSource => {
          if(feedSource.isCreating) return true // feeds actively being created are always visible
          return feedSource.name !== null ? feedSource.name.toLowerCase().indexOf((this.props.visibilitySearchText || '').toLowerCase()) !== -1 : '[unnamed project]'
        }).sort(defaultSorter)
      : []

    return (
      <ManagerPage ref='page'>
      <Helmet
        title={this.props.project.name}
      />
        <Grid>
          <Row>
            <Col xs={12}>
              <ul className='breadcrumb'>
                <li><Link to='/'>Explore</Link></li>
                <li><Link to='/project'>Projects</Link></li>
                <li className='active'>{this.props.project.name}</li>
              </ul>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <h2>{this.props.project.name}</h2>
            </Col>
          </Row>

          <Panel
            header={(<h3><Glyphicon glyph='cog' /> Project Settings</h3>)}
            collapsible
          >
            <form>
            <Row>
              <Col xs={6}>
                  <Input
                    type="text"
                    defaultValue={this.props.project.defaultLocationLat !== null &&  this.props.project.defaultLocationLon !== null ?
                      `${this.props.project.defaultLocationLat},${this.props.project.defaultLocationLon}` :
                      ''}
                    placeholder="34.8977,-87.29987"
                    label={(<span><Glyphicon glyph='map-marker' /> Default location (lat, lng)</span>)}
                    ref="defaultLocation"
                    onChange={(evt) => {
                      const latLng = evt.target.value.split(',')
                      console.log(latLng)
                      if (typeof latLng[0] !== 'undefined' && typeof latLng[1] !== 'undefined')
                        this.setState({defaultLocationLat: latLng[0], defaultLocationLon: latLng[1]})
                      else
                        console.log('invalid value for latlng')
                    }}
                  />
                  <Input
                    type="text"
                    defaultValue={this.props.project.north !== null ? `${this.props.project.west},${this.props.project.south},${this.props.project.east},${this.props.project.north}` : ''}
                    placeholder="-88.45,33.22,-87.12,34.89"
                    label={(<span><Glyphicon glyph='fullscreen' /> Bounding box (west, south, east, north)</span>)}
                    ref="boundingBox"
                    onChange={(evt) => {
                      const bBox = evt.target.value.split(',')
                      if (bBox.length === 4)
                        this.setState({west: bBox[0], south: bBox[1], east: bBox[2], north: bBox[3]})
                    }}
                  />
              </Col>
              <Col xs={6}>
                <Input type='select'
                  label={(<span><Glyphicon glyph='time' /> Default time zone</span>)}
                  value={this.state.defaultTimeZone || this.props.project.defaultTimeZone}
                  onChange={(evt) => {
                    console.log(evt.target.value);
                    this.setState({ defaultTimeZone: evt.target.value })
                  }}
                >
                  {moment_tz.tz.names().map(tz => {
                    return <option value={tz} key={tz}>
                      {tz}
                    </option>
                  })}
                </Input>

                <Input type='select'
                  label={(<span><Glyphicon glyph='globe' /> Default language</span>)}
                  value={this.state.defaultLanguage || this.props.project.defaultLanguage}
                  onChange={(evt) => {
                    console.log(evt.target.value);
                    this.setState({ defaultLanguage: evt.target.value })
                    //this.props.feedSourcePropertyChanged(fs, 'retrievalMethod', evt.target.value)
                  }}
                >
                  {languages.map(language => {
                    return <option value={language.code} key={language.code}>
                      {language.name}
                    </option>
                  })}
                </Input>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <ButtonInput
                  bsStyle="primary"
                  type="submit"
                  disabled={projectEditDisabled}
                  onClick={(evt) => {
                    evt.preventDefault()
                    console.log(this.state)
                    console.log(this.props.project)
                    this.props.updateProjectSettings(this.props.project, this.state)
                  }}
                >
                  Save
                </ButtonInput>
              </Col>
            </Row>
            </form>
          </Panel>

          <Panel
            header={(<h3><Glyphicon glyph='list' /> Feed Sources</h3>)}
            collapsible
            defaultExpanded={true}
          >
            <Row>
              <Col xs={4}>
                <Input
                  type="text"
                  placeholder="Search by Feed Source Name"
                  onChange={evt => this.props.searchTextChanged(evt.target.value)}
                />
              </Col>
              <Col xs={8}>

                {DT_CONFIG.extensions.transitland && DT_CONFIG.extensions.transitland.enabled
                  ? <Button
                      bsStyle='primary'
                      disabled={projectEditDisabled}
                      id='TRANSITLAND'
                      onClick={(evt) => {
                        this.props.thirdPartySync('TRANSITLAND')
                      }}
                    >
                      <Glyphicon glyph='refresh' /> transit.land
                    </Button>
                  : null
                }

                {DT_CONFIG.extensions.transitfeeds && DT_CONFIG.extensions.transitfeeds.enabled
                  ? <Button
                      bsStyle='primary'
                      disabled={projectEditDisabled}
                      id='TRANSITFEEDS'
                      onClick={(evt) => {
                        this.props.thirdPartySync('TRANSITFEEDS')
                      }}
                    >
                      <Glyphicon glyph='refresh' /> transitfeeds.com
                    </Button>
                  : null
                }

                {DT_CONFIG.extensions.mtc && DT_CONFIG.extensions.mtc.enabled
                  ? <Button
                      bsStyle='primary'
                      disabled={projectEditDisabled}
                      id='MTC'
                      onClick={(evt) => {
                        this.props.thirdPartySync('MTC')
                      }}
                    >
                      <Glyphicon glyph='refresh' /> MTC
                    </Button>
                  : null
                }

                <Button
                  bsStyle='default'
                  disabled={projectEditDisabled}
                  onClick={() => {
                    console.log(this.props.project)
                    this.props.updateAllFeeds(this.props.project)
                  }}
                >
                  <Glyphicon glyph='refresh' /> Update all feeds
                </Button>
                <Button
                  bsStyle='primary'
                  disabled={projectEditDisabled}
                  className='pull-right'
                  onClick={() => this.props.onNewFeedSourceClick()}
                >
                  New Feed Source
                </Button>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <Table striped hover>
                  <thead>
                    <tr>
                      <th className='col-md-4'>Name</th>
                      <th>Public?</th>
                      <th>Retrieval Method</th>
                      <th>GTFS Last Updated</th>
                      <th>Error<br/>Count</th>
                      <th>Valid Range</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFeedSources.map((feedSource) => {
                      return <FeedSourceTableRow
                        feedSource={feedSource}
                        project={this.props.project}
                        key={feedSource.id}
                        user={this.props.user}
                        newFeedSourceNamed={this.props.newFeedSourceNamed}
                        feedSourcePropertyChanged={this.props.feedSourcePropertyChanged}
                        deleteFeedSourceClicked={() => this.deleteFeedSource(feedSource)}
                      />
                    })}
                  </tbody>
                </Table>
              </Col>
            </Row>
          </Panel>
        </Grid>
      </ManagerPage>
    )
  }
}

class FeedSourceTableRow extends React.Component {

  constructor (props) {
    super(props)
  }

  render () {
    const fs = this.props.feedSource
    const na = (<span style={{ color: 'lightGray' }}>N/A</span>)
    const disabled = !this.props.user.permissions.hasFeedPermission(this.props.project.id, fs.id, 'manage-feed')
    return (
      <tr key={fs.id}>
        <td className="col-md-4">
          <div>
            <EditableTextField
              isEditing={(fs.isCreating === true)}
              value={fs.name}
              disabled={disabled}
              onChange={(value) => {
                if(fs.isCreating) this.props.newFeedSourceNamed(value)
                else this.props.feedSourcePropertyChanged(fs, 'name', value)
              }}
              link={`/feed/${fs.id}`}
            />
          </div>
        </td>
        <td>
          <Input
            type='checkbox'
            label='&nbsp;'
            disabled={disabled}
            defaultChecked={fs.isPublic}
            onChange={(e) => {
              console.log(e.target.checked)

              this.props.feedSourcePropertyChanged(fs, 'isPublic', e.target.checked)
            }}
          />
        </td>
        <td>
          <Badge>{retrievalMethodString(fs.retrievalMethod)}</Badge>
        </td>
        <td>{fs.lastUpdated ? moment(fs.lastUpdated).format('MMM Do YYYY') : na}</td>
        <td>{fs.latestValidation ? fs.latestValidation.errorCount : na}</td>
        <td>{fs.latestValidation
          ? (<span>{moment(fs.latestValidation.startDate).format('MMM Do YYYY')} to {moment(fs.latestValidation.endDate).format('MMM Do YYYY')}</span>)
          : na
        }</td>
        <td>
          <Button
            bsStyle='danger'
            bsSize='small'
            disabled={disabled}
            className='pull-right'
            onClick={this.props.deleteFeedSourceClicked}
          >
            <Glyphicon glyph='remove' />
          </Button>
        </td>
      </tr>
    )
  }
}
