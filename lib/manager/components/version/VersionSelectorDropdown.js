// @flow

import Icon from '@conveyal/woonerf/components/icon'
import * as React from 'react'
import { Dropdown, MenuItem } from 'react-bootstrap'

import VersionRetrievalBadge from './VersionRetrievalBadge'

import type { FeedVersion } from '../../../types'

type Props = {
  dropdownProps: any,
  header?: string,
  itemFormatter: (FeedVersion, number, FeedVersion) => React.Node,
  title: React.Node,
  version: FeedVersion,
  versions: ?Array<FeedVersion>
}

const defaultItemFormatter = (version: FeedVersion, index: number, activeVersion: FeedVersion) => {
  return (
    <MenuItem
      key={version.id}
      eventKey={version.version}
    >
      {version.id === activeVersion.id
        ? <Icon
          style={{
            position: 'absolute',
            left: '2px',
            marginTop: '3px'
          }}
          type='check' />
        : null}
      {version.version}. {version.name}{' '}
      <VersionRetrievalBadge version={version} />
    </MenuItem>
  )
}

export default class VersionSelectorDropdown extends React.Component<Props> {
  static defaultProps = {
    dropdownProps: {
      onSelect: (index: number) => console.log(`selected ${index}`)
    },
    itemFormatter: defaultItemFormatter
  }

  render () {
    const {
      dropdownProps,
      header,
      itemFormatter,
      title,
      version,
      versions
    } = this.props
    const versionsSorted = versions
      ? versions.slice(0).reverse()
      : []
    return (
      <Dropdown
        {...dropdownProps}
      >
        <Dropdown.Toggle>
          {title}
        </Dropdown.Toggle>
        <Dropdown.Menu className='scrollable-dropdown'>
          {header ? <MenuItem header>{header}</MenuItem> : null}
          {versionsSorted.length > 0
            ? versionsSorted.map((v, i) => itemFormatter(v, i, version))
            : <MenuItem disabled>No versions available</MenuItem>}
        </Dropdown.Menu>
      </Dropdown>
    )
  }
}
