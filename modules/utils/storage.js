import cookie from 'amkit3-modules/utils/cookie'

exports.cookie = (name, value, options) => {
  options = options || {}
  let result = cookie.get(name)
  if (typeof result != 'undefined') {
    cookie.set(name, result, options)
    return result
  } else {
    if (typeof value != 'undefined') {
      cookie.set(name, value, options)
    }
    return value
  }
}
