import React, {Component, PropTypes} from 'react'
import { Table, ListGroup, ListGroupItem, Button, ButtonToolbar } from 'react-bootstrap'
import {Icon} from 'react-fa'
import { browserHistory, Link } from 'react-router'
import { LinkContainer } from 'react-router-bootstrap'

import EditableTextField from '../../common/components/EditableTextField'
import AgencyDetails from './AgencyDetails'
import GtfsTable from './GtfsTable'

export default class AgencyEditor extends Component {

  constructor (props) {
    super(props)
  }

  render () {
    // const routes = ['test', 'Route 123', 'Route 456', 'Route 1', 'Route 10']
    console.log('table view', this.props.tableView)
    const feedSource = this.props.feedSource
    const sidePadding = '5px'
    const rowHeight = '37px'
    let panelWidth = !this.props.tableView ? '300px' : '100%'
    let panelStyle = {
      width: panelWidth,
      height: '100%',
      position: 'absolute',
      left: '0px',
      zIndex: 99,
      backgroundColor: 'white',
      paddingRight: '0px',
      paddingLeft: sidePadding
    }
    const rowStyle = {
      cursor: 'pointer'
    }
    const activeColor = '#F2F2F2'
    const activeAgency = this.props.agencies ? this.props.agencies.find(agency => agency.agency_id === this.props.entity) : null
    const agencyList = (
      <Table hover>
        <thead></thead>
        <tbody>
        {this.props.agencies ? this.props.agencies.map(agency => {
          return (
            <tr
              href='#'
              key={agency.agency_id}
              onMouseDown={(e) => console.log(e)}
              style={rowStyle}
              onClick={() => {
                if (this.props.entity === agency.agency_id) browserHistory.push(`/feed/${feedSource.id}/edit/agency`)
                else browserHistory.push(`/feed/${feedSource.id}/edit/agency/${agency.agency_id}`)
              }}
            >
              <td
                /*className={activeAgency && agency.agency_id === activeAgency.agency_id ? 'success' : ''}*/
                style={activeAgency && agency.agency_id === activeAgency.agency_id ? {backgroundColor: activeColor} : {}}
              >
              {agency.agency_name}
              </td>
              {activeAgency && agency.agency_id === activeAgency.agency_id
                ? <div style={{position: 'absolute', width: sidePadding, height: rowHeight, backgroundColor: activeColor}}></div>
                : null
              }
            </tr>
          )
        })
        : null
      }
        </tbody>
      </Table>
    )

    const activeTable = DT_CONFIG.modules.editor.spec
      .find(t => t.id === 'agency')
    const agencyTable = (
      <GtfsTable
        ref="activeTable"
        feedSource={this.props.feedSource}
        table={activeTable}
        tableData={this.props.agencies || []}
        newRowClicked={this.props.newRowClicked}
        saveRowClicked={this.props.saveRowClicked}
        deleteRowClicked={this.props.deleteRowClicked}
        fieldEdited={this.props.fieldEdited}
        gtfsEntitySelected={(type, entity) => {
          this.props.gtfsEntitySelected(type, entity)
        }}
        getGtfsEntity={(type, id) => {
          return this.props.gtfsEntityLookup[`${type}_${id}`]
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
    return (
      <div
        style={panelStyle}
      >
        <div
          style={{paddingRight: sidePadding, marginBottom: '5px'}}
        >
          <h3>
            <ButtonToolbar
              className='pull-right'
            >
              <Button
                bsSize='small'
                disabled={!activeAgency}
                bsStyle='success'
              >
                <Icon name='plus'/>
              </Button>
              <Button
                bsSize='small'
                disabled={!activeAgency}
              >
                <Icon name='clone'/>
              </Button>
              <Button
                bsSize='small'
                disabled={!activeAgency}
                bsStyle='danger'
              >
                <Icon name='trash'/>
              </Button>
            </ButtonToolbar>
            Agency editor
          </h3>
          <Button
            bsSize='xsmall'
            onClick={() => {!this.props.tableView
              ? browserHistory.push(`/feed/${feedSource.id}/edit/agency?table=true`)
              : browserHistory.push(`/feed/${feedSource.id}/edit/agency`)
            }}
          >
            {!this.props.tableView
              ? <span><Icon name='table'/> Switch to table view</span>
              : <span><Icon name='list'/> Switch to list view</span>
            }
          </Button>
        </div>
        {!this.props.tableView
          ? agencyList
          : agencyTable
        }
        {this.props.entity
          ? <AgencyDetails offset={panelWidth} agency={activeAgency} />
          : null
        }
      </div>
    )
  }
}
