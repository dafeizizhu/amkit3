import YoutubeUI from 'amkit3-modules/v/ui/youtube'
import UIEvent from 'amkit3-modules/v/ui/events/ui-event'

var ui = new YoutubeUI(document.getElementById('container'), {
  duration: 100
}, err => {
  if (err) {
    console.log(err)
  } else {
    ui.on(UIEvent.PLAY_BUTTON_CLICK, () => {
      ui.setPause()
    })
    ui.on(UIEvent.PAUSE_BUTTON_CLICK, () => {
      ui.setPlay()
    })
    ui.on(UIEvent.TIME_CHANGE, () => {
      console.log('time change', ui.getTime())
    })
    ui.on(UIEvent.VOLUME_CHANGE, () => {
      console.log('volume change', ui.getVolume())
    })
  }
})
