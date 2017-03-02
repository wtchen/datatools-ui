import Icon from '@conveyal/woonerf/components/icon'
import React, {PropTypes, Component} from 'react'
import { Button } from 'react-bootstrap'

export default class DeploymentPreviewButton extends Component {
  static propTypes = {
    deployment: PropTypes.object
  }
  render () {
    const { deployment } = this.props
    const { projectBounds } = deployment
    // TODO: add Try it button
    const server = deployment.project.otpServers.find(server => server.name === deployment.deployedTo)
    let href = server && server.publicUrl
    if (!href || href.length === 0) {
      return null
    }
    const lat = (projectBounds.north + projectBounds.south) / 2
    const lon = (projectBounds.east + projectBounds.west) / 2

    // figure out the zoom. assume that otp.js will open in a window of the same size (e.g. a new tab)
    const width = window.innerWidth
    const height = window.innerHeight

    // what fraction of the world is this from north to south?
    // note that we are storing the denominator only, to avoid roundoff errors
    const boundsHeightMerc = 180 / (projectBounds.north - projectBounds.south)

    // longitude is generally more complicated, because the length depends on the latitude
    // however, because we're using a Mercator projection, the map doesn't understand this either,
    // and maps 360 degrees of longitude to an invariant width
    // This is why Greenland appears larger than Africa, but it does make the math easy.
    const boundsWidthMerc = 360 / (projectBounds.east - projectBounds.west)

    // figure out the zoom level
    // level 0 is the entireer world in a single 256x256 tile, next level
    // is entire world in 256 * 2^1, then 256 * 2^2, and so on
    let z = 23

    while (true) {
      const worldSize = 256 * Math.pow(2, z)
      // again, store the denominator/reciprocal
      const windowWidthMerc = worldSize / width
      const windowHeightMerc = worldSize / height

      // if it fits. We use < not > because we have stored the reciprocals.
      if (windowWidthMerc < boundsWidthMerc && windowHeightMerc < boundsHeightMerc || z === 0) {
        break
      }

      z--
    }
    href += `#start/${lat}/${lon}/${z}/${deployment.routerId || 'default'}`
    return (
      <Button
        target='_blank'
        bsStyle='success'
        href={href}>
        <Icon type='window-restore' /> Preview
      </Button>
    )
  }
}
