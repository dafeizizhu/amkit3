import assert from 'assert'

import Box from './box'
import FullBox from './full-box'

class TkhdBox extends FullBox {
  constructor(o) {
    super(o)

    assert(this.version == 0)
    assert(!isNaN(o.track_ID))
    assert(!isNaN(o.duration))
    assert(!isNaN(o.layer))
    assert(!isNaN(o.alternate_group))
    assert(!isNaN(o.volume))
    assert(o.matrix instanceof Uint8Array)
    assert(!isNaN(o.width))
    assert(!isNaN(o.height))

    this.create_time = isNaN(o.create_time) ? 0 : parseInt(o.create_time, 10)
    this.modification_time = isNaN(o.modification_time) ? 0 : parseInt(o.modification_time, 10)
    this.track_ID = parseInt(o.track_ID, 10)
    this.duration = parseInt(o.duration, 10)
    this.layer = parseInt(o.layer, 10)
    this.alternate_group = parseInt(o.alternate_group, 10)
    this.volume = parseFloat(o.volume)
    this.matrix = new Uint8Array(o.matrix.byteLength)
    this.matrix.set(o.matrix)
    this.width = parseInt(o.width, 10)
    this.height = parseInt(o.height, 10)
  }
  getSize() {
    return super.getSize() +
      4 +   // create_time          uint(32)
      4 +   // modification_time    uint(32)
      4 +   // track_ID             uint(32)
      4 +   // reserved             uint(32)      0
      4 +   // duration             uint(32)
      8 +   // reserved             uint(32)[2]   0
      2 +   // layer                int(16)
      2 +   // alternate_group      int(16)       0
      2 +   // volume               int(16)
      36 +  // matrix               uint(32)[9]
      4 +   // width                uint(32)
      4 +   // height               uint(32)
      2     // reserved             uint(8)[2]    0
  }
  writeData(stream) {
    super.writeData(stream)
    stream.writeUint32(this.create_time)
    stream.writeUint32(this.modification_time)
    stream.writeUint32(this.track_ID)
    stream.writeUint32(0)
    stream.writeUint32(this.duration)
    stream.writeUint8Array(new Uint8Array([
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00
    ]))
    stream.writeInt16(this.layer)
    stream.writeInt16(this.alternate_group)
    if (this.volume) { stream.writeUint8(1) } 
    else { stream.writeUint8(0) }
    stream.writeUint8(0)
    stream.writeUint8Array(this.matrix)
    stream.writeUint32(this.width)
    stream.writeUint32(this.height)
    stream.writeUint16(0)
  }
}

TkhdBox.fromStream = stream => {
  var box = Box.fromStream(stream)
  return TkhdBox.dataFromStream(box.type, box.size, stream)
}

TkhdBox.dataFromStream = (type, size, stream) => {
  var lastPosition = stream.getPosition() + size - 8
  var fullBox = FullBox.dataFromStream(type, size, stream)
  var { version, flags } = fullBox
  var create_time = stream.readUint32()
  var modification_time = stream.readUint32()
  var track_ID = stream.readUint32()
  stream.skip(4)
  var duration = stream.readUint32()
  stream.skip(8)
  var layer = stream.readInt16()
  var alternate_group = stream.readInt16()
  var volume = parseFloat(stream.readUint8() + '.' + stream.readUint8())
  var matrix = stream.readUint8Array(36)
  var width = stream.readUint32()
  var height = stream.readUint32()
  stream.skip(2)

  assert(lastPosition == stream.getPosition())

  return new TkhdBox({ type, version, flags, create_time, modification_time, track_ID, duration, layer, alternate_group, volume, matrix, width, height })
}

export default TkhdBox
