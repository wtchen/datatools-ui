// @flow

import React, { Component } from 'react'
import { Button, Grid, Row, Col } from 'react-bootstrap'
import {Link} from 'react-router'
import {LinkContainer} from 'react-router-bootstrap'

import { DEFAULT_DESCRIPTION, DEFAULT_LOGO, DEFAULT_TITLE } from '../../common/constants'
import { getConfigProperty, isModuleEnabled } from '../../common/util/config'
import PublicPage from './PublicPage'

import type {Props as ContainerProps} from '../containers/ActivePublicLandingPage'
import type {ManagerUserState} from '../../types/reducers'

type Props = ContainerProps & {
  user: ManagerUserState
}

export default class PublicLandingPage extends Component<Props> {
  render () {
    const appTitle = getConfigProperty('application.title') || DEFAULT_TITLE
    const appDescription = getConfigProperty('application.description') || DEFAULT_DESCRIPTION
    const logoLarge = getConfigProperty('application.logo_large') || DEFAULT_LOGO
    return (
      <PublicPage ref='publicPage'>
        <Grid>
          <Row>
            <Col style={{textAlign: 'center'}} smOffset={4} xs={12} sm={4}>
              <img style={{maxWidth: '256px'}}
                src={logoLarge} />
              <h1>{appTitle}</h1>
            </Col>
          </Row>
          <Row>
            <Col style={{textAlign: 'center', marginTop: '15px'}} smOffset={4} xs={12} sm={4}>
              <p className='lead'>
                {this.props.user.profile
                  ? <LinkContainer to='/home'>
                    <Button bsSize='large'>
                      View dashboard
                    </Button>
                  </LinkContainer>
                  : <span>
                    {appDescription}
                  </span>
                }
              </p>
              {!isModuleEnabled('enterprise') && <p>
                Learn more about Conveyal Data Tools{' '}
                <a href='https://conveyal.com/transit-data-tools'>here</a>.
              </p>}
              <p>
                {!this.props.user.profile
                  ? <span>Existing users <Link to='/login'>sign in here</Link>.</span>
                  : null
                }
              </p>
            </Col>
          </Row>
        </Grid>
        <footer className='landing-footer'>
          <div className='container'>
            <p className='text-center text-muted'>
              <span role='img' title='Copyright' aria-label='copyright'>
                &copy;
              </span>{' '}
              <a href='http://conveyal.com'>Conveyal</a>
            </p>
          </div>
        </footer>
      </PublicPage>
    )
  }
}
