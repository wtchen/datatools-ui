export const ROUTER_FIELDS = [{
  name: 'numItineraries',
  type: 'number',
  step: '1', // integer
  placeholder: '6'
}, {
  name: 'walkSpeed',
  type: 'number',
  placeholder: '3.0'
}, {
  name: 'stairsReluctance',
  type: 'number',
  placeholder: '2.0'
}, {
  name: 'carDropoffTime',
  type: 'number',
  placeholder: '240 (sec)'
}, {
  name: 'brandingUrlRoot',
  type: 'text',
  placeholder: 'http://gtfs.example.com/branding',
  width: 12
}, {
  name: 'requestLogFile',
  type: 'text',
  placeholder: '/var/otp/request.log',
  width: 12
}]

const options = [
  {disabled: true, value: '', children: '[select value]'},
  {value: true, children: 'true'},
  {value: false, children: 'false'}]

export const BUILD_FIELDS = [{
  name: 'fetchElevationUS',
  componentClass: 'select',
  type: 'select',
  children: options
}, {
  name: 'stationTransfers',
  componentClass: 'select',
  type: 'select',
  children: options
}, {
  name: 'subwayAccessTime',
  type: 'number',
  placeholder: '2.5 (min)',
  width: 12
}, {
  name: 'fares',
  type: 'text',
  width: 12
}]
