'use strict'

var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  devtool: 'eval-source-map',
  entry: [
    'babel-polyfill',
    path.join(__dirname, 'src/main/client/main.js')
  ],
  output: {
    path: path.join(__dirname, 'src/main/resources/public/'),
    filename: '[name].js',
    publicPath: '/'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/main/client/index.tpl.html',
      inject: 'body',
      filename: 'index.html'
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ],
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel'
      }, {
        test: /\.json?$/,
        loader: 'json'
      }, {
        test: /\.yml$/,
        loader: 'yaml'
      // }, {
      //   test: /\.css$/,
      //   loader: 'style!css?modules&localIdentName=[name]---[local]---[hash:base64:5]'
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        // test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        // loader: 'url-loader?limit=10000&mimetype=application/font-woff&name=./assets/fonts/[hash].[ext]'
        loader: 'url-loader?limit=10000&mimetype=application/font-woff&name=./assets/fonts/[hash].[ext]'
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader?name=./assets/img/[hash].[ext]'
      },
      // css-loader
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.(png|jpg)$/, loader: 'url-loader?limit=10000&name=./assets/img/[hash].[ext]'},
    ]
  }
}
