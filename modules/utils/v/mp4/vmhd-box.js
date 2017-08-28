import assert from 'assert'

import Box from './box'
import FullBox from './full-box'

class VmhdBox extends FullBox {
  constructor(o) {
    super(o)

    assert(!isNaN(o.graphicsmode))
    assert(o.opcolor instanceof Array)
    assert(o.opcolor.length == 3)
    o.opcolor.forEach(c => assert(!isNaN(c)))

    this.graphicsmode = o.graphicsmode
    this.opcolor = o.opcolor
  }
  getSize() {
    return super.getSize() +
      2 +   // graphicsmode     uint(16)
      6     // opcolor          uint(16)[3]
  }
  writeData(stream) {
    super.writeData(stream)
    stream.writeUint16(this.graphicsmode)
    this.opcolor.forEach(c => stream.writeUint16(c))
  }
}

VmhdBox.fromStream = stream => {
  var box = Box.fromStream(stream)
  return VmhdBox.dataFromStream(box.type, box.size, stream)
}

VmhdBox.dataFromStream = (type, size, stream) => {
  var lastPosition = stream.getPosition() + size - 8
  var fullBox = FullBox.dataFromStream(type, size, stream)
  var { version, flags } = fullBox
  var graphicsmode = stream.readUint16()
  var opcolor = []
  for (var i = 0; i < 3; i++) opcolor.push(stream.readUint16())

  assert(lastPosition, stream.getPosition())

  return new VmhdBox({ type, version, flags, graphicsmode, opcolor })
}

export default VmhdBox
