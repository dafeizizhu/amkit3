import assert from 'assert'

import Box from './box'

class DataBox extends Box {
  constructor(o) {
    super(o)

    assert(o.data instanceof Uint8Array)

    this.data = o.data
  }
  getSize() {
    return 8 + this.data.byteLength
  }
  writeData(stream) {
    stream.writeUint8Array(this.data)
  }
}

DataBox.fromStream = stream => {
  var box = Box.fromStream(stream)
  return DataBox.dataFromStream(box.type, box.size, stream)
}

DataBox.dataFromStream = (type, size, stream) => {
  var data = stream.readUint8Array(size - 8)
  return new DataBox({ type, data })
}

export default DataBox
