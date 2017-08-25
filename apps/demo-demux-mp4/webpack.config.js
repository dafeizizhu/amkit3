var path = require('path')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var merge = require('webpack-merge')

var webpackBaseConfig = require('../../webpack.base.config')

module.exports = merge.strategy({
  'module.loaders': 'replace'
})(webpackBaseConfig, {
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel',
      query: {
        presets: ['es2015-loose']
      }
    }, {
      test: require.resolve('zepto'),
      loader: 'exports-loader?window.Zepto!script-loader'
    }]
  },
  entry: {
    'index': path.join(__dirname, 'index.js')
  },
  output: {
    path: path.join(__dirname, '../../dist/demo-demux-mp4'),
    filename: '[name].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: __dirname + '/index.html'
    })
  ]
})
