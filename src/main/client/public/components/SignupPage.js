import React from 'react'
import moment from 'moment'
import { Grid, Row, Col, Button, Table, FormControl, FormGroup, ControlLabel, Panel, Glyphicon, Badge, ButtonInput, form } from 'react-bootstrap'
import { Link } from 'react-router'
import { LinkContainer } from 'react-router-bootstrap'
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table'

import EditableTextField from '../../common/components/EditableTextField'
import PublicPage from './PublicPage'

export default class SignupPage extends React.Component {

  constructor (props) {
    super(props)
  }

  render () {
    const email =
    <FormGroup controlId='formControlsEmail'>
      <ControlLabel>Email</ControlLabel>
      <FormControl
        type='email'
        placeholder='user@example.com'
        onChange={(evt) => {
          const email = evt.target.value
          this.setState({email})
        }}
      />
    </FormGroup>
    const username =
    <FormGroup controlId='formControlsUsername'>
      <ControlLabel>Username</ControlLabel>
      <FormControl
        type='text'
        placeholder='user123'
        onChange={(evt) => {
          const name = evt.target.value
          this.setState({name})
        }}
      />
    </FormGroup>
    const password =
    <FormGroup controlId='formControlsPassword'>
      <ControlLabel>Password</ControlLabel>
      <FormControl
        type='password'
        placeholder='password'
        onChange={(evt) => {
          const password = evt.target.value
          this.setState({password})
        }}
      />
    </FormGroup>
    return (
      <PublicPage ref='publicPage'>
        <Grid>
          <Row>
            <Col xs={12}>
              <h2>
                Create an account
              </h2>
            </Col>
          </Row>

          <Row>
            <Col xs={4}>
              <form>
                <p>Already have an account? <Button href='#' bsStyle='link' onClick={this.props.loginHandler}>Sign in</Button></p>
                {/* username */}
                {email}
                {password}
                <Button
                  href='#'
                  bsStyle='primary'
                  onClick={(evt) => {
                    evt.preventDefault()
                    console.log(this.state)
                    this.props.signupHandler(this.state)
                  }}
                >
                  Sign up!
                </Button>
              </form>
            </Col>
          </Row>
        </Grid>
      </PublicPage>
    )
  }
}
