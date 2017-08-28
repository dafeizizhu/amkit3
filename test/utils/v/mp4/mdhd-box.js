import { assert } from 'chai'

import MdhdBox from 'amkit3-modules/utils/v/mp4/mdhd-box'
import DataStream from 'amkit3-modules/utils/data-stream'

describe('utils/v/mp4/mdhd-box', () => {
  var type = 'mdhd'
  var version = 0
  var flags = new Uint8Array([0x00, 0x00, 0x00])
  var create_time = 0
  var modification_time = 0
  var timescale = 12288
  var duration = 413696
  var language = new Uint8Array([0x55, 0xc4])
  var data = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x30, 0x00,
    0x00, 0x06, 0x50, 0x00, 0x55, 0xc4, 0x00, 0x00
  ])
  var boxData = new Uint8Array(data.byteLength + 8)
  boxData.set(new Uint8Array([0x00, 0x00, 0x00, 0x20, 0x6d, 0x64, 0x68, 0x64]))
  boxData.set(data, 8)
  var o = { type, version, flags, create_time, modification_time, timescale, duration, language }

  it(':constructor', () => {
    assert.throws(() => new MdhdBox({ type }))
    assert.throws(() => new MdhdBox({ type, timescale: 'str' }))
    assert.throws(() => new MdhdBox({ type, timescale, duration: 'str' }))
    assert.doesNotThrow(() => {
      var box = new MdhdBox(o)
      assert.equal(box.create_time, create_time)
      assert.equal(box.modification_time, modification_time)
      assert.equal(box.timescale, timescale)
      assert.equal(box.duration, duration)
      assert.deepEqual(box.language, language)
    })
  })
  it('getSize', () => {
    var box = new MdhdBox(o)
    assert.equal(box.getSize(), boxData.byteLength)
  })
  it('writeData', () => {
    var box = new MdhdBox(o)
    var dataStream = new DataStream()
    box.writeData(dataStream)
    assert.equal(dataStream.getByteLength(), data.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(data.byteLength), data)
  })
  it('write', () => {
    var box = new MdhdBox(o)
    var dataStream = new DataStream()
    box.write(dataStream)
    assert.equal(dataStream.getByteLength(), boxData.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(boxData.byteLength), boxData)
  })
  it(':fromStream', () => {
    var box = MdhdBox.fromStream(new DataStream(boxData.buffer))
    assert.equal(box.type, type)
    assert.equal(box.version, version)
    assert.deepEqual(box.flags, flags)
    assert.equal(box.create_time, create_time)
    assert.equal(box.modification_time, modification_time)
    assert.equal(box.timescale, timescale)
    assert.equal(box.duration, duration)
    assert.deepEqual(box.language, language)
  })
  it(':dataFromStream', () => {
    var box = MdhdBox.dataFromStream(type, boxData.byteLength, new DataStream(data.buffer))
    assert.equal(box.type, type)
    assert.equal(box.version, version)
    assert.deepEqual(box.flags, flags)
    assert.equal(box.create_time, create_time)
    assert.equal(box.modification_time, modification_time)
    assert.equal(box.timescale, timescale)
    assert.equal(box.duration, duration)
    assert.deepEqual(box.language, language)
  })
})
