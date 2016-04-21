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
  }

  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  componentWillReceiveProps (nextProps) {
  }

  save () {
    const zip = new JSZip()

    for(const table of DT_CONFIG.modules.gtfsplus.spec) {
      if(!(table.id in this.props.tableData) || this.props.tableData[table.id].length === 0) continue

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
    const editingIsDisabled = !this.props.user.permissions.hasFeedPermission(this.props.feedSource.projectId, this.props.feedSource.id, 'edit-gtfs')
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
                  disabled={editingIsDisabled}
                  className='pull-right'
                  onClick={() => {
                    console.log('save');
                    this.save()
                  }}
                ><Glyphicon glyph='save' /> Save & Revalidate</Button>
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
                    {this.props.validation && (table.id in this.props.validation)
                      ? <Glyphicon glyph='alert' style={{ color: 'red', marginRight: '8px' }}/>
                      : null
                    }
                    {table.id}
                  </Button>
                </p>)
              })}
            </Col>
            <Col xs={10}>
              <GtfsPlusTable
                ref="activeTable"
                feedSource={this.props.feedSource}
                table={activeTable}
                tableData={this.props.tableData[activeTable.id]}
                validation={this.props.validation[activeTable.id]}
                newRowClicked={this.props.newRowClicked}
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
                    ? DT_CONFIG.modules.gtfsplus.spec
                        .find(t => t.id === tableId).fields
                          .find(f => f.name === fieldName).helpContent
                    : DT_CONFIG.modules.gtfsplus.spec
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
            </Col>
          </Row>
        </Grid>
      </ManagerPage>
    )
  }
}
