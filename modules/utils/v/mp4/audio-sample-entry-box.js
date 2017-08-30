import assert from 'assert'

import Box from './box'
import Boxes from './boxes'
import SampleEntryBox from './sample-entry-box'

class AudioSampleEntryBox extends SampleEntryBox {
  constructor(o) {
    super(o)

    assert(!isNaN(o.channelcount))
    assert(!isNaN(o.samplesize))
    assert(!isNaN(o.samplerate))
    assert(o.boxes instanceof Array)
    o.boxes.forEach(box => assert(box instanceof Box))

    this.channelcount = parseInt(o.channelcount, 10)
    this.samplesize = parseInt(o.samplesize, 10)
    this.samplerate = parseInt(o.samplerate, 10)
    this.boxes = o.boxes
  }
  getSize() {
    return super.getSize() +
      8 +     // reserved         uint(32)[2]
      2 +     // channelcount     uint(16)
      2 +     // samplesize       uint(16)
      2 +     // pre_defined      uint(16)        0
      2 +     // reserved         uint(16)        0
      4 +     // samplerate       uint(32)
      this.boxes.reduce((p, c) => p + c.getSize(), 0)
  }
  writeData(stream) {
    super.writeData(stream)
    stream.writeUint32(0)
    stream.writeUint32(0)
    stream.writeUint16(this.channelcount)
    stream.writeUint16(this.samplesize)
    stream.writeUint16(0)
    stream.writeUint16(0)
    stream.writeUint32(this.samplerate)
    this.boxes.forEach(box => box.write(stream))
  }
}

AudioSampleEntryBox.fromStream = stream => {
  var box = Box.fromStream(stream)
  return AudioSampleEntryBox.dataFromStream(box.type, box.size, stream)
}

AudioSampleEntryBox.dataFromStream = (type, size, stream) => {
  var lastPosition = stream.getPosition() + size - 8
  var { data_reference_index } = SampleEntryBox.dataFromStream(type, size, stream)
  stream.skip(8)
  var channelcount = stream.readUint16()
  var samplesize = stream.readUint16()
  stream.skip(2)
  stream.skip(2)
  var samplerate = stream.readUint32()
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

  return new AudioSampleEntryBox({ type, data_reference_index, channelcount, samplesize, samplerate, boxes })
}

export default AudioSampleEntryBox
