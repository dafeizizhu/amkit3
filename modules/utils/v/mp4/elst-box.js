import assert from 'assert'

import Box from './box'
import FullBox from './full-box'

class ElstBox extends FullBox {
  constructor(o) {
    super(o)

    assert(this.version == 0)
    assert(o.entries instanceof Array)
    o.entries.forEach(entry => {
      assert(!isNaN(entry.segment_duration))
      assert(!isNaN(entry.media_time))
      assert(!isNaN(entry.media_rate_integer))
      assert(!isNaN(entry.media_rate_fraction))
    })

    this.entries = o.entries
  }
  getSize() {
    return super.getSize() +
      4 +   // entry_count            uint(32)
      (
      4 +   // segment_duration       uint(32)
      4 +   // media_time             int(32)
      2 +   // media_rate_integer     int(16)
      2     // media_rate_fraction    int(16)
      ) * this.entries.length
  }
  writeData(stream) {
    super.writeData(stream)
    stream.writeUint32(this.entries.length)
    this.entries.forEach(entry => {
      stream.writeUint32(entry.segment_duration)
      stream.writeInt32(entry.media_time)
      stream.writeInt16(entry.media_rate_integer)
      stream.writeInt16(entry.media_rate_fraction)
    })
  }
}

ElstBox.fromStream = stream => {
  var box = Box.fromStream(stream)
  return ElstBox.dataFromStream(box.type, box.size, stream)
}

ElstBox.dataFromStream = (type, size, stream) => {
  var lastPosition = stream.getPosition()
  var fullBox = FullBox.dataFromStream(type, size, stream)
  var { version, flags } = fullBox
  var entry_count = stream.readUint32()
  var entries = []
  for (var i = 0; i < entry_count; i++) {
    var segment_duration = stream.readUint32()
    var media_time = stream.readInt32()
    var media_rate_integer = stream.readInt16()
    var media_rate_fraction = stream.readInt16()
    entries.push({ segment_duration, media_time, media_rate_integer, media_rate_fraction })
  }
  return new ElstBox({ type, version, flags, entries })
}

export default ElstBox
