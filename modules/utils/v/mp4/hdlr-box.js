import assert from 'assert'

import Box from './box'
import FullBox from './full-box'

class HdlrBox extends FullBox {
  constructor(o) {
    super(o)

    assert(typeof o.handler_type == 'string')
    assert(o.handler_type.length == 4)
    assert(typeof o.name == 'string')

    this.handler_type = o.handler_type
    this.name = o.name
  }
  getSize() {
    return super.getSize() + 
      4 +   // pre_defined      uint(32)    0
      4 +   // handler_type     str(4)
      12 +  // reserved         uint(32)[3] 0
      this.name.length
  }
  writeData(stream) {
    super.writeData(stream)
    stream.writeUint32(0)
    stream.writeString(this.handler_type)
    stream.writeUint32(0)
    stream.writeUint32(0)
    stream.writeUint32(0)
    stream.writeString(this.name)
  }
}

HdlrBox.fromStream = stream => {
  var box = Box.fromStream(stream)
  return HdlrBox.dataFromStream(box.type, box.size, stream)
}

HdlrBox.dataFromStream = (type, size, stream) => {
  var lastPosition = stream.getPosition() + size - 8
  var fullBox = FullBox.dataFromStream(type, size, stream)
  var { version, flags } = fullBox
  stream.skip(4)
  var handler_type = stream.readString(4)
  stream.skip(12)
  var name = stream.readString(lastPosition - stream.getPosition())

  return new HdlrBox({ type, version, flags, handler_type, name })
}

export default HdlrBox
