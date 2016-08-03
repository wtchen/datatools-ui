import React from 'react'
import { Link } from 'react-router'
import { Glyphicon } from 'react-bootstrap'

import { getComponentMessages } from '../util/config'

export default class Breadcrumbs extends React.Component {
  constructor (props) {
    super(props)
  }
  render () {
    const messages = getComponentMessages('Breadcrumbs')
    return (
      <ol className='breadcrumb'>
        <li><Link to='/'>{messages.root}</Link></li>
        {this.props.project
          ? <li><Link to='/project'>{messages.projects}</Link></li>
          : null
        }
        {/* active project OR link to project */}
        {this.props.project && !this.props.deployment && !this.props.feedSource
          ? <li className='active'>{this.props.project.name}</li>
          : <li><Link to={`/project/${this.props.project.id}`}>{this.props.project.name}</Link></li>
        }
        {this.props.feedSource && !this.props.feedVersion
          ? <li className='active'>{this.props.feedSource.name}</li>
          : null
        }
        {this.props.deployment
          ? <li><Link to={`/project/${this.props.deployment.project.id}/deployments`}>{messages.deployments}</Link></li>
          : null
        }
        {this.props.deployment
          ? <li className='active'>{this.props.deployment.name}</li>
          : null
        }
        {this.props.feedVersion
          ? <li><Link to={`/feed/${this.props.feedVersion.feedSource.id}`}>{this.props.feedVersion.feedSource.name}</Link></li>
          : null
        }
        {this.props.feedVersion
          ? <li className='active'>Version {this.props.feedVersion.version} Validation Explorer</li>
          : null
        }
      </ol>
    )
  }
}
