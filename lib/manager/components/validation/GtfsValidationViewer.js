import React from 'react'
import { Panel, Table,
  // Badge,
  Button } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table'

// import { getComponentMessages, getMessage } from '../../../common/util/config'

export default class GtfsValidationViewer extends React.Component {

  constructor (props) {
    super(props)
    this.state = { expanded: false }
  }
  componentWillMount () {
    this.props.fetchValidationResult()
  }
  componentWillReceiveProps (nextProps) {
    if (!nextProps.validationResult) this.setState({ expanded: false })
  }
  sortPriority (a, b, order) {
    const priorityToNum = p => {
      switch (p) {
        case 'HIGH':
          return 3
        case 'MEDIUM':
          return 2
        case 'LOW':
          return 1
        default:
          return 0
      }
    }
    if (order === 'desc') {
      return priorityToNum(a.priority) - priorityToNum(b.priority)
    } else {
      return priorityToNum(b.priority) - priorityToNum(a.priority)
    }
  }
  formatter (cell, row) {
    return <span title={cell}>{cell}</span>
  }
  render () {
    const result = this.props.validationResult
    // const messages = getComponentMessages('GtfsValidationViewer')
    const tableOptions = {
      striped: true,
      search: true,
      hover: true,
      exportCSV: true,
      // maxHeight: '500px',
      tableStyle: { marginLeft: '0px', marginRight: '0px' },
      pagination: true,
      options: {
        paginationShowsTotal: true,
        sizePerPageList: [10, 20, 50, 100]
      }
    }
    // let report = null
    const files = ['routes', 'stops', 'trips', 'shapes', 'stop_times']
    const errors = {}
    result && result.errors.map((error, i) => {
      error.index = i
      const key = files.indexOf(error.file) !== -1 ? error.file : 'other'
      if (!errors[error.file]) {
        errors[key] = []
      }
      errors[key].push(error)
    })
    // if (result && errors) {
    //   report = (
    //     <div>
    //       {files.map(file => {
    //         return (
    //           <ResultTable
    //             title={getMessage(messages, `issues.${file}`)}
    //             key={`${file}-issues-table`}
    //             invalidValues={errors[file]}
    //           />
    //         )
    //       })}
    //       <ResultTable
    //         title={'Other issues'}
    //         invalidValues={errors.other}
    //       />
    //     </div>
    //   )
    // } else if (result) {
    //   report = (<div>{getMessage(messages, 'noResults')}</div>)
    // }

    return (
      <div>
        <Panel header={<span>Validation Summary</span>}>
          <Table fill />
        </Panel>
        <BootstrapTable
          data={result && result.errors ? result.errors : []}
          {...tableOptions}
        >
          <TableHeaderColumn hidden isKey dataField='index' />
          <TableHeaderColumn dataSort dataFormat={this.formatter} width='65' dataField='file'>File</TableHeaderColumn>
          <TableHeaderColumn dataSort dataFormat={this.formatter} width='120' dataField='field'>Field</TableHeaderColumn>
          <TableHeaderColumn dataSort dataFormat={this.formatter} width='60' dataField='line'>Line</TableHeaderColumn>
          <TableHeaderColumn dataSort dataFormat={this.formatter} width='140' dataField='errorType'>Type</TableHeaderColumn>
          <TableHeaderColumn dataSort dataFormat={this.formatter} width='400' dataField='message'>Description</TableHeaderColumn>
          <TableHeaderColumn dataSort dataFormat={this.formatter} width='90' sortFunc={this.sortPriority} dataField='priority'>Priority</TableHeaderColumn>
          <TableHeaderColumn dataSort dataFormat={this.formatter} width='90' dataField='affectedEntityId'>Entity ID</TableHeaderColumn>
          <TableHeaderColumn dataSort dataFormat={(cell, row) => {
            return (
              <LinkContainer to={`/feed/${this.props.version.feedSource.id}/edit/${row.file.replace(/s\s*$/, '')}/${cell}`}>
                <Button
                  bsStyle='success'
                  bsSize='small'
                >
                  Edit
                </Button>
              </LinkContainer>
            )
          }} width='90' dataField='affectedEntityId'>Action</TableHeaderColumn>
          {/*
            <TableHeaderColumn dataSort dataField='route_desc'>Description</TableHeaderColumn>
            <TableHeaderColumn
              dataSort dataField='route_url'
              dataFormat={(cell, row) => {
                return cell ? ( <a href={cell} target={'_blank'} >Link</a> ) : ''
              }}>
                Route URL
            </TableHeaderColumn>
          */}
        </BootstrapTable>
      </div>
    )
  }
}

// class ResultTable extends React.Component {
//
//   render () {
//     const tableStyle = {
//       tableLayout: 'fixed'
//     }
//     const messages = getComponentMessages('ResultTable')
//
//     const breakWordStyle = {
//       wordWrap: 'break-word',
//       overflowWrap: 'break-word'
//     }
//     if (!this.props.invalidValues) {
//       return (
//         <Panel
//           header={(<h5><Icon className='text-success' type='check' /> {this.props.title} <Badge>0</Badge></h5>)}
//         >
//           No issues found.
//         </Panel>
//       )
//     }
//     return (
//       <Panel
//         header={(<h5><Icon className='text-warning' type='exclamation-triangle' /> {this.props.title} <Badge>{this.props.invalidValues.length}</Badge></h5>)}
//       >
//         <Table striped style={tableStyle} fill>
//           <thead>
//             <tr>
//               <th>{getMessage(messages, 'problemType')}</th>
//               <th>{getMessage(messages, 'priority')}</th>
//               <th>{getMessage(messages, 'affectedIds')}</th>
//               <th>{getMessage(messages, 'line')}</th>
//               <th className='col-md-6'>{getMessage(messages, 'description')}</th>
//             </tr>
//           </thead>
//           <tbody>
//             {this.props.invalidValues.map((val, index) => {
//               return (
//                 <tr key={`${index}-issue-row`}>
//                   <td style={breakWordStyle}>{val.errorType}</td>
//                   <td style={breakWordStyle}>{val.priority}</td>
//                   <td style={breakWordStyle}>{val.affectedEntityId}</td>
//                   <td style={breakWordStyle}>{val.line}</td>
//                   <td className='col-md-4' style={breakWordStyle}>{val.message}</td>
//                 </tr>
//               )
//             })}
//           </tbody>
//         </Table>
//       </Panel>
//     )
//   }
// }
