import React, {Component, PropTypes} from 'react'
import { Grid, Row, Col, Button, Glyphicon, PageHeader } from 'react-bootstrap'
import JSZip from 'jszip'
import { Link } from 'react-router'

import ManagerPage from '../../common/components/ManagerPage'
import GtfsPlusTable from './GtfsPlusTable'
import { getConfigProperty } from '../../common/util/config'

export default class GtfsPlusEditor extends Component {
  static propTypes = {
    onComponentMount: PropTypes.func
  }
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

    for (const table of getConfigProperty('modules.gtfsplus.spec')) {
      if (!(table.id in this.props.tableData) || this.props.tableData[table.id].length === 0) continue

      let fileContent = ''
      // white the header line
      const fieldNameArr = table.fields.map(field => field['name'])
      fileContent += fieldNameArr.join(',') + '\n'

      // write the data rows
      this.props.tableData[table.id].map(rowData => {
        const rowText = fieldNameArr.map(fieldName => {
          return rowData[fieldName] || ''
        }).join(',')
        fileContent += rowText + '\n'
      })

      // add to the zip archive
      zip.file(table.name, fileContent)
    }

    zip.generateAsync({type: 'blob'}).then((content) => {
      this.props.feedSaved(content)
    })
  }

  render () {
    const {
      feedSource,
      user,
      project,
      validation,
      tableData,
      newRowClicked,
      deleteRowClicked,
      fieldEdited,
      gtfsEntitySelected,
      gtfsEntityLookup,
      newRowsDisplayed
    } = this.props
    if (!feedSource) return null
    const editingIsDisabled = !user.permissions.hasFeedPermission(feedSource.organizationId, feedSource.projectId, feedSource.id, 'edit-gtfs')
    const buttonStyle = {
      display: 'block',
      width: '100%'
    }

    const activeTable = getConfigProperty('modules.gtfsplus.spec')
      .find(t => t.id === this.state.activeTableId)

    return (
      <ManagerPage ref='page'>
        <Grid>
          <Row>
            <Col xs={12}>
              <ul className='breadcrumb'>
                <li><Link to='/'>Explore</Link></li>
                <li><Link to='/project'>Projects</Link></li>
                <li><Link to={`/project/${project.id}`}>{project.name}</Link></li>
                <li><Link to={`/feed/${feedSource.id}`}>{feedSource.name}</Link></li>
                <li className='active'>Edit GTFS+</li>
              </ul>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <PageHeader>Editing GTFS+ for {feedSource.name}
                <Button
                  bsStyle='primary'
                  bsSize='large'
                  disabled={editingIsDisabled}
                  className='pull-right'
                  onClick={() => {
                    console.log('save')
                    this.save()
                  }}
                ><Glyphicon glyph='save' /> Save & Revalidate</Button>
              </PageHeader>
            </Col>
          </Row>

          <Row>
            <Col xs={2}>
              {getConfigProperty('modules.gtfsplus.spec').map((table, index) => {
                return (<p key={index}>
                  <Button
                    bsStyle={table.id === this.state.activeTableId ? 'info' : 'default'}
                    key={table.id}
                    style={buttonStyle}
                    onClick={() => {
                      this.setState({ activeTableId: table.id })
                    }}
                  >
                    {validation && (table.id in validation)
                      ? <Glyphicon glyph='alert' style={{ color: 'red', marginRight: '8px' }} />
                      : null
                    }
                    {table.id}
                  </Button>
                </p>)
              })}
            </Col>
            <Col xs={10}>
              <GtfsPlusTable
                ref='activeTable'
                feedSource={feedSource}
                table={activeTable}
                tableData={tableData[activeTable.id]}
                validation={validation[activeTable.id]}
                newRowClicked={newRowClicked}
                deleteRowClicked={deleteRowClicked}
                fieldEdited={fieldEdited}
                gtfsEntitySelected={(type, entity) => {
                  gtfsEntitySelected(type, entity)
                }}
                getGtfsEntity={(type, id) => {
                  return gtfsEntityLookup[`${type}_${id}`]
                }}
                showHelpClicked={(tableId, fieldName) => {
                  const helpContent = fieldName
                    ? getConfigProperty('modules.gtfsplus.spec')
                        .find(t => t.id === tableId).fields
                          .find(f => f.name === fieldName).helpContent
                    : getConfigProperty('modules.gtfsplus.spec')
                        .find(t => t.id === tableId).helpContent
                  this.refs.page.showInfoModal({
                    title: `Help for ${tableId}.txt` + (fieldName ? `: ${fieldName}` : ''),
                    body: helpContent || '(No help content found for this field)'
                  })
                }}
                newRowsDisplayed={(rows) => {
                  newRowsDisplayed(activeTable.id, rows, feedSource)
                }}
              />
            </Col>
          </Row>
        </Grid>
      </ManagerPage>
    )
  }
}
