var format = require('date-format')

if (!console) {
  console = {}
}
if (!console.log) {
  console.log = () => {}
}
exports.getLogger = name => {
  return {
    debug: (...args) => {
      if (process.env.NODE_ENV != 'dev') return

      try { console.log.apply(console, ['[' + format() + '][DEBUG] - ' + name].concat(args)) }
      catch (e) { console.log(['[' + format() + '][DEBUG] - ' + name].concat(args).join(' ')) }
    },
    info: (...args) => {
      try { console.log.apply(console, ['[' + format() + '][INFO] - ' + name].concat(args)) }
      catch (e) { console.log(['[' + format() + '][INFO] - ' + name].concat(args).join(' ')) }
    },
    warn: (...args) => {
      try { console.log.apply(console, ['[' + format() + '][WARN] - ' + name].concat(args)) }
      catch (e) { console.log(['[' + format() + '][WARN] - ' + name].concat(args).join(' ')) }
    }
  }
}
