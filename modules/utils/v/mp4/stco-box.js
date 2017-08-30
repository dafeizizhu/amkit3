import assert from 'assert'

import Box from './box'
import FullBox from './full-box'

class StcoBox extends FullBox {
  constructor(o) {
    super(o)

    assert(o.entries instanceof Array)
    o.entries.forEach(entry => {
      assert(entry)
      assert(!isNaN(entry.chunk_offset))
    })

    this.entries = o.entries.map(entry => {
      return { chunk_offset: parseInt(entry.chunk_offset, 10) }
    })
  }
  getSize() {
    return super.getSize() +
      4 +     // entry_count      uint(32)
      this.entries.length * (
        4     // chunk_offset     uint(32)
      )
  }
  writeData(stream) {
    super.writeData(stream)
    stream.writeUint32(this.entries.length)
    this.entries.forEach(entry => {
      stream.writeUint32(entry.chunk_offset)
    })
  }
}

StcoBox.fromStream = stream => {
  var box = Box.fromStream(stream)
  return StcoBox.dataFromStream(box.type, box.size, stream)
}

StcoBox.dataFromStream = (type, size, stream) => {
  var lastPosition = stream.getPosition() + size - 8
  var { version, flags } = FullBox.dataFromStream(type, size, stream)
  var entry_count = stream.readUint32()
  var entries = []
  for (var i = 0; i < entry_count; i++) {
    entries.push({ chunk_offset: stream.readUint32() })
  }
  assert(lastPosition == stream.getPosition())
  return new StcoBox({ type, version, flags, entries })
}

export default StcoBox
