// TODO original cookie getter
function getCookie(name) {
  var cookieValue = null, REG_TRIM = /^(\s|\u00A0)+|(\s|\u00A0)+$/g
  if (document.cookie && document.cookie != '') {
    var cookies = document.cookie.split(';')
    for (var i = 0; i < cookies.length; i++) {
      var cookie = (cookies[i] || "").replace(REG_TRIM, "")
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) == (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
        break
      }
    }
  }
  return cookieValue
}

let publicPath = getCookie('amkit3-public-path')

if (publicPath) {
  if (typeof console == 'object' && typeof console.log == 'function') {
    console.log('amkit3 public path map to', publicPath)
  }
  __webpack_public_path__ = publicPath
}
