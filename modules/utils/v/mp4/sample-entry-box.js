import assert from 'assert'

import Box from './box'

class SampleEntryBox extends Box {
  constructor(o) {
    super(o)

    assert(!isNaN(o.data_reference_index))

    this.data_reference_index = parseInt(o.data_reference_index, 10)
  }
  getSize() {
    return 8 +
      6 +   // reservered             int(8)[6]   0
      2     // data_reference_index   uint(16)
  }
  writeData(stream) {
    stream.writeUint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
    stream.writeUint16(this.data_reference_index)
  }
}

SampleEntryBox.fromStream = stream => {
  var box = Box.fromStream(stream)
  return SampleEntryBox.dataFromStream(box.type, box.size, stream)
}

SampleEntryBox.dataFromStream = (type, size, stream) => {
  var lastPosition = stream.getPosition() + size - 8
  stream.skip(6)
  var data_reference_index = stream.readUint16()

  return new SampleEntryBox({ type, data_reference_index })
}

export default SampleEntryBox
