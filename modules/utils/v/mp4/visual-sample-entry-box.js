import assert from 'assert'

import Box from './box'
import Boxes from './boxes'
import SampleEntryBox from './sample-entry-box'

class VisualSampleEntryBox extends SampleEntryBox {
  constructor(o) {
    super(o)

    assert(!isNaN(o.width))
    assert(!isNaN(o.height))
    assert(!isNaN(o.horizresolution))
    assert(!isNaN(o.vertresolution))
    assert(!isNaN(o.frame_count))
    assert(!isNaN(o.depth))
    assert(o.boxes instanceof Array)
    o.boxes.forEach(box => assert(box instanceof Box))

    this.width = parseInt(o.width, 10)
    this.height = parseInt(o.height, 10)
    this.horizresolution = parseInt(o.horizresolution, 10)
    this.vertresolution = parseInt(o.vertresolution, 10)
    this.frame_count = parseInt(o.frame_count, 10)
    this.compressorname = (typeof compressorname == 'string' && compressorname.length == 32) ?
      o.compressorname : '\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000'
    this.depth = parseInt(o.depth, 10)
    this.boxes = o.boxes
  }
  getSize() {
    return super.getSize() + 
      2 +   // pre_defined          uint(16)      0
      2 +   // reserved             uint(16)      0
      12 +  // pre_defined          uint(32)[3]   0
      2 +   // width                uint(16)
      2 +   // height               uint(16)
      4 +   // horizresolution      uint(32)
      4 +   // vertresolution       uint(32)
      4 +   // reserved             uint(32)      0
      2 +   // frame_count          uint(16)
      32 +  // compressorname       str(32)
      2 +   // depth                uint(16)
      2 +   // pre_defined          int(16)       -1
      this.boxes.reduce((p, c) => p + c.getSize(), 0)
  }
  writeData(stream) {
    super.writeData(stream)
    stream.writeUint16(0)
    stream.writeUint16(0)
    stream.writeUint32(0)
    stream.writeUint32(0)
    stream.writeUint32(0)
    stream.writeUint16(this.width)
    stream.writeUint16(this.height)
    stream.writeUint32(this.horizresolution)
    stream.writeUint32(this.vertresolution)
    stream.writeUint32(0)
    stream.writeUint16(this.frame_count)
    stream.writeString(this.compressorname)
    stream.writeUint16(this.depth)
    stream.writeInt16(-1)
    this.boxes.forEach(box => box.write(stream))
  }
}

VisualSampleEntryBox.fromStream = stream => {
  var box = Box.fromStream(stream)
  return VisualSampleEntryBox.dataFromStream(box.type, box.size, stream)
}

VisualSampleEntryBox.dataFromStream = (type, size, stream) => {
  var lastPosition = stream.getPosition() + size - 8
  var data_reference_index = SampleEntryBox.dataFromStream(type, size, stream).data_reference_index
  stream.skip(2)
  stream.skip(2)
  stream.skip(4)
  stream.skip(4)
  stream.skip(4)
  var width = stream.readUint16()
  var height = stream.readUint16()
  var horizresolution = stream.readUint32()
  var vertresolution = stream.readUint32()
  stream.skip(4)
  var frame_count = stream.readUint16()
  var compressorname = stream.readString(32)
  var depth = stream.readUint16()
  stream.skip(2)
  var boxes = []
  while (stream.getPosition() < lastPosition) {
    var box = Box.fromStream(stream)
    if (Boxes[box.type]) {
      boxes.push(Boxes[box.type].dataFromStream(box.type, box.size, stream))
    } else {
      console.warn('box', box.type, 'parsed to data box')
      boxes.push(Boxes.data.dataFromStream(box.type, box.size, stream))
    }
  }
  
  assert(lastPosition == stream.getPosition())

  return new VisualSampleEntryBox({ type, data_reference_index, width, height, horizresolution, vertresolution, frame_count, compressorname, depth, boxes })
}

export default VisualSampleEntryBox
