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

const DefaultItemFormatter = (version: FeedVersion, activeVersion: FeedVersion) => (
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

export default function VersionSelectorDropdown (props: Props) {
  const {
    dropdownProps,
    header,
    itemFormatter,
    title,
    version,
    versions
  } = props
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

VersionSelectorDropdown.defaultProps = {
  dropdownProps: {
    onSelect: (key: number | string) => console.log(`selected ${key}`)
  },
  itemFormatter: DefaultItemFormatter
}
