module.exports = cb => {
  if (typeof requestAnimationFrame == 'function') {
    return requestAnimationFrame(cb)
  } else {
    return setTimeout(cb, 1000 / 100)
  }
}

module.exports.cancel = handle => {
  if (typeof cancelAnimationFrame == 'function') {
    return cancelAnimationFrame(handle)
  } else {
    return clearTimeout(handle)
  }
}
