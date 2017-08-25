import EventEmitter from 'events'

class StatefulEventEmitter extends EventEmitter {
  constructor() {
    super()

    this.disabled = false
  }
  statefulDelegate(cb) {
    return (...args) => {
      if (this.disabled) return
      return cb.apply(this, args)
    }
  }
  enable() {
    this.disabled = false
  }
  disable() {
    this.disabled = true
  }
}

export default StatefulEventEmitter
