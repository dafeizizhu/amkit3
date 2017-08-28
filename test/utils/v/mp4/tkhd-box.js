import { assert } from 'chai'

import TkhdBox from 'amkit3-modules/utils/v/mp4/tkhd-box'
import DataStream from 'amkit3-modules/utils/data-stream'

describe('utils/v/mp4/tkhd-box', () => {
  var type = 'tkhd'
  var version = 0
  var flags = new Uint8Array([0x00, 0x00, 0x03])
  var create_time = 0
  var modification_time = 0
  var track_ID = 1
  var duration = 33667
  var layer = 0
  var alternate_group = 0
  var volume = 0.0
  var matrix = new Uint8Array([ 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0])
  var width = 1280
  var height = 720
  var data = new Uint8Array([
    0x00, 0x00, 0x00, 0x03, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x83, 0x83,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x40, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00,
    0x02, 0xd0, 0x00, 0x00
  ])
  var boxData = new Uint8Array(data.byteLength + 8)
  boxData.set(new Uint8Array([0x00, 0x00, 0x00, 0x5c, 0x74, 0x6b, 0x68, 0x64]))
  boxData.set(data, 8) 
  var o = { type, version, flags, track_ID, duration, layer, alternate_group, volume, matrix, width, height }

  it(':constructor', () => {
    assert.throws(() => new TkhdBox({ type }))
    assert.throws(() => new TkhdBox({ type, track_ID: 'str' }))
    assert.throws(() => new TkhdBox({ type, track_ID, duration: 'str' }))
    assert.throws(() => new TkhdBox({ type, track_ID, duration, layer: 'str' }))
    assert.throws(() => new TkhdBox({ type, track_ID, duration, layer, alternate_group: 'str' }))
    assert.throws(() => new TkhdBox({ type, track_ID, duration, layer, alternate_group, volume: 'str' }))
    assert.throws(() => new TkhdBox({ type, track_ID, duration, layer, alternate_group, volume, matrix: 'str' }))
    assert.throws(() => new TkhdBox({ type, track_ID, duration, layer, alternate_group, volume, matrix, width: 'str' }))
    assert.throws(() => new TkhdBox({ type, track_ID, duration, layer, alternate_group, volume, matrix, width, height: 'str' }))
    assert.throws(() => new TkhdBox({}))
    assert.doesNotThrow(() => {
      var box = new TkhdBox(o)
      assert.equal(box.create_time, create_time)
      assert.equal(box.modification_time, modification_time)
      assert.equal(box.track_ID, track_ID)
      assert.equal(box.duration, duration)
      assert.equal(box.layer, layer)
      assert.equal(box.alternate_group, alternate_group)
      assert.equal(box.volume, volume)
      assert.deepEqual(box.matrix, matrix)
      assert.equal(box.width, width)
      assert.equal(box.height, height)
    })
  })
  it('getSize', () => {
    var box = new TkhdBox(o)
    assert.equal(box.getSize(), boxData.byteLength)
  })
  it('writeData', () => {
    var box = new TkhdBox(o)
    var dataStream = new DataStream()
    box.writeData(dataStream)
    assert.equal(dataStream.getByteLength(), data.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(data.byteLength), data)
  })
  it('write', () => {
    var box = new TkhdBox(o)
    var dataStream = new DataStream()
    box.write(dataStream)
    assert.equal(dataStream.getByteLength(), boxData.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(boxData.byteLength), boxData)
  })
  it(':fromStream', () => {
    var box = TkhdBox.fromStream(new DataStream(boxData.buffer))
    assert.equal(box.type, type)
    assert.equal(box.version, version)
    assert.deepEqual(box.flags, flags)
    assert.equal(box.create_time, create_time)
    assert.equal(box.modification_time, modification_time)
    assert.equal(box.track_ID, track_ID)
    assert.equal(box.duration, duration)
    assert.equal(box.layer, layer)
    assert.equal(box.alternate_group, alternate_group)
    assert.equal(box.volume, volume)
    assert.deepEqual(box.matrix, matrix)
    assert.equal(box.width, width)
    assert.equal(box.height, height)
  })
  it(':dataFromStream', () => {
    var box = TkhdBox.dataFromStream(type, boxData.byteLength, new DataStream(data.buffer))
    assert.equal(box.type, type)
    assert.equal(box.version, version)
    assert.deepEqual(box.flags, flags)
    assert.equal(box.create_time, create_time)
    assert.equal(box.modification_time, modification_time)
    assert.equal(box.track_ID, track_ID)
    assert.equal(box.duration, duration)
    assert.equal(box.layer, layer)
    assert.equal(box.alternate_group, alternate_group)
    assert.equal(box.volume, volume)
    assert.deepEqual(box.matrix, matrix)
    assert.equal(box.width, width)
    assert.equal(box.height, height)
  })
})
