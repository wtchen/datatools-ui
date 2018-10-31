// @flow

import React, {Component} from 'react'
import {
  Panel,
  Label,
  ListGroup,
  ListGroupItem,
  Row,
  Col,
  Button
} from 'react-bootstrap'

import {
  addActiveEntity as addActiveEntityAction,
  deleteActiveEntity as deleteActiveEntityAction,
  updateActiveEntity as updateActiveEntityAction
} from '../actions/activeAlert'
import AffectedEntity from './AffectedEntity'
import { isExtensionEnabled } from '../../common/util/config'
import GtfsSearch from '../../gtfs/components/gtfs-search'

import type {Alert, AlertEntity, Feed} from '../../types'

type Props = {
  activeFeeds: Array<Feed>,
  addActiveEntity: typeof addActiveEntityAction,
  alert: Alert,
  deleteActiveEntity: typeof deleteActiveEntityAction,
  newEntityId: number,
  sortedFeeds: Array<Feed>,
  updateActiveEntity: typeof updateActiveEntityAction
}

export default class AffectedServices extends Component<Props> {
  _onAddMode = () => {
    const {newEntityId, addActiveEntity, sortedFeeds} = this.props
    // default value is Tram
    addActiveEntity(
      'MODE',
      {gtfsType: 0, name: 'Tram/LRT'},
      sortedFeeds[0],
      newEntityId
    )
  }

  _onAddAgency = () => {
    const {newEntityId, addActiveEntity, sortedFeeds} = this.props
    // default value is first entry
    addActiveEntity('AGENCY', sortedFeeds[0], null, newEntityId)
  }

  _onSelectEntity = (value: any) => {
    const {addActiveEntity, newEntityId} = this.props
    if (typeof value !== 'undefined' && value !== null) {
      if (value.stop) {
        addActiveEntity('STOP', value.stop, value.agency, newEntityId)
      } else if (value.route) {
        addActiveEntity('ROUTE', value.route, value.agency, newEntityId)
      }
    }
  }

  render () {
    const {
      activeFeeds,
      alert,
      deleteActiveEntity,
      sortedFeeds,
      updateActiveEntity
    } = this.props
    return (
      <Panel
        header={<ServicesHeader entities={alert.affectedEntities} />}>
        <ListGroup fill>
          <ListGroupItem>
            <Row>
              <Col xs={5}>
                <Button
                  style={{marginRight: '5px'}}
                  onClick={this._onAddAgency}>
                  Add Agency
                </Button>
                {!isExtensionEnabled('mtc') &&
                  <Button
                    onClick={this._onAddMode}>
                    Add Mode
                  </Button>
                }
              </Col>
              <Col xs={7}>
                <GtfsSearch
                  feeds={activeFeeds}
                  placeholder='Add stop/route'
                  limit={100}
                  entities={['stops', 'routes']}
                  clearable
                  onChange={this._onSelectEntity} />
              </Col>
            </Row>
          </ListGroupItem>
          {alert.affectedEntities
            .sort((a, b) => b.id - a.id) // reverse sort by entity id
            .map((entity) => (
              <AffectedEntity
                activeFeeds={activeFeeds}
                deleteActiveEntity={deleteActiveEntity}
                entity={entity}
                feeds={sortedFeeds}
                key={entity.id}
                updateActiveEntity={updateActiveEntity}
              />
            ))}
        </ListGroup>
      </Panel>
    )
  }
}

const entityTypes = [
  {
    singular: 'agency',
    plural: 'agencies'
  },
  {
    singular: 'route',
    plural: 'routes'
  },
  {
    singular: 'stop',
    plural: 'stops'
  },
  {
    singular: 'mode',
    plural: 'modes'
  }
]

class ServicesHeader extends Component<{entities: Array<AlertEntity>}> {
  render () {
    const {entities} = this.props
    const summary = entityTypes
      .map(t => {
        const count = entities.filter(e => e.type === t.singular.toUpperCase()).length
        return count
          ? <span key={t.singular}> <Label
            bsStyle={t.singular === 'agency' || t.singular === 'mode'
              ? 'warning'
              : 'default'
            }>
            {`${count} ${count > 1 ? t.plural : t.singular}`}
          </Label> </span>
          : null
      })
      .filter(c => c !== null)
    return (
      <span>
        <b>Alert applies to:</b>{' '}
        {summary.length ? summary : <span>[make selection below]</span>}
      </span>
    )
  }
}
