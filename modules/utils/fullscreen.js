exports.requestFullscreen = ele => {
  if (ele.requestFullscreen) {
    ele.requestFullscreen()
  } else if (ele.webkitRequestFullscreen) {
    ele.webkitRequestFullscreen()
  } else if (ele.mozRequestFullScreen) {
    ele.mozRequestFullScreen()
  } else if (ele.msRequestFullscreen) {
    ele.msRequestFullscreen()
  } else {
    console.log('Fullscreen API is not supported.')
  }
}

exports.exitFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen()
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen()
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen()
  } else {
    console.log('Fullscreen API is not supported.')
  }
}

exports.isFullscreen = () => {
  if (typeof document.fullscreenElement != 'undefined') {
    return !!document.fullscreenElement
  } else if (typeof document.webkitFullscreenElement != 'undefined') {
    return !!document.webkitFullscreenElement
  } else if (typeof document.mozFullscreenElement != 'undefined') {
    return !!document.mozFullscreenElement
  } else if (typeof document.msFullscreenElement != 'undefined') {
    return !!document.msFullscreenElement
  } else return false
}

exports.fullscreenChange = function (cb) {
  [
    'onfullscreenchange',
    'onwebkitfullscreenchange',
    'onmozfullscreenchange',
    'onmsfullscreenchange'
  ].forEach(key => {
    if (typeof document[key] != 'undefined') {
      document[key] = () => {
        cb()
      }
      return false
    }
  })
}
