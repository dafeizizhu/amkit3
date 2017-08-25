exports.getOS = () => {
  return window.navigator.platform
}

exports.getSre = () => {
  return window.screen ? window.screen.availWidth + '*' + window.screen.availHeight : ''
}
