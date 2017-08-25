var path = require('path')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var merge = require('webpack-merge')

var webpackBaseConfig = require('../../webpack.base.config')

module.exports = merge(webpackBaseConfig, {
  entry: {
    'index': path.join(__dirname, 'index.js')
  },
  output: {
    path: path.join(__dirname, '../../dist/P_APP_NAME'),
    filename: '[name].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: __dirname + '/index.html'
    })
  ]
})
