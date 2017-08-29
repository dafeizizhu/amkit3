import assert from 'assert'

import Box from './box'

class AvcCBox extends Box {
  constructor(o) {
    super(o)

    assert(!isNaN(o.configurationVersion))
    assert(!isNaN(o.AVCProfileIndication))
    assert(!isNaN(o.profile_compatibility))
    assert(!isNaN(o.AVCLevelIndication))
    assert(!isNaN(o.lengthSizeMinusOne))
    assert(o.sequenceParameterSet instanceof Array)
    o.sequenceParameterSet.forEach(s => assert(s instanceof Uint8Array))
    assert(o.pictureParameterSet instanceof Array)
    o.pictureParameterSet.forEach(s => assert(s instanceof Uint8Array))

    this.configurationVersion = parseInt(o.configurationVersion, 10)
    this.AVCProfileIndication = parseInt(o.AVCProfileIndication, 10)
    this.profile_compatibility = parseInt(o.profile_compatibility, 10)
    this.AVCLevelIndication = parseInt(o.AVCLevelIndication, 10)
    this.lengthSizeMinusOne = parseInt(o.lengthSizeMinusOne, 10)
    this.sequenceParameterSet = []
    o.sequenceParameterSet.forEach(s => {
      var ts = new Uint8Array(s.byteLength)
      ts.set(s)
      this.sequenceParameterSet.push(ts)
    })
    this.pictureParameterSet = []
    o.pictureParameterSet.forEach(s => {
      var ts = new Uint8Array(s.byteLength)
      ts.set(s)
      this.pictureParameterSet.push(ts)
    })
  }
  getSize() {
    return 8 +
      1 +           // configurationVersion         uint(8)
      1 +           // AVCProfileIndication         uint(8)
      1 +           // profile_compatibility        uint(8)
      1 +           // AVCLevelIndication           uint(8)
      1 +           // lengthSizeMinusOne           uint(8)
      1 +           // numOfSequenceParameterSets   uint(8)
      this.sequenceParameterSet.reduce((p, c) => {
        return 2 +  // sequenceParameterSetLength   uint(16)
          p + c.byteLength
      }, 0) +
      1 +           // numOfPictureParameterSets    uint(8)
      this.pictureParameterSet.reduce((p, c) => {
        return 2 +  // pictureParameterSetLength    uint(16)
          p + c.byteLength
      }, 0)
  }
  writeData(stream) {
    stream.writeUint8(this.configurationVersion)
    stream.writeUint8(this.AVCProfileIndication)
    stream.writeUint8(this.profile_compatibility)
    stream.writeUint8(this.AVCLevelIndication)
    stream.writeUint8(this.lengthSizeMinusOne | 0xfc)
    stream.writeUint8(this.sequenceParameterSet.length | 0xe0)
    this.sequenceParameterSet.forEach(s => {
      stream.writeUint16(s.byteLength)
      stream.writeUint8Array(s)
    })
    stream.writeUint8(this.pictureParameterSet.length)
    this.pictureParameterSet.forEach(s => {
      stream.writeUint16(s.byteLength)
      stream.writeUint8Array(s)
    })
  }
}

AvcCBox.fromStream = stream => {
  var box = Box.fromStream(stream)
  return AvcCBox.dataFromStream(box.type, box.size, stream)
}

AvcCBox.dataFromStream = (type, size, stream) => {
  var lastPosition = stream.getPosition() + size - 8
  var configurationVersion = stream.readUint8()
  var AVCProfileIndication = stream.readUint8()
  var profile_compatibility = stream.readUint8()
  var AVCLevelIndication = stream.readUint8()
  var lengthSizeMinusOne = (0x03 & stream.readUint8())
  var numOfSequenceParameterSet = (0x1f & stream.readUint8())
  var sequenceParameterSet = []
  for (var i = 0; i < numOfSequenceParameterSet; i++) {
    var length = stream.readUint16()
    sequenceParameterSet.push(stream.readUint8Array(length))
  }
  var numOfPictureParameterSet = stream.readUint8()
  var pictureParameterSet = []
  for (var j = 0; j < numOfPictureParameterSet; j++) {
    var length = stream.readUint16()
    pictureParameterSet.push(stream.readUint8Array(length))
  }

  assert(lastPosition == stream.getPosition())

  return new AvcCBox({ type, configurationVersion, AVCProfileIndication, profile_compatibility, AVCLevelIndication, lengthSizeMinusOne, sequenceParameterSet, pictureParameterSet })
}

export default AvcCBox
