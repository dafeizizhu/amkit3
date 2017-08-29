import assert from 'assert'

import Box from './box'
import FullBox from './full-box'

class StszBox extends FullBox {
  constructor(o) {
    super(o)

    assert(!isNaN(o.sample_size))
    assert(o.entries instanceof Array)
    if (o.sample_size) {
      assert(o.entries.length == 0)
    } else {
      assert(o.entries.length > 0)
    }
    o.entries.forEach(entry => {
      assert(entry)
      assert(!isNaN(entry.sample_size))
    })

    this.sample_size = parseInt(o.sample_size, 10)
    this.entries = o.entries.map(entry => {
      return { sample_size: parseInt(entry.sample_size, 10) }
    })
  }
  getSize() {
    return super.getSize() +
      4 +     // sample_size      uint(32)
      4 +     // entry_count      uint(32)
      (this.sample_size ? 0 : this.entries.length * (
        4     // sample_size      uint(32)
      ))
  }
  writeData(stream) {
    super.writeData(stream)
    stream.writeUint32(this.sample_size)
    stream.writeUint32(this.entries.length)
    this.entries.forEach(entry => {
      stream.writeUint32(entry.sample_size)
    })
  }
}

StszBox.fromStream = stream => {
  var box = Box.fromStream(stream)
  return StszBox.dataFromStream(box.type, box.size, stream)
}

StszBox.dataFromStream = (type, size, stream) => {
  var lastPosition = stream.getPosition() + size - 8
  var { version, flags } = FullBox.dataFromStream(type, size, stream)
  var sample_size = stream.readUint32()
  var entry_count = stream.readUint32()
  var entries = []
  if (!sample_size) {
    for (var i = 0; i < entry_count; i++) {
      entries.push({ sample_size: stream.readUint32() })
    }
  }
  assert(lastPosition == stream.getPosition())
  return new StszBox({ type, version, flags, sample_size, entries })
}

export default StszBox
