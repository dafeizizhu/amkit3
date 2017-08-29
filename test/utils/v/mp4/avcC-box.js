import { assert } from 'chai'

import AvcCBox from 'amkit3-modules/utils/v/mp4/avcC-box'
import DataStream from 'amkit3-modules/utils/data-stream'

describe('utils/v/mp4/avcC-box', () => {
  var type = 'avcC'
  var configurationVersion = 1
  var AVCProfileIndication = 100
  var profile_compatibility = 0
  var AVCLevelIndication = 41
  var lengthSizeMinusOne = 3
  var sequenceParameterSet = [new Uint8Array([103, 100, 0, 41, 172, 217, 128, 80, 5, 186, 106, 2, 2, 2, 128, 0, 0, 3, 0, 128, 0, 0, 24, 7, 140, 24, 205])]
  var pictureParameterSet = [new Uint8Array([104, 233, 120, 103, 44])]
  var data = new Uint8Array([
    0x01, 0x64, 0x00, 0x29, 0xff, 0xe1, 0x00, 0x1b,
    0x67, 0x64, 0x00, 0x29, 0xac, 0xd9, 0x80, 0x50,
    0x05, 0xba, 0x6a, 0x02, 0x02, 0x02, 0x80, 0x00,
    0x00, 0x03, 0x00, 0x80, 0x00, 0x00, 0x18, 0x07,
    0x8c, 0x18, 0xcd, 0x01, 0x00, 0x05, 0x68, 0xe9,
    0x78, 0x67, 0x2c 
  ])
  var boxData = new Uint8Array(data.byteLength + 8)
  boxData.set(new Uint8Array([0x00, 0x00, 0x00, 0x33, 0x61, 0x76, 0x63, 0x43]))
  boxData.set(data, 8)
  var o = { type, configurationVersion, AVCProfileIndication, profile_compatibility, AVCLevelIndication, lengthSizeMinusOne, sequenceParameterSet, pictureParameterSet }

  it(':constructor', () => {
    assert.throws(() => new AvcCBox({ type }))
    assert.throws(() => new AvcCBox({ type, configurationVersion: 'str' }))
    assert.throws(() => new AvcCBox({ type, configurationVersion, AVCProfileIndication: 'str' }))
    assert.throws(() => new AvcCBox({ type, configurationVersion, AVCProfileIndication, profile_compatibility: 'str' }))
    assert.throws(() => new AvcCBox({ type, configurationVersion, AVCProfileIndication, profile_compatibility, AVCLevelIndication: 'str' }))
    assert.throws(() => new AvcCBox({ type, configurationVersion, AVCProfileIndication, profile_compatibility, AVCLevelIndication, lengthSizeMinusOne: 'str' }))
    assert.throws(() => new AvcCBox({ type, configurationVersion, AVCProfileIndication, profile_compatibility, AVCLevelIndication, lengthSizeMinusOne, sequenceParameterSet: 'str' }))
    assert.throws(() => new AvcCBox({ type, configurationVersion, AVCProfileIndication, profile_compatibility, AVCLevelIndication, lengthSizeMinusOne, sequenceParameterSet: [1] }))
    assert.throws(() => new AvcCBox({ type, configurationVersion, AVCProfileIndication, profile_compatibility, AVCLevelIndication, lengthSizeMinusOne, sequenceParameterSet, pictureParameterSet: 'str' }))
    assert.throws(() => new AvcCBox({ type, configurationVersion, AVCProfileIndication, profile_compatibility, AVCLevelIndication, lengthSizeMinusOne, sequenceParameterSet, pictureParameterSet: [1] }))
    assert.doesNotThrow(() => {
      var box = new AvcCBox(o)
      assert.equal(box.configurationVersion, configurationVersion)
      assert.equal(box.AVCProfileIndication, AVCProfileIndication)
      assert.equal(box.profile_compatibility, profile_compatibility)
      assert.equal(box.AVCLevelIndication, AVCLevelIndication)
      assert.equal(box.lengthSizeMinusOne, lengthSizeMinusOne)
      assert.deepEqual(box.sequenceParameterSet, sequenceParameterSet)
      assert.deepEqual(box.pictureParameterSet, pictureParameterSet)
    })
  })
  it('getSize', () => {
    var box = new AvcCBox(o)
    assert.equal(box.getSize(), boxData.byteLength)
  })
  it('writeData', () => {
    var box = new AvcCBox(o)
    var dataStream = new DataStream()
    box.writeData(dataStream)
    assert.equal(dataStream.getByteLength(), data.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(data.byteLength), data)
  })
  it('write', () => {
    var box = new AvcCBox(o)
    var dataStream = new DataStream()
    box.write(dataStream)
    assert.equal(dataStream.getByteLength(), boxData.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(boxData.byteLength), boxData)
  })
  it(':fromStream', () => {
    var box = AvcCBox.fromStream(new DataStream(boxData.buffer))
    assert.equal(box.type, type)
    assert.equal(box.configurationVersion, configurationVersion)
    assert.equal(box.AVCProfileIndication, AVCProfileIndication)
    assert.equal(box.profile_compatibility, profile_compatibility)
    assert.equal(box.AVCLevelIndication, AVCLevelIndication)
    assert.equal(box.lengthSizeMinusOne, lengthSizeMinusOne)
    assert.deepEqual(box.sequenceParameterSet, sequenceParameterSet)
    assert.deepEqual(box.pictureParameterSet, pictureParameterSet)
  })
  it(':dataFromStream', () => {
    var box = AvcCBox.dataFromStream(type, boxData.byteLength, new DataStream(data.buffer))
    assert.equal(box.type, type)
    assert.equal(box.configurationVersion, configurationVersion)
    assert.equal(box.AVCProfileIndication, AVCProfileIndication)
    assert.equal(box.profile_compatibility, profile_compatibility)
    assert.equal(box.AVCLevelIndication, AVCLevelIndication)
    assert.equal(box.lengthSizeMinusOne, lengthSizeMinusOne)
    assert.deepEqual(box.sequenceParameterSet, sequenceParameterSet)
    assert.deepEqual(box.pictureParameterSet, pictureParameterSet)
  })
})
