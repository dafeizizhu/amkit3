import { assert } from 'chai'
import { hex } from 'amkit3-modules/utils/dump'

import MvhdBox from 'amkit3-modules/utils/v/mp4/mvhd-box'
import DataStream from 'amkit3-modules/utils/data-stream'

describe('utils/v/mp4/mvhd-box', () => {
  var type = 'mvhd'
  var version = 0
  var flags = new Uint8Array([0x00, 0x00, 0x00])
  var create_time = 0
  var modification_time = 0
  var timescale = 1000 
  var duration = 33667
  var rate = 1.0
  var volume = 1.0
  var matrix = new Uint8Array([
    0x00, 0x01, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x40, 0x00, 0x00, 0x00
  ])
  var next_track_ID = 3
  var o = { type, version, flags, create_time, modification_time, timescale, duration,
    rate, volume, matrix, next_track_ID }
  var data = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0xe8,
    0x00, 0x00, 0x83, 0x83, 0x00, 0x01, 0x00, 0x00,
    0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x40, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x03
  ])
  var boxData = new Uint8Array(108)
  boxData.set(new Uint8Array([0x00, 0x00, 0x00, 0x6c, 0x6d, 0x76, 0x68, 0x64]))
  boxData.set(data, 8)

  it(':constructor', () => {
    assert.throws(() => new MvhdBox({ type }))
    assert.throws(() => new MvhdBox({ type, timescale: 'dafasfa' }))
    assert.throws(() => new MvhdBox({ type, timescale, duration: 'dasfasfa' }))
    assert.doesNotThrow(() => {
      var box = new MvhdBox(o)
      assert.equal(box.create_time, create_time)
      assert.equal(box.modification_time, modification_time)
      assert.equal(box.timescale, timescale)
      assert.equal(box.duration, duration)
      assert.equal(box.rate, rate)
      assert.equal(box.volume, volume)
      assert.deepEqual(box.matrix, matrix)
      assert.equal(box.next_track_ID, next_track_ID)
    })
  })
  it('getSize', () => {
    var box = new MvhdBox(o)
    assert.equal(box.getSize(), 108)
  })
  it('writeData', () => {
    var box = new MvhdBox(o)
    var dataStream = new DataStream()
    box.writeData(dataStream)
    assert.equal(dataStream.getByteLength(), data.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(data.byteLength), data)
  })
  it('write', () => {
    var box = new MvhdBox(o)
    var dataStream = new DataStream()
    box.write(dataStream)
    assert.equal(dataStream.getByteLength(), boxData.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(boxData.byteLength), boxData)
  })
  it(':fromStream', () => {
    var box = MvhdBox.fromStream(new DataStream(boxData.buffer))
    assert.equal(box.type, type)
    assert.equal(box.version, version)
    assert.deepEqual(box.flags, flags)
    assert.equal(box.create_time, create_time)
    assert.equal(box.modification_time, modification_time)
    assert.equal(box.timescale, timescale)
    assert.equal(box.duration, duration)
    assert.equal(box.rate, rate)
    assert.equal(box.volume, volume)
    assert.deepEqual(box.matrix, matrix)
    assert.equal(box.next_track_ID, next_track_ID)
  })
  it(':dataFromStream', () => {
    var box = MvhdBox.dataFromStream(type, boxData.byteLength, new DataStream(data.buffer))
    assert.equal(box.type, type)
    assert.equal(box.version, version)
    assert.deepEqual(box.flags, flags)
    assert.equal(box.create_time, create_time)
    assert.equal(box.modification_time, modification_time)
    assert.equal(box.timescale, timescale)
    assert.equal(box.duration, duration)
    assert.equal(box.rate, rate)
    assert.equal(box.volume, volume)
    assert.deepEqual(box.matrix, matrix)
    assert.equal(box.next_track_ID, next_track_ID)
  })
})
