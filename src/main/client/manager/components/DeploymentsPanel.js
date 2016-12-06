import React, {Component, PropTypes} from 'react'
import moment from 'moment'
import { LinkContainer } from 'react-router-bootstrap'
import { Row, Label, Col, Button, Table, FormControl, Glyphicon, Panel } from 'react-bootstrap'
import {Icon} from '@conveyal/woonerf'

import ActiveDeploymentViewer from '../containers/ActiveDeploymentViewer'
import EditableTextField from '../../common/components/EditableTextField'
import { getComponentMessages, getMessage } from '../../common/util/config'

export default class DeploymentsPanel extends Component {
  static propTypes = {
    deployments: PropTypes.array,
    deleteDeploymentConfirmed: PropTypes.func,
    deploymentsRequested: PropTypes.func,
    onNewDeploymentClick: PropTypes.func,
    newDeploymentNamed: PropTypes.func,
    updateDeployment: PropTypes.func,
    expanded: PropTypes.bool
  }
  componentWillMount () {
    if (this.props.expanded) {
      this.props.deploymentsRequested()
    }
  }
  // deleteDeployment (deployment) {
  //   console.log(this.refs)
  //   this.refs['page'].showConfirmModal({
  //     title: 'Delete Deployment?',
  //     body: `Are you sure you want to delete the deployment ${deployment.name}?`,
  //     onConfirm: () => {
  //       console.log('OK, deleting')
  //       this.props.deleteDeploymentConfirmed(deployment)
  //     }
  //   })
  // }
  render () {
    const deployment = this.props.deployments && this.props.deployments.find(d => d.id === this.props.activeSubComponent)
    if (deployment) {
      return (
        <ActiveDeploymentViewer
          project={this.props.project}
          deployment={deployment}
          feedSources={this.props.project.feedSources}
        />
      )
    }
    return (
      <Row>
        <Col xs={9}>
          <DeploymentsList
            {...this.props}
          />
        </Col>
        <Col xs={3}>
          <Panel header={<h3>Deploying feeds to OTP</h3>}>
            <p>A collection of feeds can be deployed to OpenTripPlanner (OTP) instances that have been defined in the organization settings.</p>
            <LinkContainer to={`/project/${this.props.project.id}/settings/deployment`}>
              <Button block bsStyle='primary'>
                <Icon type='cog' /> Edit deployment settings
              </Button>
            </LinkContainer>
          </Panel>
        </Col>
      </Row>
    )
  }
}

class DeploymentsList extends Component {
  render () {
    const messages = getComponentMessages('DeploymentsPanel')
    const na = (<span style={{ color: 'lightGray' }}>N/A</span>)
    return (
      <Panel
        header={
          <Row>
            <Col xs={4}>
              <FormControl
                placeholder={getMessage(messages, 'search')}
                onChange={evt => this.props.searchTextChanged(evt.target.value)}
              />
            </Col>
            <Col xs={8}>
              <Button
                bsStyle='success'
                // disabled={projectEditDisabled}
                className='pull-right'
                onClick={() => this.props.onNewDeploymentClick()}
              >
                <Glyphicon glyph='plus' /> {getMessage(messages, 'new')}
              </Button>
            </Col>
          </Row>
        }
      >
        <Table striped hover fill>
          <thead>
            <tr>
              <th className='col-md-4'>{getMessage(messages, 'table.name')}</th>
              <th>{getMessage(messages, 'table.creationDate')}</th>
              <th>{getMessage(messages, 'table.deployedTo')}</th>
              <th>{getMessage(messages, 'table.feedCount')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {this.props.deployments
              ? this.props.deployments.map(dep => {
                return (
                  <tr
                    key={dep.id || 'new-deployment-' + Math.random()}
                  >
                    <td>
                      <EditableTextField
                        isEditing={(dep.isCreating === true)}
                        value={dep.name}
                        onChange={(value) => {
                          if (dep.isCreating) this.props.newDeploymentNamed(value)
                          else this.props.updateDeployment(dep, {name: value})
                        }}
                        link={`/project/${dep.project.id}/deployments/${dep.id}`}
                      />
                    </td>
                    <td>
                      {dep.dateCreated
                        ? (<span>{moment(dep.dateCreated).format('MMM Do YYYY')} ({moment(dep.dateCreated).fromNow()})</span>)
                        : na
                      }
                    </td>
                    <td>
                      {dep.deployedTo
                        ? (<Label>{dep.deployedTo}</Label>)
                        : na
                      }
                    </td>
                    <td>
                      {dep.feedVersions
                        ? (<span>{dep.feedVersions.length}</span>)
                        : na
                      }
                    </td>
                    <td>
                      <Button
                        bsStyle='danger'
                        bsSize='xsmall'
                        // disabled={disabled}
                        className='pull-right'
                        onClick={() => this.props.deleteDeploymentConfirmed(dep)}
                      >
                        <Glyphicon glyph='remove' />
                      </Button>
                    </td>
                  </tr>
                )
              })
              : null
            }
          </tbody>
        </Table>
      </Panel>
    )
  }
}
