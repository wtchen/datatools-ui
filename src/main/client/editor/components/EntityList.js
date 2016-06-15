import React, {Component, PropTypes} from 'react'
import { Table, ListGroup, ListGroupItem, Button, ButtonToolbar } from 'react-bootstrap'
import {Icon} from 'react-fa'
import { browserHistory, Link } from 'react-router'
import { LinkContainer } from 'react-router-bootstrap'

import EditableTextField from '../../common/components/EditableTextField'
import EntityDetails from './EntityDetails'
import GtfsTable from './GtfsTable'

export default class EntityList extends Component {

  constructor (props) {
    super(props)
  }

  componentWillReceiveProps (nextProps) {
    console.log('next entity list props', nextProps.activeComponent)
  }
  render () {
    const feedSource = this.props.feedSource
    const sidePadding = '5px'
    const rowHeight = '37px'
    let panelWidth = !this.props.tableView ? '200px' : '100%'
    let panelStyle = {
      width: panelWidth,
      height: '100%',
      position: 'absolute',
      left: '0px',
      // overflowY: 'scroll',
      zIndex: 99,
      backgroundColor: 'white',
      paddingRight: '0px',
      paddingLeft: sidePadding
    }
    const rowStyle = {
      cursor: 'pointer'
    }
    const activeColor = '#F2F2F2'
    let entId = this.props.activeComponent === 'agency'
      ? 'agency_id'
      : this.props.activeComponent === 'route'
      ? 'route_id'
      : this.props.activeComponent === 'stop'
      ? 'stop_id'// 'stop_id'
      : null
    let entName = this.props.activeComponent === 'agency'
      ? 'agency_name'
      : this.props.activeComponent === 'route'
      ? 'route_short_name'
      : this.props.activeComponent === 'stop'
      ? 'stop_name'
      : null
    const activeEntity = this.props.entities ? this.props.entities.find(entity => entity[entId] === this.props.entity) : null
    const getEntityName = (component, entity) => {
      switch (component) {
        case 'route':
          return entity.route_short_name && entity.route_long_name
          ? `${entity.route_short_name} - ${entity.route_long_name}`
          : entity.route_short_name
          ? entity.route_short_name
          : entity.route_long_name
          ? entity.route_long_name
          : entity.route_id
        default:
          return entity[entName]
      }
    }
    const entityList = (
      <div
        style={{height: '85%', overflowY: 'scroll',}}
      >
      <Table
        hover
      >
        <thead></thead>
        <tbody>
        {this.props.entities ? this.props.entities.map(entity => {
          const entityName = getEntityName(this.props.activeComponent, entity)
          const rowStyle = {
            paddingTop: 2,
            paddingBottom: 2,
            cursor: 'pointer',
          }
          const activeRowStyle = {
            backgroundColor: activeColor,
            paddingTop: 2,
            paddingBottom: 2,
            cursor: 'pointer',
          }
          return (
            <tr
              href='#'
              //key={entity[entId] ? `${this.props.activeComponent}-list-${entity[entId]}`}
              onMouseDown={(e) => console.log(e)}
              style={rowStyle}
              onClick={() => {
                if (activeEntity && entity[entId] === activeEntity[entId]) browserHistory.push(`/feed/${feedSource.id}/edit/${this.props.activeComponent}`)
                else browserHistory.push(`/feed/${feedSource.id}/edit/${this.props.activeComponent}/${entity[entId]}`)
              }}
            >
              <td
                /*className={activeEntity && entity[entId] === activeEntity[entId] ? 'success' : ''}*/
                style={activeEntity && entity[entId] === activeEntity[entId] ? activeRowStyle : rowStyle}
              >
              <small title={entityName}>{`${entityName.length > 25 ? entityName.substr(0, 25) + '...' : entityName}`}</small>
              </td>
            </tr>
          )
        })
        : <tr><td><Icon spin name='spinner' /></td></tr>
      }
        </tbody>
      </Table>
      </div>
    )

    const activeTable = DT_CONFIG.modules.editor.spec
      .find(t => t.id === this.props.activeComponent)
    const entityTable = (
      <GtfsTable
        ref="activeTable"
        feedSource={this.props.feedSource}
        table={activeTable}
        tableData={this.props.entities || []}
        newRowClicked={this.props.newRowClicked}
        saveRowClicked={this.props.saveRowClicked}
        deleteRowClicked={this.props.deleteRowClicked}
        fieldEdited={this.props.fieldEdited}
        gtfsEntitySelected={(type, entity) => {
          this.props.gtfsEntitySelected(type, entity)
        }}
        getGtfsEntity={(type, id) => {
          return this.props.entities.find(ent => ent[entId] === id)
          // return this.props.gtfsEntityLookup[`${type}_${id}`]
        }}
        showHelpClicked={(tableId, fieldName) => {
          const helpContent = fieldName
            ? DT_CONFIG.modules.editor.spec
                .find(t => t.id === tableId).fields
                  .find(f => f.name === fieldName).helpContent
            : DT_CONFIG.modules.editor.spec
                .find(t => t.id === tableId).helpContent
          this.refs.page.showInfoModal({
            title: `Help for ${tableId}.txt` + (fieldName ? `: ${fieldName}` : ''),
            body: helpContent || '(No help content found for this field)'
          })
        }}
        newRowsDisplayed={(rows) => {
          this.props.newRowsDisplayed(activeTable.id, rows, this.props.feedSource)
        }}
      />
    )
    let entityDetails = (
      <EntityDetails
          offset={panelWidth}
          entity={activeEntity}
          activeComponent={this.props.activeComponent}
          newRowClicked={this.props.newRowClicked}
          saveRowClicked={this.props.saveRowClicked}
          deleteRowClicked={this.props.deleteRowClicked}
          fieldEdited={this.props.fieldEdited}
          gtfsEntitySelected={(type, entity) => {
            this.props.gtfsEntitySelected(type, entity)
          }}
          getGtfsEntity={(type, id) => {
            return this.props.entities.find(ent => ent[entId] === id)
            // return this.props.gtfsEntityLookup[`${type}_${id}`]
          }}
          showHelpClicked={(tableId, fieldName) => {
            const helpContent = fieldName
              ? DT_CONFIG.modules.editor.spec
                  .find(t => t.id === tableId).fields
                    .find(f => f.name === fieldName).helpContent
              : DT_CONFIG.modules.editor.spec
                  .find(t => t.id === tableId).helpContent
            this.refs.page.showInfoModal({
              title: `Help for ${tableId}.txt` + (fieldName ? `: ${fieldName}` : ''),
              body: helpContent || '(No help content found for this field)'
            })
          }}
        />
    )
    return (
      <div
        style={panelStyle}
      >
        <div
            style={{paddingRight: sidePadding, marginBottom: '5px', height: '80'}}
        >
          <h3>
            <ButtonToolbar
              className='pull-right'
            >
              <Button
                bsSize='small'
                disabled={!activeEntity}
              >
                <Icon name='clone'/>
              </Button>
              <Button
                bsSize='small'
                disabled={!activeEntity}
                bsStyle='danger'
              >
                <Icon name='trash'/>
              </Button>
            </ButtonToolbar>
            <Button
              bsSize='small'
            >
              <Icon name='plus'/> New {this.props.activeComponent}
            </Button>
          </h3>
          <Button
            bsSize='xsmall'
            onClick={() => {!this.props.tableView
              ? browserHistory.push(`/feed/${feedSource.id}/edit/${this.props.activeComponent}?table=true`)
              : browserHistory.push(`/feed/${feedSource.id}/edit/${this.props.activeComponent}`)
            }}
          >
            {!this.props.tableView
              ? <span><Icon name='table'/> Switch to table view</span>
              : <span><Icon name='list'/> Switch to list view</span>
            }
          </Button>
        </div>
        {!this.props.tableView
          ? entityList
          : entityTable
        }

        {this.props.entity
          ? entityDetails
          : null
        }
      </div>
    )
  }
}
