import { assert } from 'chai'

import VisualSampleEntryBox from 'amkit3-modules/utils/v/mp4/visual-sample-entry-box'
import DataBox from 'amkit3-modules/utils/v/mp4/data-box'
import DataStream from 'amkit3-modules/utils/data-stream'

describe('utils/v/mp4/visual-sample-entry-box', () => {
  var type = 'avc1'
  var data_reference_index = 1
  var width = 1280
  var height = 720
  var horizresolution = 4718592
  var vertresolution = 4718592
  var frame_count = 1
  var compressorname = '\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000'
  var depth = 24
  var boxes = [new DataBox({ type: 'test', data: new Uint8Array([
    0x01, 0x64,
    0x00, 0x29, 0xff, 0xe1, 0x00, 0x1b, 0x67, 0x64,
    0x00, 0x29, 0xac, 0xd9, 0x80, 0x50, 0x05, 0xba,
    0x6a, 0x02, 0x02, 0x02, 0x80, 0x00, 0x00, 0x03,
    0x00, 0x80, 0x00, 0x00, 0x18, 0x07, 0x8c, 0x18,
    0xcd, 0x01, 0x00, 0x05, 0x68, 0xe9, 0x78, 0x67,
    0x2c
  ])})]
  var data = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x05, 0x00, 0x02, 0xd0, 0x00, 0x48, 0x00, 0x00,
    0x00, 0x48, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x18, 0xff, 0xff, 0x00, 0x00,
    0x00, 0x33, 0x74, 0x65, 0x73, 0x74, 0x01, 0x64,
    0x00, 0x29, 0xff, 0xe1, 0x00, 0x1b, 0x67, 0x64,
    0x00, 0x29, 0xac, 0xd9, 0x80, 0x50, 0x05, 0xba,
    0x6a, 0x02, 0x02, 0x02, 0x80, 0x00, 0x00, 0x03,
    0x00, 0x80, 0x00, 0x00, 0x18, 0x07, 0x8c, 0x18,
    0xcd, 0x01, 0x00, 0x05, 0x68, 0xe9, 0x78, 0x67,
    0x2c
  ])
  var boxData = new Uint8Array(data.byteLength + 8)
  boxData.set(new Uint8Array([0x00, 0x00, 0x00, 0x89, 0x61, 0x76, 0x63, 0x31]))
  boxData.set(data, 8)
  var o = { type, data_reference_index, width, height, horizresolution, vertresolution, frame_count, compressorname, depth, boxes }

  it(':constructor', () => {
    assert.throws(() => new VisualSampleEntryBox({ type, data_reference_index }))
    assert.throws(() => new VisualSampleEntryBox({ type, data_reference_index, width: 'str' }))
    assert.throws(() => new VisualSampleEntryBox({ type, data_reference_index, width, height: 'str' }))
    assert.throws(() => new VisualSampleEntryBox({ type, data_reference_index, width, height, horizresolution: 'str' }))
    assert.throws(() => new VisualSampleEntryBox({ type, data_reference_index, width, height, horizresolution, vertresolution: 'str' }))
    assert.throws(() => new VisualSampleEntryBox({ type, data_reference_index, width, height, horizresolution, vertresolution, frame_count: 'str' }))
    assert.throws(() => new VisualSampleEntryBox({ type, data_reference_index, width, height, horizresolution, vertresolution, frame_count, compressorname, depth: 'str' }))
    assert.throws(() => new VisualSampleEntryBox({ type, data_reference_index, width, height, horizresolution, vertresolution, frame_count, compressorname, depth, boxes: 'str' }))
    assert.throws(() => new VisualSampleEntryBox({ type, data_reference_index, width, height, horizresolution, vertresolution, frame_count, compressorname, depth, boxes: [1, 2, 3] }))
    assert.doesNotThrow(() => {
      var box = new VisualSampleEntryBox(o)
      assert.equal(box.width, width)
      assert.equal(box.height, height)
      assert.equal(box.horizresolution, horizresolution)
      assert.equal(box.vertresolution, vertresolution)
      assert.equal(box.frame_count, frame_count)
      assert.equal(box.compressorname, compressorname)
      assert.equal(box.depth, depth)
      assert.deepEqual(box.boxes, boxes)
    })
  })
  it('getSize', () => {
    var box = new VisualSampleEntryBox(o)
    assert.equal(box.getSize(), boxData.byteLength)
  })
  it('writeData', () => {
    var box = new VisualSampleEntryBox(o)
    var dataStream = new DataStream()
    box.writeData(dataStream)
    assert.equal(dataStream.getByteLength(), data.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(data.byteLength), data)
  })
  it('write', () => {
    var box = new VisualSampleEntryBox(o)
    var dataStream = new DataStream()
    box.write(dataStream)
    assert.equal(dataStream.getByteLength(), boxData.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(boxData.byteLength), boxData)
  })
  it(':fromStream', () => {
    var box = VisualSampleEntryBox.fromStream(new DataStream(boxData.buffer))
    assert.equal(box.type, type)
    assert.equal(box.width, width)
    assert.equal(box.height, height)
    assert.equal(box.horizresolution, horizresolution)
    assert.equal(box.vertresolution, vertresolution)
    assert.equal(box.frame_count, frame_count)
    assert.equal(box.compressorname, compressorname)
    assert.equal(box.depth, depth)
    assert.deepEqual(box.boxes, boxes)
  })
  it(':dataFromStream', () => {
    var box = VisualSampleEntryBox.dataFromStream(type, boxData.byteLength, new DataStream(data.buffer))
    assert.equal(box.type, type)
    assert.equal(box.width, width)
    assert.equal(box.height, height)
    assert.equal(box.horizresolution, horizresolution)
    assert.equal(box.vertresolution, vertresolution)
    assert.equal(box.frame_count, frame_count)
    assert.equal(box.compressorname, compressorname)
    assert.equal(box.depth, depth)
    assert.deepEqual(box.boxes, boxes)
  })
})
