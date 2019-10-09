// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, { Component } from 'react'
import {
  Button,
  ButtonToolbar,
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
  deployJobs: Array<ServerJob>,
  deployment: Deployment,
  downloadBuildArtifact: typeof deploymentActions.downloadBuildArtifact,
  fetchDeployment: typeof deploymentActions.fetchDeployment,
  server: ?OtpServer,
  terminateEC2InstanceForDeployment: typeof deploymentActions.terminateEC2InstanceForDeployment
}

export default class CurrentDeploymentPanel extends Component<Props> {
  componentWillReceiveProps (nextProps: Props) {
    // If status message changes while deployment job is in progress, re-fetch
    // deployment to update EC2 instance status.
    const oldDeployJob = this._getDeployJob()
    const newDeployJob = this._getDeployJob(nextProps)
    if (newDeployJob && oldDeployJob) {
      if (newDeployJob.status.message !== oldDeployJob.status.message) {
        this._fetchDeploymentEC2Instances()
      }
    }
  }

  _getDeployJob = (props: Props = this.props) => props.deployJobs.find(job => job.type === 'DEPLOY_TO_OTP')

  _fetchDeploymentEC2Instances = () => this.props.fetchDeployment(this.props.deployment.id)

  _getServer = () => {
    if (this.props.server) return this.props.server
    const deployJob = this._getDeployJob()
    const serverId = deployJob && deployJob.serverId
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

  _onClickDownloadBundle = () => {
    this.props.downloadBuildArtifact(this.props.deployment, 'bundle.zip')
  }

  _onClickDownloadLogs = () => {
    this.props.downloadBuildArtifact(this.props.deployment)
  }

  _onClickDownloadGraph = () => {
    this.props.downloadBuildArtifact(this.props.deployment, 'Graph.obj')
  }

  _onClickDownloadUserData = (instance: EC2InstanceSummary) => {
    const {deployment, downloadBuildArtifact} = this.props
    const {instanceId, jobId} = instance
    downloadBuildArtifact(deployment, `${instanceId}.log`, jobId)
  }

  render () {
    const { deployJobs, deployment } = this.props
    const deployJob = this._getDeployJob()
    const server = this._getServer() || {}
    const ec2Info = server && server.ec2Info
    const deploymentType = ec2Info
      ? 'ELB'
      : server.internalUrl
        ? 'Build graph over wire'
        : server.s3Bucket
          ? 'S3 only'
          : 'unknown'
    return (
      <Panel header={<h3><Icon type='server' /> Current deployment</h3>}>
        {deployJob
          ? <div>
            Deployment to {this._getServerLabel()} in progress...<br />
            <small className='overflow' style={{maxWidth: '200px'}}>
              <Icon type='spinner' className='fa-pulse' />{' '}
              {deployJob.status.message}
            </small>
          </div>
          : deployment.deployedTo
            ? <div>
              <ul className='list-unstyled'>
                <li>
                  Deployed to: {this._getServerLabel()}
                </li>
                <li>Type: {deploymentType}</li>
                <li>Last deployed: {formatTimestamp(deployment.lastDeployed)}</li>
                {deployment.latest
                  ? <li>otp version: {deployment.latest.otpVersion}</li>
                  : null
                }
              </ul>
              <ButtonToolbar>
                <Button bsSize='xsmall' onClick={this._onClickDownloadGraph}><Icon type='ellipsis-h' /> Graph.obj</Button>
                <Button bsSize='xsmall' onClick={this._onClickDownloadLogs}><Icon type='file-text-o' /> Build log</Button>
                <Button bsSize='xsmall' onClick={this._onClickDownloadBundle}><Icon type='file-zip-o' /> Bundle</Button>
              </ButtonToolbar>
              <div style={{ margin: '20px 0' }}>
                <DeploymentPreviewButton block deployment={deployment} />
              </div>
            </div>
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
                  return (
                    <EC2InstanceCard
                      key={instance.instanceId}
                      onClickDownloadUserData={this._onClickDownloadUserData}
                      job={deployJobs.find(job => job.instanceId === instance.instanceId)}
                      instance={instance}
                      terminateEC2InstanceForDeployment={this.props.terminateEC2InstanceForDeployment} />
                  )
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
