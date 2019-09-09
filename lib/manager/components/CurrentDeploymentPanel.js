// @flow

import moment from 'moment'
import Icon from '@conveyal/woonerf/components/icon'
import React, { Component } from 'react'
import {
  Button,
  Panel,
  Label
} from 'react-bootstrap'

import * as deploymentActions from '../actions/deployments'
import { formatTimestamp } from '../../common/util/date-time'
import { getActiveInstanceCount, getServerForId } from '../util/deployment'
import DeploymentPreviewButton from './DeploymentPreviewButton'
import EC2InstanceCard from '../../common/components/EC2InstanceCard'

import type { Deployment, EC2InstanceSummary, OtpServer, ServerJob } from '../../types'

type Props = {
  deployJob: ServerJob,
  deployment: Deployment,
  fetchDeployment: typeof deploymentActions.fetchDeployment,
  server: ?OtpServer
}

export default class CurrentDeploymentPanel extends Component<Props> {
  componentWillReceiveProps (nextProps: Props) {
    // If status message changes while deployment job is in progress, re-fetch
    // deployment to update EC2 instance status.
    if (nextProps.deployJob && this.props.deployJob) {
      if (nextProps.deployJob.status.message !== this.props.deployJob.status.message) {
        this._fetchDeploymentEC2Instances()
      }
    }
  }

  _fetchDeploymentEC2Instances = () => this.props.fetchDeployment(this.props.deployment.id)

  _getServer = () => {
    if (this.props.server) return this.props.server
    const serverId = this.props.deployJob && this.props.deployJob.serverId
    return getServerForId(serverId, this.props.deployment.project)
  }

  _getServerLabel = () => {
    const server = this._getServer()
    return (
      <Label>
        {server
          ? server.name
          : this.props.deployment.deployedTo
        }
      </Label>
    )
  }

  render () {
    const { deployJob, deployment } = this.props
    const server = this._getServer()
    const ec2Info = server && server.ec2Info
    return (
      <Panel header={<h3><Icon type='server' /> Current deployment</h3>}>
        {deployment.deployedTo
          ? <div>
            <ul className='list-unstyled'>
              <li>
                Deployed to: {this._getServerLabel()}
              </li>
              <li>Using ELB?: {ec2Info ? 'Yes' : 'No (built graph over wire)'}</li>
              <li>Last deployed: {formatTimestamp(deployment.lastDeployed)}</li>
            </ul>
            <div style={{ margin: '20px 0' }}>
              <DeploymentPreviewButton block deployment={deployment} />
            </div>
          </div>
          : deployJob
            ? <span>Deployment to {this._getServerLabel()} in progress...</span>
            : 'No current deployment found'
        }
        {ec2Info || deployment.ec2Instances.length > 0
          ? <div>
            <h4>
              EC2 instances ({getActiveInstanceCount(deployment.ec2Instances)} active)
              <Button
                bsSize='xsmall'
                className='pull-right'
                onClick={this._fetchDeploymentEC2Instances}>
                <Icon type='refresh' />
              </Button>
            </h4>
            {deployment.ec2Instances.length > 0
              ? <div style={{ height: '200px', overflow: 'scroll', paddingRight: '10px' }}>
                {deployment.ec2Instances.map(instance => {
                  return <EC2InstanceCard key={instance.instanceId} instance={instance} />
                })}
              </div>
              : null
            }
          </div>
          : null
        }
      </Panel>
    )
  }
}
