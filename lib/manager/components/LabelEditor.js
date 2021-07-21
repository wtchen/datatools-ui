// @flow

import React from 'react'
import {
  Button,
  Col,
  ControlLabel,
  FormControl,
  FormGroup,
  HelpBlock,
  ListGroup,
  ListGroupItem,
  Panel,
  Row
} from 'react-bootstrap'
import update from 'react-addons-update'

import {validationState} from '../util'
import type {ManagerUserState} from '../../types/reducers'

// TODO: props
export default class LabelEditor extends React.Component {
    state = {
      validation: {
        name: true,
        description: true
      },
      newLabel: {...this.props.label}
    }

    componentDidMount = () => {
      // If we didn't get a label passed in, declare the label to be new
      if (Object.keys(this.props.label).length === 0) {
        this.setState({
          labelIsNew: true,
          // Default to a nice orange
          newLabel: {
            color: '#FF9200'
          }
        })
      }
    }

    userIsAdmin = (user: ManagerUserState) => {
      const {permissions} = user
      if (!permissions) return false
      else return permissions.isApplicationAdmin() || permissions.canAdministerAnOrganization()
    }

  _onFormChange = ({target}: {target: HTMLInputElement}, alwaysValid: Boolean) => {
    const {name, value, type, checked} = target

    const universalValue = type === 'checkbox' ? checked : value
    const valid = alwaysValid || universalValue.length > 0

    this.setState(
      update(this.state, {
        newLabel: { $merge: {[name]: universalValue} },
        validation: { [name]: { $set: universalValue && valid } }
      })
    )
  }

  _getChanges = () => {
    const newLabel = this.state.newLabel
    const oldLabel = this.props.label

    const changes: any = {}
    Object.keys(newLabel).map(k => {
      if (newLabel[k] !== oldLabel[k]) {
        changes[k] = newLabel[k]
      }
    })
    return changes
  }
  _settingsAreUnedited = () => Object.keys(this._getChanges()).length === 0

  _formIsValid = () => {
    const {validation} = this.state
    return Object.keys(validation).every(k => validation[k])
  }

  _onSaveSettings = () => {
    const {labelIsNew, newLabel: label} = this.state
    const {createLabel, updateLabel} = this.props

    if (labelIsNew) {
      // Insert project ID
      label.projectId = this.props.projectId
      createLabel(label)
    } else {
      updateLabel(label)
    }

    // This passed method will close the editor
    this.props.onDone()
  }

  render () {
    const {newLabel, validation} = this.state
    const {user} = this.props

    return <div>
      <Panel>

        <ListGroup fill>
          <ListGroupItem>
            <FormGroup
              data-test-id='label-name'
              validationState={validationState(validation.name)}
            >

              <ControlLabel>Name</ControlLabel>
              <FormControl
                value={newLabel.name}
                name={'name'}
                onChange={this._onFormChange}
              />
              <FormControl.Feedback />
              <HelpBlock>Required.</HelpBlock>
            </FormGroup>
            <FormGroup
              data-test-id='label-description'
            >
              <ControlLabel>Description</ControlLabel>
              <FormControl
                value={newLabel.description}
                name={'description'}
                onChange={e => this._onFormChange(e, true)}
              />
              <FormControl.Feedback />
            </FormGroup>
          </ListGroupItem>
          <ListGroupItem>
            <Row>
              <Col xs={3}>
                <FormGroup
                  data-test-id='label-color'
                >
                  <ControlLabel>Color</ControlLabel>
                  <FormControl
                    value={newLabel.color}
                    name={'color'}
                    type='color'
                    onChange={this._onFormChange}
                  />
                  <FormControl.Feedback />
                </FormGroup>
              </Col>
              <Col xs={9}>
                {this.userIsAdmin(user)
                  ? <FormGroup
                    data-test-id='label-adminOnly'
                  >
                    <ControlLabel>Visible to admins only?</ControlLabel>
                    <Row>
                      <Col xs={3}>
                        <FormControl
                          checked={newLabel.adminOnly}
                          name={'adminOnly'}
                          type='checkbox'
                          onChange={e => this._onFormChange(e, true)}
                        />
                      </Col>
                      <Col xs={9}>
                        <div>If checked, this label will only be visible to project and application admins. Users with feed-specific priveleges will not see this label applied to any feed sources.</div>
                      </Col>
                    </Row>
                  </FormGroup>
                  : ''}
              </Col>
            </Row>
          </ListGroupItem>
        </ListGroup>
      </Panel>
      <Row>
        <Col xs={12}>
          {/* Cancel button */}
          <Button
            onClick={this.props.onDone}
            style={{marginRight: 10}}
          >
            Cancel
          </Button>
          {/* Save button */}
          <Button
            bsStyle='primary'
            data-test-id='label-form-save-button'
            disabled={
              this._settingsAreUnedited() ||
                !this._formIsValid()
            }
            onClick={this._onSaveSettings}>
            Save
          </Button>
        </Col>
      </Row>
    </div>
  }
}
