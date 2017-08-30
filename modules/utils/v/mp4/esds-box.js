import assert from 'assert'

import Box from './box'
import FullBox from './full-box'

const ES_DescriptorTag = 0x03
const DecoderConfigDescriptorTag = 0x04
const DescriptorSpecificInfoTag = 0x05
const SLConfigDescriptorTag = 0x06

var sizeOfDescriptor = d => {
  var headerSize = 
    1 +       // tag            uint(8)
    3 +       // placeholder    uint(8)[3]
    1         // data_size      uint(8)
  switch (d.tag) {
    case ES_DescriptorTag:
      assert(!(d.flags & 0x80))
      assert(!(d.flags & 0x40))
      assert(!(d.flags & 0x20))
      return headerSize +
        2 +   // ES_ID          uint(16)
        1 +   // flags          uint(8)
        d.descriptors.reduce((p, c) => p + sizeOfDescriptor(c), 0)
    case DecoderConfigDescriptorTag:
      return headerSize +
        1 +   // oti            uint(8)
        1 +   // stream_type    uint(8)
        3 +   // buffer_size    uint(24)
        4 +   // max_bitrate    uint(32)
        4 +   // avg_bitrate    uint(32)
        d.descriptors.reduce((p, c) => p + sizeOfDescriptor(c), 0)
    case DescriptorSpecificInfoTag:
    case SLConfigDescriptorTag:
      return headerSize +
        d.data.byteLength
  }
}

var writeDescriptor = (d, stream) => {
  stream.writeUint8(d.tag)
  stream.writeUint8Array(new Uint8Array([0x80, 0x80,0x80]))
  stream.writeUint8(sizeOfDescriptor(d) - 5)
  switch (d.tag) {
    case ES_DescriptorTag:
      assert(!(d.flags & 0x80))
      assert(!(d.flags & 0x40))
      assert(!(d.flags & 0x20))
      stream.writeUint16(d.ES_ID)
      stream.writeUint8(d.flags)
      d.descriptors.forEach(descriptor => writeDescriptor(descriptor, stream))
      break
    case DecoderConfigDescriptorTag:
      stream.writeUint8(d.oti)
      stream.writeUint8(d.stream_type)
      stream.writeUint8(Math.floor(d.buffer_size / (0xffffffff + 1)))
      stream.writeUint16(d.buffer_size % 0xffffffff)
      stream.writeUint32(d.max_bitrate)
      stream.writeUint32(d.avg_bitrate)
      d.descriptors.forEach(descriptor => writeDescriptor(descriptor, stream))
      break
    case DescriptorSpecificInfoTag:
    case SLConfigDescriptorTag:
      stream.writeUint8Array(d.data)
      break
  }
}

class EsdsBox extends FullBox {
  constructor(o) {
    super(o)

    assert(o.descriptors instanceof Array)

    this.descriptors = o.descriptors
  }
  getSize() {
    return super.getSize() + this.descriptors.reduce((p, c) => p + sizeOfDescriptor(c), 0)
  }
  writeData(stream) {
    super.writeData(stream)
    this.descriptors.forEach(d => writeDescriptor(d, stream))
  }
}

var descriptorsFromStream = (stream, size) => {
  var descriptors = []
  var lastPosition = stream.getPosition() + size
  while (stream.getPosition() < lastPosition) {
    var tag = stream.readUint8()
    var byteRead = stream.readUint8()
    var s = 0
    while (byteRead & 0x80) {
      s = (byteRead & 0x7f) << 7
      byteRead = stream.readUint8()
    }
    s += byteRead & 0x7f
    var descriptor
    switch (tag) {
      case ES_DescriptorTag:
        var ES_ID = stream.readUint16()
        var flags = stream.readUint8()
        assert(!(flags & 0x80))
        assert(!(flags & 0x40))
        assert(!(flags & 0x20))
        var dependsOn_ES_ID = 0
        var url = null
        var ocr_ES_ID = 0
        var ds = descriptorsFromStream(stream, s - 3)
        descriptor = { tag, ES_ID, dependsOn_ES_ID, url, ocr_ES_ID, flags, descriptors: ds }
        break
      case DecoderConfigDescriptorTag:
        var oti = stream.readUint8()
        var stream_type = stream.readUint8()
        var buffer_size = stream.readUint8() * 0xffffffff + stream.readUint16()
        var max_bitrate = stream.readUint32()
        var avg_bitrate = stream.readUint32()
        var ds = descriptorsFromStream(stream, s - 13)
        descriptor = { tag, oti, stream_type, buffer_size, max_bitrate, avg_bitrate, descriptors: ds }
        break
      case DescriptorSpecificInfoTag:
      case SLConfigDescriptorTag:
        var data = stream.readUint8Array(s)
        descriptor = { tag, data }
        break
    }
    descriptors.push(descriptor)
  }
  assert(lastPosition == stream.getPosition())
  return descriptors
}

EsdsBox.fromStream = stream => {
  var box = Box.fromStream(stream)
  return EsdsBox.dataFromStream(box.type, box.size, stream)
}

EsdsBox.dataFromStream = (type, size, stream) => {
  var lastPosition = stream.getPosition() + size - 8
  var { version, flags } = FullBox.dataFromStream(type, size, stream)
  var descriptors = descriptorsFromStream(stream, lastPosition - stream.getPosition())
  assert(lastPosition == stream.getPosition())
  return new EsdsBox({ type, version, flags, descriptors })
}

export default EsdsBox
