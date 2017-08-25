var path = require('path')
var webpack = require('webpack')
var argv = require('yargs').boolean('d').argv

var plugins = [
  new webpack.ProvidePlugin({
    zepto: 'zepto',
    $: 'zepto'
  }),
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify(argv.d ? 'dev' : 'prod'),
      'TEST': JSON.stringify(process.env.TEST ? true : false)
    }
  })
]

if (!argv.d) {
  plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      properties: false
    },
    mangle: {
      screw_ie8: false,
      except: ['e']
    },
    output: {
      beautify: false,
      comments: false,
      keep_quoted_props: true
    }
  }))
}

module.exports = {
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'es3ify-loader'
    }, {
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel'
    }, {
      test: require.resolve('zepto'),
      loader: 'exports-loader?window.Zepto!script-loader'
    }, {
      test: /\.css$/,
      loader: 'style-loader!css-loader'
    }, {
      test: /\.(png|jpg|gif)$/,
      loader: 'file-loader'
    }, {
      test: /\.html$/,
      loader: 'mustache'
    }, {
      test: /\.scss$/,
      loaders: ['style-loader', 'css-loader', 'sass-loader', 'postcss-loader']
    }, {
      test: /\.cssm$/,
      loader: 'style-loader!css-loader?modules!postcss-loader'
    }, {
      test:/\.scssm$/,
      loader: 'style-loader!css-loader?modules&localIdentName=' + (argv.d ? '[local]-[hash:base64:8]' : '') + '!postcss-loader!sass-loader'
    }]
  },
  resolve: {
    alias: {
      'amkit3-modules': path.join(__dirname, 'modules'),
      'amkit3-apps': path.join(__dirname, 'apps'),
      'zepto': path.join(__dirname, 'node_modules', 'zepto', 'dist', 'zepto.js')
    }
  },
  plugins: plugins,
  postcss: function () {
    return [
      require('autoprefixer')(),
      require('postcss-sprites')()
    ]
  },
  node: {
    fs: 'empty',
    cluster: 'empty',
    dgram: 'empty',
    'hipchat-notifier': 'empty',
    axios: 'empty',
    loggly: 'empty',
    'mailgun-js': 'empty',
    net: 'empty',
    'slack-node': 'empty',
    nodemailer: 'empty',
    'child_process': 'empty'
  }
}
