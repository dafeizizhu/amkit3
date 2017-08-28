import assert from 'assert'

import Box from './box'
import FullBox from './full-box'

class UrlBox extends FullBox {
  constructor(o) {
    super(o)

    this.location = typeof o.location == 'string' ? o.location : ''
  }
  getSize() {
    return super.getSize() + this.location.length
  }
  writeData(stream) {
    super.writeData(stream)
    stream.writeString(this.location)
  }
}

UrlBox.fromStream = stream => {
  var box = Box.fromStream(stream)
  return UrlBox.dataFromStream(box.type, box.size, stream)
}

UrlBox.dataFromStream = (type, size, stream) => {
  var lastPosition = stream.getPosition() + size - 8
  var fullBox = FullBox.dataFromStream(type, size, stream)
  var { version, flags } = fullBox
  var location = stream.readString(lastPosition - stream.getPosition())

  return new UrlBox({ type, version, flags, location })
}

export default UrlBox
