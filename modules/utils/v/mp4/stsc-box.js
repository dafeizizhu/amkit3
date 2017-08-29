import assert from 'assert'

import Box from './box'
import FullBox from './full-box'

class StscBox extends FullBox {
  constructor(o) {
    super(o)

    assert(o.entries instanceof Array)
    o.entries.forEach(entry => {
      assert(entry)
      assert(!isNaN(entry.first_chunk))
      assert(!isNaN(entry.samples_per_chunk))
      assert(!isNaN(entry.sample_description_index))
    })

    this.entries = o.entries.map(entry => {
      var { first_chunk, samples_per_chunk, sample_description_index } = entry
      return {
        first_chunk: parseInt(first_chunk, 10),
        samples_per_chunk: parseInt(samples_per_chunk, 10),
        sample_description_index: parseInt(sample_description_index, 10)
      }
    })
  }
  getSize() {
    return super.getSize() +
      4 +     // entry_count                uint(32)
      this.entries.length * (
        4 +   // first_chunk                uint(32)
        4 +   // samples_per_chunk          uint(32)
        4     // sample_description_index   uint(32)
      )
  }
  writeData(stream) {
    super.writeData(stream)
    stream.writeUint32(this.entries.length)
    this.entries.forEach(entry => {
      var { first_chunk, samples_per_chunk, sample_description_index } = entry
      stream.writeUint32(first_chunk)
      stream.writeUint32(samples_per_chunk)
      stream.writeUint32(sample_description_index)
    })
  }
}

StscBox.fromStream = stream => {
  var box = Box.fromStream(stream)
  return StscBox.dataFromStream(box.type, box.size, stream)
}

StscBox.dataFromStream = (type, size, stream) => {
  var lastPosition = stream.getPosition() + size - 8
  var { version, flags } = FullBox.dataFromStream(type, size, stream)
  var entry_count = stream.readUint32()
  var entries = []
  for (var i = 0; i < entry_count; i++) {
    entries.push({
      first_chunk: stream.readUint32(),
      samples_per_chunk: stream.readUint32(),
      sample_description_index: stream.readUint32()
    })
  }
  assert(lastPosition == stream.getPosition())
  return new StscBox({ type, version, flags, entries })
}

export default StscBox
