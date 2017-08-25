var Getopt = require('node-getopt')
var path = require('path')
var shell = require('shelljs')

var getopt = new Getopt([
  ['', 'app_name=ARG', 'app_name']
]).bindHelp()
var opt = getopt.parse(process.argv.slice(2))
var app_name = opt.options['app_name']
if (!app_name) {
  getopt.showHelp()
} else {
  var app_path = path.join('apps', app_name)
  shell.cp('-R', 'scaffold', app_path)
  shell.ls(app_path).forEach(file => {
    var file_path = path.join(app_path, file)
    shell.sed('-i', 'P_APP_NAME', app_name, file_path)
  })
}

