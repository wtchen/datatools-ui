import React, {Component, PropTypes} from 'react'
import { Grid, Row, Col, Button, Glyphicon, PageHeader } from 'react-bootstrap'
import JSZip from 'jszip'
import { Link } from 'react-router'

import ManagerPage from '../../common/components/ManagerPage'
import GtfsPlusTable from './GtfsPlusTable'

export default class GtfsPlusEditor extends Component {

  constructor (props) {
    super(props)

    this.state = {
      activeTableId: 'realtime_routes'
    }

    this.gtfsEntityLookup = {
      stop: {},
      route: {}
    }
  }

  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  componentWillReceiveProps (nextProps) {
    if(!nextProps.feedSource) return;

    // lookup table for mapping tableId:fieldName keys to inputType values
    const typeLookup = {}
    const getDataType = function(tableId, fieldName) {
      const lookupKey = tableId + ':' + fieldName
      if(lookupKey in typeLookup) return typeLookup[lookupKey]
      const fieldInfo = DT_CONFIG.modules.gtfsplus.spec
        .find(t => t.id === tableId).fields.find(f => f.name === fieldName)
      if(!fieldInfo) return null
      typeLookup[lookupKey] = fieldInfo.inputType
      return fieldInfo.inputType
    }

    // determine which routes, stops, etc. aren't currently in the gtfsEntityLookup table and need to be loaded from the API
    const routesToLoad = []
    const stopsToLoad = []

    for(const tableId in nextProps.tableData) {
      for(const rowData of nextProps.tableData[tableId]) {
        for(const fieldName in rowData) {
          switch(getDataType(tableId, fieldName)) {
            case 'GTFS_ROUTE':
              const routeId = rowData[fieldName]
              if(routeId && !(routeId in this.gtfsEntityLookup['route'])) routesToLoad.push(routeId)
              break;
            case 'GTFS_STOP':
              const stopId = rowData[fieldName]
              if(stopId && !(stopId in this.gtfsEntityLookup['stop'])) stopsToLoad.push(stopId)
              break;
          }
        }
      }
    }

    if(routesToLoad.length === 0 && stopsToLoad.length === 0) return

    var loadRoutes = Promise.all(routesToLoad.map(routeId => {
      const url = `/api/manager/routes/${routeId}?feed=${nextProps.feedSource.externalProperties.MTC.AgencyId}`
      return fetch(url)
      .then((response) => {
        return response.json()
      })
    }))

    var loadStops = Promise.all(stopsToLoad.map(stopId => {
      const url = `/api/manager/stops/${stopId}?feed=${nextProps.feedSource.externalProperties.MTC.AgencyId}`
      return fetch(url)
      .then((response) => {
        return response.json()
      })
    }))

    Promise.all([loadRoutes, loadStops]).then(results => {
      const loadedRoutes = results[0]
      const loadedStops = results[1]
      for(const route of loadedRoutes) {
        this.gtfsEntityLookup['route'][route.route_id] = route
      }

      for(const stop of loadedStops) {
        this.gtfsEntityLookup['stop'][stop.stop_id] = stop
      }

      this.forceUpdate()
    })
  }

  getGtfsEntity (type, id) {
    return this.gtfsEntityLookup[type][id]
  }

  save () {
    const zip = new JSZip()

    for(const table of DT_CONFIG.modules.gtfsplus.spec) {
      let fileContent = ''
      // white the header line
      const fieldNameArr = table.fields.map(field => field['name'])
      fileContent += fieldNameArr.join(',') + '\n'

      // write the data rows
      var dataRows = this.props.tableData[table.id].map(rowData => {
        const rowText = fieldNameArr.map(fieldName => {
          return rowData[fieldName] || ''
        }).join(',')
        fileContent += rowText + '\n'
      })

      // add to the zip archive
      zip.file(table.name, fileContent)
    }

    zip.generateAsync({type:"blob"}).then((content) => {
      this.props.feedSaved(content)
    })
  }

  render () {
    if(!this.props.feedSource) return null

    const buttonStyle = {
      display: 'block',
      width: '100%'
    }

    const activeTable = DT_CONFIG.modules.gtfsplus.spec
      .find(t => t.id === this.state.activeTableId)

    return (
      <ManagerPage ref='page'>
        <Grid>
          <Row>
            <Col xs={12}>
              <ul className='breadcrumb'>
                <li><Link to='/'>Explore</Link></li>
                <li><Link to='/project'>Projects</Link></li>
                <li><Link to={`/project/${this.props.project.id}`}>{this.props.project.name}</Link></li>
                <li><Link to={`/feed/${this.props.feedSource.id}`}>{this.props.feedSource.name}</Link></li>
                <li className='active'>Edit GTFS+</li>
              </ul>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <PageHeader>Editing GTFS+ for {this.props.feedSource.name}
                <Button
                  bsStyle='primary'
                  bsSize='large'
                  className='pull-right'
                  onClick={() => {
                    console.log('publish');
                  }}
                >Publish</Button>
                &nbsp;
                <Button
                  bsStyle='primary'
                  bsSize='large'
                  className='pull-right'
                  onClick={() => {
                    console.log('save');
                    this.save()
                  }}
                >Save</Button>
              </PageHeader>
            </Col>
          </Row>

          <Row>
            <Col xs={2}>
              {DT_CONFIG.modules.gtfsplus.spec.map(table => {
                return (<p>
                  <Button
                    bsStyle={table.id === this.state.activeTableId ? 'info' : 'default'}
                    key={table.id}
                    style={buttonStyle}
                    onClick={() => {
                      this.setState({ activeTableId: table.id })
                    }}
                  >
                    {table.name}
                  </Button>
                </p>)
              })}
            </Col>
            <Col xs={10}>
              <GtfsPlusTable
                feedSource={this.props.feedSource}
                table={activeTable}
                tableData={this.props.tableData[activeTable.id]}
                newRowClicked={this.props.newRowClicked}
                deleteRowClicked={this.props.deleteRowClicked}
                fieldEdited={this.props.fieldEdited}
                gtfsEntitySelected={(type, entity) => {
                  this.gtfsEntityLookup[type][entity[type+'_id']] = entity
                }}
                getGtfsEntity={(type, id) => this.getGtfsEntity(type, id)}
                showHelpClicked={(tableId, fieldName) => {
                  console.log();
                  this.refs.page.showInfoModal({
                    title: `Help for ${tableId}.txt: ${fieldName}`,
                    body: DT_CONFIG.modules.gtfsplus.spec
                      .find(t => t.id === tableId).fields
                        .find(f => f.name === fieldName).helpContent
                          || '(No help content found for this field)'
                  })
                }}
              />
            </Col>
          </Row>
        </Grid>
      </ManagerPage>
    )
  }
}
