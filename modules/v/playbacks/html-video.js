//import 'babel-polyfill'

import EventEmitter from 'events'
import path from 'path'
import url from 'url'

import ensureZepto from 'amkit3-modules/utils/ensure-zepto'

import { 
  PLAYING, 
  PAUSED, 
  LOAD_METADATA, 
  TIME_UPDATE, 
  BUFFERING, 
  NOT_BUFFERING,
  ENDED,
  ERROR,
  START_PROGRESS
} from './playback-event'

const ERROR_MESSAGES = [
  'SUCCESS',
  'MEDIA_ERR_ABORTED',
  'MEDIA_ERR_NETWORK',
  'MEDIA_ERR_DECODE',
  'MEDIA_ERR_SRC_NOT_SUPPORTED'
]

class HTMLVideoPlayback extends EventEmitter {
  constructor(tag, options, ready) {
    super()
    
    // buffer
    this.checkInterval = 50.0
    this.lastPlayPos = 0
    this.currentPlayPos = 0
    this.bufferingDetected = false

    ready = ready || function (){}
    let asyncReady = (...args) => setTimeout(() => ready.apply(null, args), 0)

    ensureZepto((err, $) => {
      if (err) asyncReady(err)
      else {
        this.$ = $
        this.options = this.$.extend({}, {
          loop: false,
          preload: 'meta',
          autoplay: false,
          controls: false,
          src: ''
        }, options)
        if (!this.options.src) {
          asyncReady(new Error('options.src is required'))
        } else { 
          this.isBrowserSupported(err => {
            this.init(tag, options, asyncReady)
          })
        }
      }
    })
  }
  isBrowserSupported(cb) {
    try {
      document.createElement('div') instanceof HTMLElement
      document.createElement('video') instanceof HTMLVideoElement
      var tempVideo = document.createElement('video')
      var ext = path.extname(url.parse(this.options.src).pathname).slice(1)
      if (tempVideo.canPlayType('video/' + ext)) {
        cb()
      } else {
        cb(new Error('src ' + this.options.src + ' is not supported'))
      }
    } catch (e) {
      cb(e)
    }
  }
  init(tag, options, ready) {
    if (tag instanceof HTMLElement) {
      if (tag instanceof HTMLVideoElement) {
        this.$video = tag
        this.$container = this.$video.parent()
      } else {
        this.$video = this.$(document.createElement('video'))
        this.$container = this.$(tag)
      }
    } else {
      this.$video = this.$(document.createElement('video'))
      this.$container = this.$(document.body)
    }

    this.$container.append(this.$video)
    this.initVideo(ready)
  }
  initVideo(ready) {
    this.initVideoAttributes()
    this.delegateVideoEvents()
    setInterval(() => this.checkBuffering(), this.checkInterval)
    ready()
  }
  initVideoAttributes() {
    this.$video.attr('src', this.options.src)
    if (this.options.loop) this.$video.attr('loop', 'loop')
    if (this.options.autoplay) this.$video.attr('autoplay', 'autoplay')
    if (this.options.controls) this.$video.attr('controls', 'controls')
    this.$video.attr('preload', this.options.preload)
  }
  delegateVideoEvents() {
    this.$video.on('playing', () => {
      this.emit(PLAYING)
    })
    this.$video.on('pause', () => this.emit(PAUSED))
    this.$video.on('loadedmetadata', () => {
      this.emit(LOAD_METADATA)
    })
    this.$video.on('timeupdate', () => this.emit(TIME_UPDATE))
    this.$video.on('ended', () => this.emit(ENDED))
    this.$video.on('error', evt => {
      this.error = new Error(ERROR_MESSAGES[this.$video[0].error.code] || 'UNKNOW_ERROR')
      this.emit(ERROR)
    })
    this.$video.one('progress', () => {
      this.isProgressed = true
      this.emit(START_PROGRESS)
    })
  }
  checkBuffering() {
    this.currentPlayPos = this.$video[0].currentTime
    var offset = 1 / this.checkInterval
    if (!this.bufferingDetected && this.currentPlayPos < (this.lastPlayPos + offset) && !this.$video[0].paused) {
      this.bufferingDetected = true
      this.emit(BUFFERING)
    }
    if (this.bufferingDetected && this.currentPlayPos > (this.lastPlayPos + offset) && !this.$video[0].paused) {
      this.bufferingDetected = false
      this.emit(NOT_BUFFERING)
    }
    this.lastPlayPos = this.currentPlayPos
  }
  getDuration() {
    return this.$video ? this.$video[0].duration : 0
  }
  getCurrentTime() {
    return this.$video ? this.$video[0].currentTime : 0
  }
  getVolume() {
    return this.$video ? this.$video[0].volume : 0
  }
  getSrc() {
    return this.$video ? this.$video[0].currentSrc : ''
  }
  getBuffered() {
    var buffered = []
    if (this.$video) {
      for (var i = 0; i < this.$video[0].buffered.length; i++) {
        buffered.push([this.$video[0].buffered.start(i), this.$video[0].buffered.end(i)])
      }
    }
    return buffered
  }
  getMuted() {
    return this.$video ? this.$video[0].muted : false
  }
  getVideoWidth() {
    return this.$video ? this.$video[0].videoWidth : 0
  }
  getVideoHeight() {
    return this.$video ? this.$video[0].videoHeight : 0
  }
  play() {
    this.$video && this.$video[0].play()
  }
  pause() {
    this.$video && this.$video[0].pause()
  }
  seek(value) {
    if (this.$video) this.$video[0].currentTime = value
  }
  setVolume(value) {
    if (this.$video) this.$video[0].volume = value
  }
  destroy() {
    if (this.$video) {
      this.$video.off()
      this.$video.attr('src', '')
      this.$video.attr('preload', 'none')
      this.$video.remove()
    }
  }
  getError() {
    return this.error
  }
  getReadyState() {
    if (this.$video) return this.$video[0].readyState
    else return 0
  }
}

export default HTMLVideoPlayback
