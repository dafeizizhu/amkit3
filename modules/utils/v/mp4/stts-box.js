import assert from 'assert'

import Box from './box'
import FullBox from './full-box'

class SttsBox extends FullBox {
  constructor(o) {
    super(o)

    assert(o.entries instanceof Array)
    o.entries.forEach(entry => {
      assert(entry)
      assert(!isNaN(entry.sample_count))
      assert(!isNaN(entry.sample_delta))
    })

    this.entries = o.entries.map(entry => {
      return {
        sample_count: parseInt(entry.sample_count, 10),
        sample_delta: parseInt(entry.sample_delta, 10)
      }
    })
  }
  getSize() {
    return super.getSize() +
      4 +     // entry_count    uint(32)
      this.entries.length * (
        4 +   // sample_count   uint(32)
        4     // sample_delta   uint(32)
      )
  }
  writeData(stream) {
    super.writeData(stream)
    stream.writeUint32(this.entries.length)
    this.entries.forEach(entry => {
      var { sample_count, sample_delta } = entry
      stream.writeUint32(sample_count)
      stream.writeUint32(sample_delta)
    })
  }
}

SttsBox.fromStream = stream => {
  var box = Box.fromStream(stream)
  return SttsBox.dataFromStream(box.type, box.size, stream)
}

SttsBox.dataFromStream = (type, size, stream) => {
  var lastPosition = stream.getPosition() + size - 8
  var { version, flags } = FullBox.dataFromStream(type, size, stream)
  var entry_count = stream.readUint32()
  var entries = []
  for (var i = 0; i < entry_count; i++) {
    var sample_count = stream.readUint32()
    var sample_delta = stream.readUint32()
    entries.push({ sample_count, sample_delta })
  }
  assert(lastPosition == stream.getPosition())
  return new SttsBox({ type, version, flags, entries })
}

export default SttsBox
