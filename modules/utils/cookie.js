import cookie from 'cookie'

exports.set = (name, value, options) => {
  document.cookie = cookie.serialize(name, value, options)
}

exports.get = name => {
  return cookie.parse(document.cookie)[name]
}
