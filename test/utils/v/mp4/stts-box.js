import { assert } from 'chai'

import SttsBox from 'amkit3-modules/utils/v/mp4/stts-box'
import DataStream from 'amkit3-modules/utils/data-stream'

describe.only('utils/v/mp4/stts-box', () => {
  var type = 'stts'
  var version = 0
  var flags = new Uint8Array([0x00, 0x00, 0x00])
  var entries = [{
    sample_count: 808,
    sample_delta: 512
  }]
  var data = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
    0x00, 0x00, 0x03, 0x28, 0x00, 0x00, 0x02, 0x00
  ])
  var boxData = new Uint8Array(data.byteLength + 8)
  boxData.set(new Uint8Array([0x00, 0x00, 0x00, 0x18, 0x73, 0x74, 0x74, 0x73]))
  boxData.set(data, 8)
  var o = { type, version, flags, entries }

  it(':constructor', () => {
    assert.throws(() => new SttsBox({ type, version, flags }))
    assert.throws(() => new SttsBox({ type, version, flags, entries: 'str' }))
    assert.throws(() => new SttsBox({ type, version, flags, entries: [1, 2, 3] }))
    assert.throws(() => new SttsBox({ type, version, flags, entries: [{
      sample_count: 'str'
    }]}))
    assert.throws(() => new SttsBox({ type, version, flags, entries: [{
      sample_count: 808,
      sample_delta: 'str'
    }]}))
    assert.doesNotThrow(() => {
      var box = new SttsBox(o)
      assert.deepEqual(box.entries, entries)
    })
  })
  it('getSize', () => {
    var box = new SttsBox(o)
    assert.equal(box.getSize(), boxData.byteLength)
  })
  it('writeData', () => {
    var box = new SttsBox(o)
    var dataStream = new DataStream()
    box.writeData(dataStream)
    assert.equal(dataStream.getByteLength(), data.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(data.byteLength), data)
  })
  it('write', () => {
    var box = new SttsBox(o)
    var dataStream = new DataStream()
    box.write(dataStream)
    assert.equal(dataStream.getByteLength(), boxData.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(boxData.byteLength), boxData)
  })
  it(':fromStream', () => {
    var box = SttsBox.fromStream(new DataStream(boxData.buffer))
    assert.equal(box.type, type)
    assert.equal(box.version, version)
    assert.deepEqual(box.flags, flags)
    assert.deepEqual(box.entries, entries)
  })
  it(':dataFromStream', () => {
    var box = SttsBox.dataFromStream(type, boxData.byteLength, new DataStream(data.buffer))
    assert.equal(box.type, type)
    assert.equal(box.version, version)
    assert.deepEqual(box.flags, flags)
    assert.deepEqual(box.entries, entries)
  })
})
