// @flow

import type {FormProps} from '../../types'

const options = [
  {disabled: true, value: '', children: '[select value]'},
  {value: true, children: 'true'},
  {value: false, children: 'false'}]

export const FIELDS: Array<FormProps> = [
  {
    name: 'buildConfig.fetchElevationUS',
    componentClass: 'select',
    type: 'select-bool',
    children: options,
    effects: [
      {
        key: 'buildConfig.elevationBucket',
        value: {}
      }
    ]
  }, {
    name: 'buildConfig.stationTransfers',
    componentClass: 'select',
    type: 'select-bool',
    children: options
    // FIXME: Add elevation bucket.
  // }, {
  //   name: 'buildConfig.elevationBucket.bucketName',
  //   type: 'text',
  //   placeholder: 'bucketName',
  //   width: 4,
  //   condition: {
  //     key: 'buildConfig.fetchElevationUS',
  //     value: true
  //   }
  // }, {
  //   name: 'buildConfig.elevationBucket.accessKey',
  //   type: 'text',
  //   placeholder: 'AKIAIOSFODNN7EXAMPLE',
  //   width: 4,
  //   condition: {
  //     key: 'buildConfig.fetchElevationUS',
  //     value: true
  //   }
  // }, {
  //   name: 'buildConfig.elevationBucket.secretKey',
  //   type: 'text',
  //   placeholder: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  //   width: 4,
  //   condition: {
  //     key: 'buildConfig.fetchElevationUS',
  //     value: true
  //   }
  }, {
    name: 'buildConfig.subwayAccessTime',
    type: 'number',
    placeholder: '2.5 (min)',
    width: 12
  }, {
    name: 'buildConfig.fares',
    type: 'text',
    width: 12
  }, {
    name: 'routerConfig.numItineraries',
    type: 'number',
    step: '1', // integer
    placeholder: '6'
  }, {
    name: 'routerConfig.walkSpeed',
    type: 'number',
    placeholder: '3.0'
  }, {
    name: 'routerConfig.stairsReluctance',
    type: 'number',
    placeholder: '2.0'
  }, {
    name: 'routerConfig.carDropoffTime',
    type: 'number',
    placeholder: '240 (sec)'
  }, {
  //   name: 'routerConfig.brandingUrlRoot',
  //   type: 'text',
  //   placeholder: 'http://gtfs.example.com/branding',
  //   width: 12
  // }, {
    name: 'routerConfig.requestLogFile',
    type: 'text',
    placeholder: '/var/otp/request.log',
    width: 12
  }
]

export const UPDATER_FIELDS: Array<FormProps> = [
  {
    name: 'routerConfig.updaters.$index.type',
    type: 'select',
    componentClass: 'select',
    children: [
      {disabled: true, value: '', children: '[select value]'},
      {value: 'bike-rental', children: 'bike-rental'},
      {value: 'bike-park', children: 'bike-park'},
      {value: 'stop-time-updater', children: 'stop-time-updater'},
      {value: 'websocket-gtfs-rt-updater', children: 'websocket-gtfs-rt-updater'},
      {value: 'real-time-alerts', children: 'real-time-alerts'},
      {value: 'example-updater', children: 'example-updater'},
      {value: 'example-polling-updater', children: 'example-polling-updater'},
      {value: 'winkki-polling-updater', children: 'winkki-polling-updater'},
      {value: 'opentraffic-updater', children: 'opentraffic-updater'}
    ],
    width: 12
  }, {
    name: 'routerConfig.updaters.$index.frequencySec',
    placeholder: '30',
    type: 'number',
    step: '1' // integer
  }, {
    name: 'routerConfig.updaters.$index.sourceType',
    placeholder: 'e.g., gbfs, bixi, city-bikes',
    type: 'select',
    componentClass: 'select',
    children: [
      {value: '', children: '[optional]'},
      {value: 'jcdecaux', children: 'jcdecaux'},
      {value: 'b-cycle', children: 'b-cycle'},
      {value: 'bixi', children: 'bixi'},
      {value: 'keolis-rennes', children: 'keolis-rennes'},
      {value: 'ov-fiets', children: 'ov-fiets'},
      {value: 'city-bikes', children: 'city-bikes'},
      {value: 'vcub', children: 'vcub'},
      {value: 'citi-bike-nyc', children: 'citi-bike-nyc'},
      {value: 'next-bike', children: 'next-bike'},
      {value: 'kml', children: 'kml'},
      {value: 'sf-bay-area', children: 'sf-bay-area'},
      {value: 'share-bike', children: 'share-bike'},
      {value: 'kml-placemarks', children: 'kml-placemarks'},
      {value: 'gbfs', children: 'gbfs'},
      {value: 'gtfs-file', children: 'gtfs-file'},
      {value: 'gtfs-http', children: 'gtfs-http'}
    ]
  }, {
    name: 'routerConfig.updaters.$index.url',
    placeholder: 'https://agency.com/realtime/tripupdates',
    type: 'text'
  }, {
    name: 'routerConfig.updaters.$index.defaultAgencyId',
    placeholder: 'TriMet',
    type: 'text'
  }
]

export const SERVER_FIELDS: Array<FormProps> = [
  {
    name: 'otpServers.$index.name',
    placeholder: 'Production',
    type: 'text',
    width: 12
  }, {
    name: 'otpServers.$index.publicUrl',
    placeholder: 'http://otp.example.com',
    type: 'text'
  }, {
    name: 'otpServers.$index.internalUrl',
    placeholder: 'http://127.0.0.1/otp,http://0.0.0.0/otp',
    type: 'text'
  }, {
    name: 'otpServers.$index.instanceType',
    placeholder: 'r4.xlarge',
    type: 'text',
    width: 4
  }, {
    name: 'otpServers.$index.s3Bucket',
    placeholder: 's3_bucket_name',
    type: 'text',
    width: 4
  }, {
    name: 'otpServers.$index.admin',
    type: 'checkbox',
    width: 4
  }, {
    name: 'otpServers.$index.targetGroupArn',
    placeholder: 'arn:aws:elasticloadbalancing:us-east-1:12345678:targetgroup/target-group-name/12345678abcd',
    type: 'text'
  }
]
