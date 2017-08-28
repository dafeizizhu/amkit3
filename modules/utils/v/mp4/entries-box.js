import assert from 'assert'

import Box from './box'
import Boxes from './boxes'
import FullBox from './full-box'

class DrefBox extends FullBox {
  constructor(o) {
    super(o)

    assert(o.entries instanceof Array)
    o.entries.forEach(entry => assert(entry instanceof Box))

    this.entries = o.entries
  }
  getSize() {
    return super.getSize() +
      4 +   // entry_count    uint(32)
      this.entries.reduce((p, c) => p + c.getSize(), 0)
  }
  writeData(stream) {
    super.writeData(stream)
    stream.writeUint32(this.entries.length)
    this.entries.forEach(entry => entry.write(stream))
  }
}

DrefBox.fromStream = stream => {
  var box = Box.fromStream(stream)
  return DrefBox.dataFromStream(box.type, box.size, stream)
}

DrefBox.dataFromStream = (type, size, stream) => {
  var lastPosition = stream.getPosition() + size - 8
  var fullBox = FullBox.dataFromStream(type, size, stream)
  var { version, flags } = fullBox
  var entry_count = stream.readUint32()
  var entries = []
  for (var i = 0; i < entry_count; i++) {
    var entry = Box.fromStream(stream)
    if (Boxes[entry.type]) {
      entries.push(Boxes[entry.type].dataFromStream(entry.type, entry.size, stream))
    } else {
      console.warn('box', entry.type, 'parsed to data box')
      entries.push(Boxes.data.dataFromStream(entry.type, entry.size, stream))
    }
  }

  assert(lastPosition == stream.getPosition())

  return new DrefBox({ type, version, flags, entries })
}

export default DrefBox
