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

import AffectedEntity from './AffectedEntity'
import { isExtensionEnabled } from '../../common/util/config'
import GtfsSearch from '../../gtfs/components/gtfs-search'

import type {Alert, AlertEntity, Feed} from '../../types'

type Props = {
  activeFeeds: Array<Feed>,
  alert: Alert,
  entityUpdated: (AlertEntity, string, any) => void,
  newEntityId: number,
  onAddEntityClick: (string, any, ?Feed, number) => void,
  onDeleteEntityClick: any => void,
  sortedFeeds: Array<Feed>
}

export default class AffectedServices extends Component<Props> {
  _onAddMode = () => {
    const {newEntityId, onAddEntityClick, sortedFeeds} = this.props
    // default value is Tram
    onAddEntityClick(
      'MODE',
      {gtfsType: 0, name: 'Tram/LRT'},
      sortedFeeds[0],
      newEntityId
    )
  }

  _onAddAgency = () => {
    const {newEntityId, onAddEntityClick, sortedFeeds} = this.props
    // default value is first entry
    onAddEntityClick('AGENCY', sortedFeeds[0], null, newEntityId)
  }

  _onSelectEntity = (value: any) => {
    const {onAddEntityClick, newEntityId} = this.props
    if (typeof value !== 'undefined' && value !== null) {
      if (value.stop) {
        onAddEntityClick('STOP', value.stop, value.agency, newEntityId)
      } else if (value.route) {
        onAddEntityClick('ROUTE', value.route, value.agency, newEntityId)
      }
    }
  }

  render () {
    const {
      sortedFeeds,
      alert,
      activeFeeds,
      onDeleteEntityClick,
      entityUpdated
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
                entity={entity}
                key={entity.id}
                activeFeeds={activeFeeds}
                feeds={sortedFeeds}
                onDeleteEntityClick={onDeleteEntityClick}
                entityUpdated={entityUpdated} />
            ))}
        </ListGroup>
      </Panel>
    )
  }
}

class ServicesHeader extends Component<{entities: Array<any>}> {
  render () {
    const { entities } = this.props
    const counts = [
      {
        singular: 'agency',
        plural: 'agencies',
        count: entities.filter((e: AlertEntity) => e.type === 'AGENCY').length
      },
      {
        singular: 'route',
        plural: 'routes',
        count: entities.filter((e: AlertEntity) => e.type === 'ROUTE').length
      },
      {
        singular: 'stop',
        plural: 'stops',
        count: entities.filter((e: AlertEntity) => e.type === 'STOP').length
      },
      {
        singular: 'mode',
        plural: 'modes',
        count: entities.filter((e: AlertEntity) => e.type === 'MODE').length
      }
    ]
    const summary = counts
      .map(c => {
        return c.count
          ? <span key={c.singular}> <Label
            bsStyle={c.singular === 'agency' || c.singular === 'mode'
              ? 'warning'
              : 'default'
            }>
            {`${c.count} ${c.count > 1 ? c.plural : c.singular}`}
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
