import HTMLVideoPlayback from 'amkit3-modules/v/playbacks/html-video'
import { PLAYING, PAUSED, LOAD_METADATA, TIME_UPDATE, BUFFERING, NOT_BUFFERING } from 'amkit3-modules/v/playbacks/playback-event'

let playback = new HTMLVideoPlayback(null, {
  src: 'http://w2.dwstatic.com/58/8/1635/3139238-101-1472627640.mp4',
  controls: true
},  err => {
  if (!err) {
    console.log('HTMLVideoPlayback ready')

    playback.on(PLAYING, () => console.log('playing!'))
    playback.on(PAUSED, () => console.log('paused!'))
    playback.on(LOAD_METADATA, () => console.log('load metadata!, duration', playback.getDuration()))
    playback.on(TIME_UPDATE, () => console.log('time update!, currentTime', playback.getCurrentTime()))
    playback.on(BUFFERING, () => console.log('buffering!'))
    playback.on(NOT_BUFFERING, () => console.log('not buffering!'))

    document.getElementById('check_button').addEventListener('click', () => {
      console.log('volume', playback.getVolume())
      console.log('src', playback.getSrc())
      console.log('buffered', playback.getBuffered().join('|'))
      console.log('muted', playback.getMuted())
      console.log('videoWidth', playback.getVideoWidth())
      console.log('videoHeight', playback.getVideoHeight())
    })
  } else {
    console.log('HTMLVideoPlayback is not ready, err', err)
  }
})

