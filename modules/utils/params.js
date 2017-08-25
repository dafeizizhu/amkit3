exports.urlencoded = params => {
  var items = []
  for (var k in params) {
    if (params.hasOwnProperty(k)) {
      if (params[k] instanceof Array) {
        for (var i = 0; i < parmas[k].length; i++) {
          items.push(encodeURIComponent(k) + '=' + encodeURI(params[k][i]))
        }
      } else {
        items.push(encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
      }
    }
  }
  return items.join('&')
}
