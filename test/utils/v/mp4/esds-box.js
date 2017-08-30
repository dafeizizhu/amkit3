import { assert } from 'chai'

import EsdsBox from 'amkit3-modules/utils/v/mp4/esds-box'
import DataStream from 'amkit3-modules/utils/data-stream'

describe('utils/v/mp4/esds-box', () => {
  var type = 'esds'
  var version = 0
  var flags = new Uint8Array([0x00, 0x00, 0x00])
  var descriptors = [{
    tag: 3,
    ES_ID: 2,
    flags: 0,
    dependsOn_ES_ID: 0,
    url: null,
    ocr_ES_ID: 0,
    descriptors: [{
      tag: 4,
      oti: 64,
      stream_type: 21,
      buffer_size: 0,
      max_bitrate: 63470,
      avg_bitrate: 63470,
      descriptors: [{
        tag: 5,
        data: new Uint8Array([18, 16])
      }]
    }, {
      tag: 6,
      data: new Uint8Array([2])
    }]
  }]
  var data = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, 0x03, 0x80, 0x80, 0x80,
    0x22, 0x00, 0x02, 0x00, 0x04, 0x80, 0x80, 0x80,
    0x14, 0x40, 0x15, 0x00, 0x00, 0x00, 0x00, 0x00,
    0xf7, 0xee, 0x00, 0x00, 0xf7, 0xee, 0x05, 0x80,
    0x80, 0x80, 0x02, 0x12, 0x10, 0x06, 0x80, 0x80,
    0x80, 0x01, 0x02
  ])
  var boxData = new Uint8Array(data.byteLength + 8)
  boxData.set(new Uint8Array([0x00, 0x00, 0x00, 0x33, 0x65, 0x73, 0x64, 0x73]))
  boxData.set(data, 8)
  var o = { type, version, flags, descriptors }

  it(':constructor', () => {
    assert.throws(() => new EsdsBox({ type, version, flags }))
    assert.throws(() => new EsdsBox({ type, version, flags, descriptors: 'str' }))
    assert.doesNotThrow(() => {
      var box = new EsdsBox(o)
      assert.deepEqual(box.descriptors, descriptors)
    })
  })
  it('getSize', () => {
    var box = new EsdsBox(o)
    assert.equal(box.getSize(), boxData.byteLength)
  })
  it('writeData', () => {
    var box = new EsdsBox(o)
    var dataStream = new DataStream()
    box.writeData(dataStream)
    assert.equal(dataStream.getByteLength(), data.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(data.byteLength), data)
  })
  it('write', () => {
    var box = new EsdsBox(o)
    var dataStream = new DataStream()
    box.write(dataStream)
    assert.equal(dataStream.getByteLength(), boxData.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(boxData.byteLength), boxData)
  })
  it(':fromStream', () => {
    var box = EsdsBox.fromStream(new DataStream(boxData.buffer))
    assert.equal(box.type, type)
    assert.equal(box.version, version)
    assert.deepEqual(box.flags, flags)
    assert.deepEqual(box.descriptors, descriptors)
  })
  it(':dataFromStream', () => {
    var box = EsdsBox.dataFromStream(type, boxData.byteLength, new DataStream(data.buffer))
    assert.equal(box.type, type)
    assert.equal(box.version, version)
    assert.deepEqual(box.flags, flags)
    assert.deepEqual(box.descriptors, descriptors)
  })
})
