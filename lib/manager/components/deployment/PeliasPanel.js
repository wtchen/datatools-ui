// @flow

import Icon from '@conveyal/woonerf/components/icon'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import { Button, Checkbox, FormControl, ListGroup, ListGroupItem, Panel } from 'react-bootstrap'

import SelectFileModal from '../../../common/components/SelectFileModal'
import { getHeaders } from '../../../common/util/util'
import * as deploymentActions from '../../actions/deployments'
import {SECURE_API_PREFIX} from '../../../common/constants'
import type {
  Deployment
} from '../../../types'

type Props = {
  deployment: Deployment,
  updateDeployment: typeof deploymentActions.updateDeployment,
}

type State = {
  peliasPassword: string,
  peliasUsername: string,
  peliasWebhookUrl: string
}

class PeliasPanel extends Component<Props, State> {
  state = {
    peliasWebhookUrl: '',
    peliasPassword: '',
    peliasUsername: ''
  };

  componentDidMount = () => {
    const { deployment } = this.props
    // Auto-populate blank field if project has webhook URL in it
    this.setState({
      peliasWebhookUrl: deployment.peliasWebhookUrl || '',
      peliasPassword: deployment.peliasPassword || '',
      peliasUsername: deployment.peliasUsername || ''
    })
  };

  _onChangeUpdatePelias = () =>
    this._updateDeployment({
      peliasUpdate: !this.props.deployment.peliasUpdate
    });

  _onBlurTextInput = (event: SyntheticInputEvent<HTMLInputElement>) => {
    const { target } = event
    const { value, id } = target
    this._updateDeployment({ [id]: value })
  };
  _onChangeTextInput = (event: SyntheticInputEvent<HTMLInputElement>) => {
    const { target } = event
    const { value, id } = target
    this.setState({ [id]: value })
  };

  _onConfirmUpload = async (files: Array<File>) => {
    const { user, deployment } = this.props
    const file = files[0]
    if (file.type === 'text/csv') {
      const url = `${SECURE_API_PREFIX}deployments/${deployment.id}/upload`
      const formData = new FormData()
      formData.append('file', file)

      const s3UploadResponse = await fetch(url, {
        method: 'post',
        headers: getHeaders(user.token, false, null),
        body: formData
      })
      const s3UploadUrl = await s3UploadResponse.text()
      this._updateDeployment({ 'peliasCsvFiles': [ ...deployment.peliasCsvFiles, s3UploadUrl ] })
      return true
    } else {
      return false
    }
  }

  _deleteCsvFile = async (url: string) => {
    const { deployment } = this.props
    const updatedCsvFiles = deployment.peliasCsvFiles.filter(u => u !== url)
    this._updateDeployment({'peliasCsvFiles': updatedCsvFiles})
  }

  _updateDeployment = (props: { [string]: any }) => {
    const { deployment, updateDeployment } = this.props
    updateDeployment(deployment, props)
  };

  renderCsvUrl = (url: string, enabled: boolean) => {
    // Usually, files will be rendered by https://github.com/ibi-group/datatools-server/blob/dev/src/main/java/com/conveyal/datatools/manager/controllers/api/DeploymentController.java
    // so we can take advantage of a predictable filename
    // As a fallback, render the full url
    const fileName = url.split('_').length === 2 ? url.split('_')[1] : url
    return (
      <li key={url}>
        {fileName}{' '}
        <Button disabled={!enabled} bsSize='xsmall' onClick={() => { this.refs.uploadModal.open(); this._deleteCsvFile(url) }}>
          Replace
        </Button>
        <Button disabled={!enabled} bsSize='xsmall' onClick={() => this._deleteCsvFile(url)}>Delete</Button>
      </li>
    )
  }

  render () {
    const { deployment } = this.props
    const { peliasWebhookUrl, peliasPassword, peliasUsername } = this.state

    const optionsEnabled = peliasWebhookUrl !== ''

    return (
      <Panel
        header={
          <h3>
            <Icon type='map-marker' /> Custom Geocoder Settings
          </h3>
        }
      >
        <ListGroup fill>
          <ListGroupItem>
            <h5>Custom Geocoder Webhook URL</h5>
            <FormControl
              type='url'
              id='peliasWebhookUrl'
              placeholder='Update webhook URL'
              value={peliasWebhookUrl}
              onChange={this._onChangeTextInput}
              onBlur={this._onBlurTextInput}
            />
            <h5>Username</h5>
            <FormControl
              type='text'
              id='peliasUsername'
              disabled={!optionsEnabled}
              autoComplete='off'
              placeholder='Webhook Username'
              value={peliasUsername}
              onChange={this._onChangeTextInput}
              onBlur={this._onBlurTextInput}
            />
            <h5>Password</h5>
            <FormControl
              type='password'
              id='peliasPassword'
              disabled={!optionsEnabled}
              autoComplete='off'
              placeholder='Webhook Password'
              value={peliasPassword}
              onChange={this._onChangeTextInput}
              onBlur={this._onBlurTextInput}
            />
          </ListGroupItem>
          <ListGroupItem>
            <h5>Send GTFS feeds to custom geocoder</h5>
            <Checkbox
              disabled={!optionsEnabled}
              checked={deployment.peliasUpdate}
              onChange={this._onChangeUpdatePelias}
            >
              Update Custom Geocoder
            </Checkbox>
          </ListGroupItem>
          <ListGroupItem>
            <h5>Custom POI CSV Files</h5>
            <SelectFileModal
              ref='uploadModal'
              title='Upload CSV File'
              body='Select a CSV file of POIs to upload:'
              onConfirm={this._onConfirmUpload}
              errorMessage='Uploaded file must be a valid csv file (.csv).'
            />
            <ul>{deployment.peliasCsvFiles.map(url => this.renderCsvUrl(url, optionsEnabled))}</ul>
            <Button
              style={{ marginTop: '5px' }}
              disabled={!optionsEnabled}
              onClick={() => this.refs.uploadModal.open()}
            >
              Upload New CSV File
            </Button>
          </ListGroupItem>
        </ListGroup>
      </Panel>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user
  }
}

const mapDispatchToProps = {
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PeliasPanel)
