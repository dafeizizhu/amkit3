import 'babel-polyfill'
import EventEmitter from 'events'

import ControlBarEvent from 'amkit3-modules/v/ui/events/control-bar-event'
import UIEvent from 'amkit3-modules/v/ui/events/ui-event'

import ControlBar from './control-bar'

function isBrowserSupported(cb) {
  try {
    document.createElement('div') instanceof HTMLElement
    cb()
  } catch (e) {
    cb(e)
  }
}

class YoutubeUI extends EventEmitter {
  constructor(container, options, ready) {
    super()

    ready = ready || function () {} 
    let asyncReady = (...args) => setTimeout(() => ready.apply(null, args), 0)

    isBrowserSupported(err => {
      if (err) {
        asyncReady(err)
      } else {
        this.init(container, options, asyncReady)
      }
    })
  }
  init(container, options, ready) {
    this.container = container instanceof HTMLElement ? container : document.body
    // TODO
    this.options = options

    // svg resoures
    this.playSvg = require('raw-loader!./play.svg')
    this.volumeSvg = require('raw-loader!./volume.svg')
    
    var html = require('./template.html')({
      playButtonSvg: this.playSvg,
      muteButtonSvg: this.volumeSvg
    })
    var tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    for (var i = 0; i < tempDiv.children.length; i++) {
      this.container.appendChild(tempDiv.children[i])
    }
    tempDiv.innerHTML = ''
    tempDiv = null

    // import style
    require('./style.scss')

    // controlBar
    this.controlBar = new ControlBar(this.container, this.options)
    this.controlBar.on(ControlBarEvent.PLAY_BUTTON_CLICK, () => {
      this.emit(UIEvent.PLAY_BUTTON_CLICK)
    })
    this.controlBar.on(ControlBarEvent.PAUSE_BUTTON_CLICK, () => {
      this.emit(UIEvent.PAUSE_BUTTON_CLICK)
    })
    this.controlBar.on(ControlBarEvent.TIME_CHANGE, () => {
      this.emit(UIEvent.TIME_CHANGE)
    })
    this.controlBar.on(ControlBarEvent.VOLUME_CHANGE, () => {
      this.emit(UIEvent.VOLUME_CHANGE)
    })

    this.bufferingPanel = this.container.querySelector('.spinner')

    ready()
  }
  setPause() {
    this.controlBar.setPause()
  }
  setPlay() {
    this.controlBar.setPlay()
  }
  getTime() {
    return this.controlBar.time
  }
  setTime(value) {
    this.controlBar.setTime(value)
  }
  getVolume() {
    return this.controlBar.volume
  }
  setBuffering(value) {
    if (value) {
      this.bufferingPanel.style.display = 'block'
    } else {
      this.bufferingPanel.style.display = 'none'
    }
  }
}

export default YoutubeUI
