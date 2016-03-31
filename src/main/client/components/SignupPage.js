import React from 'react'

import moment from 'moment'

import { Grid, Row, Col, Button, Table, Input, Panel, Glyphicon, Badge, ButtonInput, form } from 'react-bootstrap'

import EditableTextField from './EditableTextField'

import { Link } from 'react-router'

import { LinkContainer } from 'react-router-bootstrap'

import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table'

import PublicPage from '../components/PublicPage'

import { secureFetch } from '../util/util'

export default class SignupPage extends React.Component {

  constructor (props) {
    super(props)
  }

  render () {
    const email = <Input
      type='email'
      placeholder='user@example.com'
      label='Email'
      onChange={(evt) => {
        const email = evt.target.value
        this.setState({email: email})
      }}
    />
    const username = <Input
      type='text'
      placeholder='user123'
      label='Username'
      onChange={(evt) => {
        const username = evt.target.value
        this.setState({username: username})
      }}
    />
    const password = <Input
      type='password'
      placeholder='password'
      label='Password'
      onChange={(evt) => {
        const password = evt.target.value
        this.setState({password: password})
      }}
    />
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
