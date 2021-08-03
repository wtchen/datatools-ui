// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, { Component } from 'react'
import { Button, Checkbox, FormControl, ListGroup, ListGroupItem, Panel } from 'react-bootstrap'

import SelectFileModal from '../../../common/components/SelectFileModal'
import * as deploymentActions from '../../actions/deployments'
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

export default class PeliasPanel extends Component<Props, State> {
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

  _onConfirmUpload = (files: Array<File>) => {
    const file = files[0]
    if (file.type === 'text/csv') {
      // TODO: method to use file to upload feed
      return true
    } else {
      return false
    }
  }

  _updateDeployment = (props: { [string]: any }) => {
    const { deployment, updateDeployment } = this.props
    updateDeployment(deployment, props)
  };

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
            <h5>Custom POI CSV Upload</h5>
            <SelectFileModal
              ref='uploadModal'
              title='Upload CSV File'
              body='Select a CSV file of POIs to upload:'
              onConfirm={this._onConfirmUpload}
              errorMessage='Uploaded file must be a valid csv file (.csv).'
            />
            <Button disabled={!optionsEnabled} onClick={() => this.refs.uploadModal.open()}>Upload</Button>
          </ListGroupItem>
        </ListGroup>
      </Panel>
    )
  }
}
