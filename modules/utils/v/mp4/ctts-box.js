import assert from 'assert'

import Box from './box'
import FullBox from './full-box'

class CttsBox extends FullBox {
  constructor(o) {
    super(o)

    assert(o.entries instanceof Array)
    o.entries.forEach(entry => {
      assert(entry)
      assert(!isNaN(entry.sample_count))
      assert(!isNaN(entry.sample_offset))
    })

    this.entries = o.entries.map(entry => {
      var { sample_count, sample_offset } = entry
      return {
        sample_count: parseInt(sample_count, 10),
        sample_offset: parseInt(sample_offset, 10)
      }
    })
  }
  getSize() {
    return super.getSize() + 
      4 +       // entry_count      uint(32)
      this.entries.length * (
        4 +     // sample_count     uint(32)
        4       // sample_offset    uint(32)
      )
  }
  writeData(stream) {
    super.writeData(stream)
    stream.writeUint32(this.entries.length)
    this.entries.forEach(entry => {
      var { sample_count, sample_offset } = entry
      stream.writeUint32(sample_count)
      stream.writeUint32(sample_offset)
    })
  }
}

CttsBox.fromStream = stream => {
  var box = Box.fromStream(stream)
  return new CttsBox.dataFromStream(box.type, box.size, stream)
}

CttsBox.dataFromStream = (type, size, stream) => {
  var lastPosition = stream.getPosition() + size - 8
  var { version, flags } = FullBox.dataFromStream(type, size, stream)
  var entry_count = stream.readUint32()
  var entries = []
  for (var i = 0; i < entry_count; i++) {
    entries.push({
      sample_count: stream.readUint32(),
      sample_offset: stream.readUint32()
    })
  }
  assert(lastPosition == stream.getPosition())
  return new CttsBox({ type, version, flags, entries })
}

export default CttsBox
