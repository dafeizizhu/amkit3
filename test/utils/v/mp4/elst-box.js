import { assert } from 'chai'

import ElstBox from 'amkit3-modules/utils/v/mp4/elst-box'
import DataStream from 'amkit3-modules/utils/data-stream'

describe('utils/v/mp4/elst-box', () => {
  var type = 'elst'
  var version = 0
  var flags = new Uint8Array([0x00, 0x00, 0x00])
  var entries = [{
    segment_duration: 5,
    media_time: -1,
    media_rate_integer: 1,
    media_rate_fraction: 0
  }, {
    segment_duration: 33667,
    media_time: 1024,
    media_rate_integer: 1,
    media_rate_fraction: 0
  }]
  var data = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02,
    0x00, 0x00, 0x00, 0x05, 0xff, 0xff, 0xff, 0xff,
    0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x83, 0x83,
    0x00, 0x00, 0x04, 0x00, 0x00, 0x01, 0x00, 0x00
  ])
  var boxData = new Uint8Array(data.byteLength + 8)
  boxData.set(new Uint8Array([0x00, 0x00, 0x00, 0x28, 0x65, 0x6c, 0x73, 0x74]))
  boxData.set(data, 8)
  var o = { type, version, flags, entries }

  it(':constructor', () => {
    assert.throw(() => new ElstBox({ type }))
    assert.throw(() => new ElstBox({ type, entries: 'str' }))
    assert.throw(() => new ElstBox({ type, entries: [{}] }))
    assert.throw(() => new ElstBox({ type, entries: [{
      segment_duration: 'str'
    }]}))
    assert.throw(() => new ElstBox({ type, entries: [{
      segment_duration: 5,
      media_time: 'str'
    }]}))
    assert.throw(() => new ElstBox({ type, entries: [{
      segment_duration: 5,
      media_time: -1,
      media_rate_integer: 1
    }]}))
    assert.throw(() => new ElstBox({ type, entries: [{
      segment_duration: 5,
      media_time: -1,
      media_rate_integer: 1,
      media_rate_fraction: 'str'
    }]}))
    assert.doesNotThrow(() => {
      var box = new ElstBox(o)
      assert.deepEqual(box.entries, entries)
    })
  })
  it('getSize', () => {
    var box = new ElstBox(o)
    assert.equal(box.getSize(), boxData.byteLength)
  })
  it('writeData', () => {
    var box = new ElstBox(o)
    var dataStream = new DataStream()
    box.writeData(dataStream)
    assert.equal(dataStream.getByteLength(), data.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(data.byteLength), data)
  })
  it('write', () => {
    var box = new ElstBox(o)
    var dataStream = new DataStream()
    box.write(dataStream)
    assert.equal(dataStream.getByteLength(), boxData.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(boxData.byteLength), boxData)
  })
  it(':fromStream', () => {
    var box = ElstBox.fromStream(new DataStream(boxData.buffer))
    assert.equal(box.type, type)
    assert.equal(box.version, version)
    assert.deepEqual(box.flags, box.flags)
    assert.deepEqual(box.entries, entries)
  })
  it(':dataFromStream', () => {
    var box = ElstBox.dataFromStream(type, boxData.byteLength, new DataStream(data.buffer))
    assert.equal(box.type, type)
    assert.equal(box.version, version)
    assert.deepEqual(box.flags, box.flags)
    assert.deepEqual(box.entries, entries)
  })
})
