import React, {Component, PropTypes} from 'react'
import { Grid, Row, Col, Button, Glyphicon, PageHeader } from 'react-bootstrap'

import ManagerPage from '../../common/components/ManagerPage'
import GtfsPlusTable from './GtfsPlusTable'
import gtfsPlusTables from '../gtfsPlusTables'

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

  render () {
    if(!this.props.feedSource) return null

    const buttonStyle = {
      display: 'block',
      width: '100%'
    }

    const activeTable = gtfsPlusTables.find(t => t.id === this.state.activeTableId)

    return (
      <ManagerPage ref='page'>
        <Grid>
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
                  }}
                >Save</Button>
              </PageHeader>
            </Col>
          </Row>

          <Row>
            <Col xs={2}>
              {gtfsPlusTables.map(table => {
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
                table={activeTable}
                tableData={this.props.tableData[activeTable.id]}
                newRowClicked={this.props.newRowClicked}
                deleteRowClicked={this.props.deleteRowClicked}
                fieldEdited={this.props.fieldEdited}
              />
            </Col>
          </Row>
        </Grid>
      </ManagerPage>
    )
  }
}
