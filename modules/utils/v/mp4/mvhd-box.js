import assert from 'assert'

import Box from './box'
import FullBox from './full-box'

class MvhdBox extends FullBox {
  constructor(o) {
    super(o)

    assert(this.version == 0)
    assert(!isNaN(o.timescale))
    assert(!isNaN(o.duration))
    assert(!isNaN(o.rate))
    assert(!isNaN(o.volume))
    assert(o.matrix instanceof Uint8Array)
    assert(!isNaN(o.next_track_ID))

    this.create_time = isNaN(o.create_time) ? 0 : parseInt(o.create_time, 10)
    this.modification_time = isNaN(o.modification_time) ? 0 : parseInt(o.modification_time, 10)
    this.timescale = parseInt(o.timescale, 10)
    this.duration = parseInt(o.duration, 10)
    this.rate = parseFloat(o.rate)
    this.volume = parseFloat(o.volume)
    this.matrix = new Uint8Array(o.matrix.byteLength)
    this.matrix.set(o.matrix)
    this.next_track_ID = parseInt(o.next_track_ID, 10)
  }
  getSize() {
    return super.getSize() +
      4 +   // create_time
      4 +   // modification_time
      4 +   // time_scale
      4 +   // duration
      4 +   // rate
      2 +   // volume
      2 +   // reserved bit(16) 0
      8 +   // reserved uint(32)[2] 0
      36 +  // matrix
      24 +  // pre defined bit(32)[6] 0
      4     // next_track_ID
  }
  writeData(stream) {
    super.writeData(stream)
    stream.writeUint32(this.create_time)
    stream.writeUint32(this.modification_time)
    stream.writeUint32(this.timescale)
    stream.writeUint32(this.duration)
    stream.writeUint16(1)
    stream.writeUint16(0)
    stream.writeUint8(1)
    stream.writeUint8(0)
    stream.writeUint8Array(new Uint8Array([0x00, 0x00]))
    stream.writeUint8Array(new Uint8Array([
      0x00, 0x00, 0x00, 0x00, 
      0x00, 0x00, 0x00, 0x00
    ]))
    stream.writeUint8Array(this.matrix)
    stream.writeUint8Array(new Uint8Array([
      0x00, 0x00, 0x00, 0x00, 
      0x00, 0x00, 0x00, 0x00, 
      0x00, 0x00, 0x00, 0x00, 
      0x00, 0x00, 0x00, 0x00, 
      0x00, 0x00, 0x00, 0x00, 
      0x00, 0x00, 0x00, 0x00 
    ]))
    stream.writeUint32(this.next_track_ID)
  }
}

MvhdBox.fromStream = stream => {
  var box = Box.fromStream(stream)
  return MvhdBox.dataFromStream(box.type, box.size, stream)
}

MvhdBox.dataFromStream = (type, size, stream) => {
  var lastPosition = stream.getPosition() + size - 8
  var fullBox = FullBox.dataFromStream(type, size, stream)
  var { version, flags } = fullBox
  var create_time = stream.readUint32()
  var modification_time = stream.readUint32()
  var timescale = stream.readUint32()
  var duration = stream.readUint32()
  var rate = 1.0
  stream.skip(4)
  var volume = 1.0
  stream.skip(2)
  stream.skip(2)
  stream.skip(8)
  var matrix = stream.readUint8Array(36)
  stream.skip(24)
  var next_track_ID = stream.readUint32()

  assert(lastPosition == stream.getPosition())

  return new MvhdBox({ type, version, flags, create_time, modification_time, timescale, duration,
    rate, volume, matrix, next_track_ID })
}

export default MvhdBox 
