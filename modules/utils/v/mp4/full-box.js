import assert from 'assert'

import Box from './box'

class FullBox extends Box {
  constructor(o) {
    super(o)

    assert(!isNaN(o.version))
    assert(o.version == 0)
    assert(o.flags instanceof Uint8Array)
    assert(o.flags.byteLength == 3)

    this.version = o.version
    this.flags = new Uint8Array(3)
    this.flags.set(o.flags)
  }
  getSize() {
    return 12
  }
  writeData(stream) {
    stream.writeUint8(this.version)
    stream.writeUint8Array(this.flags)
  }
}

FullBox.fromStream = stream => {
  var box = Box.fromStream(stream)
  return FullBox.dataFromStream(box.type, box.size, stream)
}

FullBox.dataFromStream = (type, size, stream) => {
  var version = stream.readUint8()
  var flags = stream.readUint8Array(3)
  return new FullBox({ type, version, flags })
}

export default FullBox
