import React from 'react'

import { Grid, Row, Col, Button, Table, Input, Panel, Glyphicon } from 'react-bootstrap'
import { Link } from 'react-router'

import ManagerPage from '../components/ManagerPage'
import EditableTextField from './EditableTextField'

export default class FeedSourceViewer extends React.Component {

  constructor (props) {
    super(props)
  }

  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  render () {
    if(!this.props.feedSource) {
      return <ManagerPage />
    }

    return (
      <ManagerPage ref='page'>
        <Grid>
          <Row>
            <Col xs={12}>
              <ul className='breadcrumb'>
                <li><Link to='/'>Projects</Link></li>
                <li><Link to={`/project/${this.props.project.id}`}>{this.props.project.name}</Link></li>
                <li className='active'>{this.props.feedSource.name}</li>
              </ul>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <h2>{this.props.feedSource.name}</h2>
            </Col>
          </Row>
          <Panel header={(<h3>Feed Source Properties</h3>)}>
            Properties
          </Panel>

          <Panel header={(<h3>Feed Versions</h3>)}>
            Versions
          </Panel>
        </Grid>
      </ManagerPage>
    )
  }
}
