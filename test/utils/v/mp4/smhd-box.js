import { assert } from 'chai'

import SmhdBox from 'amkit3-modules/utils/v/mp4/smhd-box'
import DataStream from 'amkit3-modules/utils/data-stream'

describe.only('utils/v/mp4/smhd-box', () => {
  var type = 'smhd'
  var version = 0
  var flags = new Uint8Array([0x00, 0x00, 0x00])
  var balence = 0.0
  var data = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
  ])
  var boxData = new Uint8Array(data.byteLength + 8)
  boxData.set(new Uint8Array([0x00, 0x00, 0x00, 0x10, 0x73, 0x6d, 0x68, 0x64]))
  boxData.set(data, 8)
  var o = { type, version, flags, balence }

  it(':constructor', () => {
    assert.throws(() => new SmhdBox({ type, version, flags }))
    assert.throws(() => new SmhdBox({ type, version, flags, balence: 'str' }))
    assert.doesNotThrow(() => {
      var box = new SmhdBox(o)
      assert.equal(box.balence, balence)
    })
  })
  it('getSize', () => {
    var box = new SmhdBox(o)
    assert.equal(box.getSize(), boxData.byteLength)
  })
  it('writeData', () => {
    var box = new SmhdBox(o)
    var dataStream = new DataStream()
    box.writeData(dataStream)
    assert.equal(dataStream.getByteLength(), data.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(data.byteLength), data)
  })
  it('write', () => {
    var box = new SmhdBox(o)
    var dataStream = new DataStream()
    box.write(dataStream)
    assert.equal(dataStream.getByteLength(), boxData.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(boxData.byteLength), boxData)
  })
  it(':fromStream', () => {
    var box = SmhdBox.fromStream(new DataStream(boxData.buffer))
    assert.equal(box.type, type)
    assert.equal(box.version, version)
    assert.deepEqual(box.flags, flags)
    assert.equal(box.balence, balence)
  })
  it(':dataFromStream', () => {
    var box = SmhdBox.dataFromStream(type, boxData.byteLength, new DataStream(data.buffer))
    assert.equal(box.type, type)
    assert.equal(box.version, version)
    assert.deepEqual(box.flags, flags)
    assert.equal(box.balence, balence)
  })
})
