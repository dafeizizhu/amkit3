import assert from 'assert'

import Box from './box'
import FullBox from './full-box'

class StssBox extends FullBox {
  constructor(o) {
    super(o)

    assert(o.entries instanceof Array)
    o.entries.forEach(entry => {
      assert(entry)
      assert(!isNaN(entry.sample_number))
    })

    this.entries = o.entries.map(entry => {
      return { sample_number: parseInt(entry.sample_number, 10) }
    })
  }
  getSize() {
    return super.getSize() +
      4 +     // entry_count    uint(32)
      this.entries.length * (
        4     // sample_number  uint(32)
      )
  }
  writeData(stream) {
    super.writeData(stream)
    stream.writeUint32(this.entries.length)
    this.entries.forEach(entry => {
      stream.writeUint32(entry.sample_number)
    })
  }
}

StssBox.fromStream = stream => {
  var box = Box.fromStream(stream)
  return StssBox.dataFromStream(box.type, box.size, stream)
}

StssBox.dataFromStream = (type, size, stream) => {
  var lastPosition = stream.getPosition() + size - 8
  var { version, flags } = FullBox.dataFromStream(type, size, stream)
  var entry_count = stream.readUint32()
  var entries = []
  for (var i = 0; i < entry_count; i++) {
    entries.push({ sample_number: stream.readUint32() })
  }
  assert(lastPosition == stream.getPosition())
  return new StssBox({ type, version, flags, entries })
}

export default StssBox
