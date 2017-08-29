import { assert } from 'chai'

import StscBox from 'amkit3-modules/utils/v/mp4/stsc-box'
import DataStream from 'amkit3-modules/utils/data-stream'

describe.only('utils/v/mp4/stsc-box', () => {
  var type = 'stsc'
  var version = 0
  var flags = new Uint8Array([0x00, 0x00, 0x00])
  var entries = [
    { first_chunk: 1, samples_per_chunk: 2, sample_description_index: 1 },
    { first_chunk: 2, samples_per_chunk: 1, sample_description_index: 1 },
    { first_chunk: 82, samples_per_chunk: 2, sample_description_index: 1 },
    { first_chunk: 83, samples_per_chunk: 1, sample_description_index: 1 },
    { first_chunk: 160, samples_per_chunk: 2, sample_description_index: 1 },
    { first_chunk: 161, samples_per_chunk: 1, sample_description_index: 1 },
    { first_chunk: 240, samples_per_chunk: 2, sample_description_index: 1 },
    { first_chunk: 241, samples_per_chunk: 1, sample_description_index: 1 },
    { first_chunk: 318, samples_per_chunk: 2, sample_description_index: 1 },
    { first_chunk: 319, samples_per_chunk: 1, sample_description_index: 1 },
    { first_chunk: 397, samples_per_chunk: 2, sample_description_index: 1 },
    { first_chunk: 398, samples_per_chunk: 1, sample_description_index: 1 },
    { first_chunk: 559, samples_per_chunk: 2, sample_description_index: 1 },
    { first_chunk: 560, samples_per_chunk: 1, sample_description_index: 1 },
    { first_chunk: 640, samples_per_chunk: 2, sample_description_index: 1 },
    { first_chunk: 641, samples_per_chunk: 1, sample_description_index: 1 }
  ]
  var data = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x02,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x02,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x00, 0x00, 0x00, 0x52, 0x00, 0x00, 0x00, 0x02,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x53,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x00, 0x00, 0x00, 0xa0, 0x00, 0x00, 0x00, 0x02,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0xa1,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x00, 0x00, 0x00, 0xf0, 0x00, 0x00, 0x00, 0x02,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0xf1,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x00, 0x00, 0x01, 0x3e, 0x00, 0x00, 0x00, 0x02,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x01, 0x3f,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x00, 0x00, 0x01, 0x8d, 0x00, 0x00, 0x00, 0x02,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x01, 0x8e,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x00, 0x00, 0x02, 0x2f, 0x00, 0x00, 0x00, 0x02,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x02, 0x30,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x00, 0x00, 0x02, 0x80, 0x00, 0x00, 0x00, 0x02,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x02, 0x81,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01
  ])
  var boxData = new Uint8Array(data.byteLength + 8)
  boxData.set(new Uint8Array([0x00, 0x00, 0x00, 0xd0, 0x73, 0x74, 0x73, 0x63]))
  boxData.set(data, 8)
  var o = { type, version, flags, entries }

  it(':constructor', () => {
    assert.throws(() => new StscBox({ type, version, flags }))
    assert.throws(() => new StscBox({ type, version, flags, entries: 'str' }))
    assert.throws(() => new StscBox({ type, version, flags, entries: [1, 2, 3] }))
    assert.throws(() => new StscBox({ type, version, flags, entries: [{
      first_chunk: 'str'
    }]}))
    assert.throws(() => new StscBox({ type, version, flags, entries: [{
      first_chunk: 1,
      samples_per_chunk: 'str'
    }]}))
    assert.throws(() => new StscBox({ type, version, flags, entries: [{
      first_chunk: 1,
      samples_per_chunk: 1,
      sample_description_index: 'str'
    }]}))
    assert.doesNotThrow(() => {
      var box = new StscBox(o)
      assert.deepEqual(box.entries, entries)
    })
  })
  it('getSize', () => {
    var box = new StscBox(o)
    assert.equal(box.getSize(), boxData.byteLength)
  })
  it('writeData', () => {
    var box = new StscBox(o)
    var dataStream = new DataStream()
    box.writeData(dataStream)
    assert.equal(dataStream.getByteLength(), data.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(data.byteLength), data)
  })
  it('write', () => {
    var box = new StscBox(o)
    var dataStream = new DataStream()
    box.write(dataStream)
    assert.equal(dataStream.getByteLength(), boxData.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(boxData.byteLength), boxData)
  })
  it(':fromStream', () => {
    var box = StscBox.fromStream(new DataStream(boxData.buffer))
    assert.equal(box.type, type)
    assert.equal(box.version, version)
    assert.deepEqual(box.flags, flags)
    assert.deepEqual(box.entries, entries)
  })
  it(':dataFromStream', () => {
    var box = StscBox.dataFromStream(type, boxData.byteLength, new DataStream(data.buffer))
    assert.equal(box.type, type)
    assert.equal(box.version, version)
    assert.deepEqual(box.flags, flags)
    assert.deepEqual(box.entries, entries)
  })
})
