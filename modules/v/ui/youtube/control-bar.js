import EventEmitter from 'events'
import delegate from 'delegate'
import Draggable from 'draggable'
import prefix from 'prefix-style'
import elementClass from 'element-class'

import { formalFormat } from 'amkit3-modules/utils/time'

import ControlBarEvent from '../events/control-bar-event'

class ControlBar extends EventEmitter {
  constructor(container, options) {
    super()

    this.isPlay = true
    this.isPause = false
    this.time = 0
    this.volume = 0
    this.duration = options.duration
    
    // svg resource
    this.pauseSvg = require('raw-loader!./pause.svg')
    this.playSvg = require('raw-loader!./play.svg')
    
    this.container = container
    this.playButton = this.container.querySelector('.play-button')
    this.progressBarContainer = this.container.querySelector('.progress-bar-container')
    this.progressBar = this.container.querySelector('.progress-bar')
    this.progressPlay = this.container.querySelector('.progress.play')
    this.progressScrubber = this.container.querySelector('.scrubber-container')
    this.progressDraggable = new Draggable(this.progressScrubber, {
      limit: {
        // TODO
        x: [-6.5, this.progressBar.clientWidth - 6.5],
        y: -4
      },
      onDragStart: () => {
        this.progressBarContainer.className += ' drag'
        this.isProgressDragging = true
      },
      onDrag: (element, x, y, event) => {
        let percentage = (x + 6.5) / this.progressBar.clientWidth
        this.progressPlay.style[prefix('transform')] = 'scaleX(' + percentage + ')'
      },
      onDragEnd: (element, x, y, event) => {
        let className = this.progressBarContainer.className
        this.progressBarContainer.className = className.replace('drag', '')
        
        let percentage = (x + 6.5) / this.progressBar.clientWidth
        this.progressPlay.style[prefix('transform')] = 'scaleX(' + percentage + ')'
        this.time =  percentage * this.duration
        this.timeDisplayCurrent.innerHTML = formalFormat(this.time)
        this.emit(ControlBarEvent.TIME_CHANGE)
        this.isProgressDragging = false
      }
    })
    this.isProgressDragging = false

    this.timeDisplayCurrent = this.container.querySelector('.time-display .current')
    this.timeDisplayDuration = this.container.querySelector('.time-display .duration')
    this.timeDisplayDuration.innerHTML = formalFormat(this.duration)
    this.volumeContainer = this.container.querySelector('.volume-container')
    this.volumeSlider = this.container.querySelector('.volume-panel .slider')
    this.volumeScrubber = this.container.querySelector('.volume-panel .slider .handle')
    this.volumeDraggable = new Draggable(this.volumeScrubber, {
      limit: {
        // TODO
        x: [0, 40],
        y: 12 
      },
      onDragStart: () => {
        this.volumeContainer.className += ' drag'
      },
      onDrag: (element, x, y, event) => {
        let percentage = x / 40
        this.volume = percentage
        this.emit(ControlBarEvent.VOLUME_CHANGE)
      },
      onDragEnd: () => {
        let className = this.volumeContainer.className
        this.volumeContainer.className = className.replace('drag', '')
      }
    })

    delegate(this.container, '.play-button', 'click', () => {
      if (this.isPlay) {
        this.setPause()
        this.emit(ControlBarEvent.PLAY_BUTTON_CLICK)
      } else if (this.isPause) {
        this.setPlay()
        this.emit(ControlBarEvent.PAUSE_BUTTON_CLICK)
      }
    })
    delegate(this.container, '.progress-bar', 'click', evt => {
      let percentage = evt.clientX / this.progressBar.clientWidth
      this.time = percentage * this.duration
      this.timeDisplayCurrent.innerHTML = formalFormat(this.time)
      this.progressPlay.style[prefix('transform')] = 'scaleX(' + percentage + ')'
      this.progressDraggable.set(percentage * this.progressBar.clientWidth - 6.5, -4)
      this.emit(ControlBarEvent.TIME_CHANGE)
    })
    delegate(this.container, '.volume-panel .slider', 'click', evt => {
      let percentage = (evt.clientX - this.volumeSlider.offsetLeft) / this.volumeSlider.clientWidth
      this.volume = percentage
      this.volumeDraggable.set(Math.max(0, Math.min(40, percentage * this.volumeSlider.clientWidth - 6)), 12)
      this.emit(ControlBarEvent.VOLUME_CHANGE)
    })
    delegate(this.container, '.mute-button', 'mouseover', evt => {
      clearTimeout(this.tId)
      elementClass(this.volumeContainer).add('hover')
    })
    delegate(this.container, '.mute-button', 'mouseout', evt => {
      this.tId = setTimeout(() => {
        elementClass(this.volumeContainer).remove('hover')
      }, 500)
    })
    delegate(this.container, '.volume-panel', 'mouseover', evt => {
      clearTimeout(this.tId)
      elementClass(this.volumeContainer).add('hover')
    })
    delegate(this.container, '.volume-panel', 'mouseout', evt => {
      this.tId = setTimeout(() => {
        elementClass(this.volumeContainer).remove('hover')
      }, 500)
    })
  }
  setPause() {
    this.isPlay = false
    this.isPause = true
    this.playButton.innerHTML = this.pauseSvg
  }
  setPlay() {
    this.isPlay = true
    this.isPause = false
    this.playButton.innerHTML = this.playSvg
  }
  setTime(value) {
    if (this.isProgressDragging) return
    this.time = value
    this.timeDisplayCurrent.innerHTML = formalFormat(this.time)
    let percentage = Math.max(0, Math.min(1, this.time / this.duration))
    this.progressPlay.style[prefix('transform')] = 'scaleX(' + percentage + ')'
    this.progressDraggable.set(percentage * this.progressBar.clientWidth - 6.5, -4)
  }
}

export default ControlBar
