import fetch  from 'isomorphic-fetch'
import React  from 'react'
import { Grid, Row, Col, Button, Table, Input, Panel, Glyphicon } from 'react-bootstrap'
import { Link, browserHistory } from 'react-router'

import ManagerPage  from '../../common/components/ManagerPage'
import EditableTextField from '../../common/components/EditableTextField'
import { retrievalMethodString } from '../../common/util/util'
import ExternalPropertiesTable  from './ExternalPropertiesTable'
import FeedVersionNavigator  from './FeedVersionNavigator'
import NotesViewer from './NotesViewer'

const retrievalMethods = [
  'FETCHED_AUTOMATICALLY',
  'MANUALLY_UPLOADED',
  'PRODUCED_IN_HOUSE'
]

export default class FeedSourceViewer extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      snapshotVersions: []
    }

    if(this.props.feedSource && this.props.feedSource.retrievalMethod === 'PRODUCED_IN_HOUSE') {
      this.updateSnapshotVersions(this.props.feedSource)
    }
  }

  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  componentWillReceiveProps (nextProps) {
    if(nextProps.feedSource && nextProps.feedSource.retrievalMethod === 'PRODUCED_IN_HOUSE') {
      this.updateSnapshotVersions(nextProps.feedSource)
    }
  }

  updateSnapshotVersions (feedSource) {
    const url = DT_CONFIG.modules.editor.url + '/api/mgrsnapshot?sourceId=' + feedSource.id
    fetch(url)
      .then(res => res.json())
      .then(snapshots => {
        this.setState({
          snapshotVersions: snapshots
        })
      })
      .catch(err => {
        console.log('Error fetching snapshots', err)
      })
  }

  deleteFeedVersion (feedSource, feedVersion) {
    this.refs['page'].showConfirmModal({
      title: 'Delete Feed Version?',
      body: 'Are you sure you want to delete this version?',
      onConfirm: () => {
        this.props.deleteFeedVersionConfirmed(feedSource, feedVersion)
      }
    })
  }

  render () {
    const fs = this.props.feedSource

    if(!fs) {
      return <ManagerPage />
    }

    return (
      <ManagerPage ref='page'>
        <Grid>
          <Row>
            <Col xs={12}>
              <ul className='breadcrumb'>
                <li><Link to='/'>Explore</Link></li>
                <li><Link to='/project'>Projects</Link></li>
                <li><Link to={`/project/${this.props.project.id}`}>{this.props.project.name}</Link></li>
                <li className='active'>{fs.name}</li>
              </ul>
            </Col>
          </Row>

          <Row>
            <Col xs={8}>
              <h2>{fs.name} <small>Private view (<Link to={`/public/feed/${fs.id}`}>View public page</Link>)</small></h2>
            </Col>
            <Col xs={4}>
              <h2>
                {DT_CONFIG.modules.gtfsplus && DT_CONFIG.modules.gtfsplus.enabled
                  ? <Button
                      bsStyle='primary'
                      className='pull-right'
                      onClick={() => { browserHistory.push(`/gtfsplus/${fs.id}`) }}
                    >Edit GTFS+</Button>
                  : null
                }
              </h2>
            </Col>
          </Row>

          <Panel header={(<h3><Glyphicon glyph='cog' /> Feed Source Properties</h3>)}>
            <Row>
              <Col xs={6}>
                <Table striped>
                  <thead>
                    <tr>
                      <th className='col-md-4'>Property</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Name</td>
                      <td>
                        <EditableTextField
                          value={fs.name}
                          onChange={(value) => this.props.feedSourcePropertyChanged(fs, 'name', value)}
                        />
                      </td>
                    </tr>

                    <tr>
                      <td>Retrieval Method</td>
                      <td>
                        <Input type='select'
                          value={fs.retrievalMethod}
                          onChange={(evt) => {
                            console.log(evt.target.value);
                            this.props.feedSourcePropertyChanged(fs, 'retrievalMethod', evt.target.value)
                          }}
                        >
                          {retrievalMethods.map(method => {
                            return <option value={method} key={method}>
                              {retrievalMethodString(method)}
                            </option>
                          })}
                        </Input>
                      </td>
                    </tr>

                    {fs.retrievalMethod === 'FETCHED_AUTOMATICALLY'
                      ? <tr>
                          <td>Retrieval URL</td>
                          <td>
                            <EditableTextField
                              value={fs.url}
                              onChange={(value) => this.props.feedSourcePropertyChanged(fs, 'url', value)}
                            />
                          </td>
                        </tr>
                      : null
                    }

                    {fs.retrievalMethod === 'PRODUCED_IN_HOUSE'
                      ? <tr>
                          <td>Editor Snapshot</td>
                          <td>
                            <Input type='select'
                              value={fs.snapshotVersion}
                              onChange={(evt) => {
                                console.log(evt.target.value);
                                this.props.feedSourcePropertyChanged(fs, 'snapshotVersion', evt.target.value)
                              }}
                            >
                              {this.state.snapshotVersions.map(snapshot => {
                                return <option value={snapshot.id} key={snapshot.id}>
                                  {snapshot.name}
                                </option>
                              })}
                            </Input>
                          </td>
                        </tr>
                      : null
                    }
                  </tbody>
                </Table>
              </Col>

              <Col xs={6}>
                {Object.keys(fs.externalProperties || {}).map(resourceType => {
                  console.log('>> resourceType=' + resourceType);
                  return (<ExternalPropertiesTable
                    resourceType={resourceType}
                    resourceProps={fs.externalProperties[resourceType]}
                    externalPropertyChanged={(name, value) => {
                      this.props.externalPropertyChanged(fs, resourceType, name, value)
                    }}
                  />)
                })}
              </Col>

            </Row>
          </Panel>

          <NotesViewer
            title='Comments for this Feed Source'
            notes={fs.notes}
            noteCount={fs.noteCount}
            notesRequested={() => { this.props.notesRequestedForFeedSource(fs) }}
            newNotePosted={(note) => { this.props.newNotePostedForFeedSource(fs, note) }}
          />

          <Panel header={(<h3><Glyphicon glyph='list' /> Feed Versions</h3>)}>
            <FeedVersionNavigator
              versions={fs.feedVersions}
              feedSource={fs}
              validationResultRequested={(version) => this.props.validationResultRequested(fs, version) }
              updateFeedClicked={() => this.props.updateFeedClicked(fs)}
              uploadFeedClicked={() => {
                console.log('showing modal');
                this.refs.page.showSelectFileModal({
                  title: 'Upload Feed',
                  body: 'Select a GTFS feed to upload:',
                  onConfirm: (files) => {
                    console.log('selected file', files[0]);
                    this.props.uploadFeedClicked(fs, files[0])
                  }
                })
              }}
              downloadFeedClicked={(version) => this.props.downloadFeedClicked(version)}
              deleteVersionClicked={(version) => {
                this.deleteFeedVersion(fs, version)
              }}
              notesRequestedForVersion={(version) => {
                  this.props.notesRequestedForVersion(version)
              }}
              newNotePostedForVersion={(version,note) => {
                this.props.newNotePostedForVersion(version, note)
              }}
            />
          </Panel>
        </Grid>
      </ManagerPage>
    )
  }
}
