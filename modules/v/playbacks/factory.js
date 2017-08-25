let playbacks = [
  cb => require.ensure([], require => {
    cb(null, require('amkit3-modules/v/playbacks/html-video')['default'])
  })
]

let get = (start, container, options, cb) => {
  let playbackCb = playbacks[start]
  if (!playbackCb) {
    cb(new Error('no playback available'))
  } else {
    playbackCb((err, PlaybackConstructor) => {
      let playback = new PlaybackConstructor(container, options, err => {
        if (err) {
          get(start + 1, container, options, cb)
        } else {
          cb(null, PlaybackConstructor, playback)
        }
      })
    })
  }
}

exports.get = (container, options, cb) => get(0, container, options, cb)
