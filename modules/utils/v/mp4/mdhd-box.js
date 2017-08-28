import assert from 'assert'

import Box from './box'
import FullBox from './full-box'

class MdhdBox extends FullBox {
  constructor(o) {
    super(o)

    assert(this.version == 0)
    assert(!isNaN(o.timescale))
    assert(!isNaN(o.duration))

    this.create_time = isNaN(o.create_time) ? 0 : parseInt(o.create_time, 10)
    this.modification_time = isNaN(o.modification_time) ? 0 : parseInt(o.modification_time, 10)
    this.timescale = parseInt(o.timescale, 10)
    this.duration = parseInt(o.duration, 10)
    if (o.language instanceof Uint8Array && o.language.byteLength == 2) {
      this.language = new Uint8Array(2)
      this.language.set(o.language)
    } else {
      this.language = new Uint8Array([0x55, 0xc4])
    }
  }
  getSize() {
    return super.getSize() +
      4 +   // create_time            uint(32)
      4 +   // modification_time      uint(32)
      4 +   // timescale              uint(32)
      4 +   // duration               uint(32)
      2 +   // language               uint(8)[2]
      2     // pre_defined            uing(16)      0
  }
  writeData(stream) {
    super.writeData(stream)
    stream.writeUint32(this.create_time)
    stream.writeUint32(this.modification_time)
    stream.writeUint32(this.timescale)
    stream.writeUint32(this.duration)
    stream.writeUint8Array(this.language)
    stream.writeUint16(0)
  }
}

MdhdBox.fromStream = stream => {
  var box = Box.fromStream(stream)
  return MdhdBox.dataFromStream(box.type, box.size, stream)
}

MdhdBox.dataFromStream = (type, size, stream) => {
  var lastPosition = stream.getPosition() + size - 8
  var fullBox = FullBox.dataFromStream(type, size, stream)
  var { version, flags } = fullBox
  var create_time = stream.readUint32()
  var modification_time = stream.readUint32()
  var timescale = stream.readUint32()
  var duration = stream.readUint32()
  var language = stream.readUint8Array(2)
  stream.skip(2)

  assert(lastPosition == stream.getPosition())

  return new MdhdBox({ type, version, flags, create_time, modification_time, timescale, duration, language })
}

export default MdhdBox
