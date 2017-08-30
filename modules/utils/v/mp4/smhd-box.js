import assert from 'assert'

import Box from './box'
import FullBox from './full-box'

class SmhdBox extends FullBox {
  constructor(o) {
    super(o)

    assert(!isNaN(o.balence))

    this.balence = parseFloat(o.balence)
  }
  getSize() {
    return super.getSize() +
      2 +   // balence    uint(16) >> 4
      2     // reserved   uint(16)        0
  }
  writeData(stream) {
    super.writeData(stream)
    stream.writeUint16(this.balence << 4)
    stream.writeUint16(0)
  }
}

SmhdBox.fromStream = stream => {
  var box = Box.fromStream(stream)
  return SmhdBox.dataFromStream(box.type, box.size, stream)
}

SmhdBox.dataFromStream = (type, size, stream) => {
  var lastPosition = stream.getPosition() + size - 8
  var { version, flags } = FullBox.dataFromStream(type, size, stream)
  var balence = stream.readUint16() >> 4
  stream.skip(2)
  assert(lastPosition == stream.getPosition())
  return new SmhdBox({ type, version, flags, balence })
}

export default SmhdBox
