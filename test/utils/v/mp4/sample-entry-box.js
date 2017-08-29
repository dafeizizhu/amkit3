import { assert } from 'chai'

import SampleEntryBox from 'amkit3-modules/utils/v/mp4/sample-entry-box'
import DataStream from 'amkit3-modules/utils/data-stream'

describe('utils/v/mp4/sample-entry-box', () => {
  var type = 'avc1'
  var data_reference_index = 1
  var data = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01
  ])
  var boxData = new Uint8Array(data.byteLength + 8)
  boxData.set(new Uint8Array([0x00, 0x00, 0x00, 0x10, 0x61, 0x76, 0x63, 0x31]))
  boxData.set(data, 8)
  var o = { type, data_reference_index }

  it(':constructor', () => {
    assert.throws(() => new SampleEntryBox({ type }))
    assert.throws(() => new SampleEntryBox({ type, data_reference_index: 'str' }))
    assert.doesNotThrow(() => {
      var box = new SampleEntryBox(o)
      assert.equal(box.data_reference_index, data_reference_index)
    })
  })
  it('getSize', () => {
    var box = new SampleEntryBox(o)
    assert.equal(box.getSize(), boxData.byteLength)
  })
  it('writeData', () => {
    var box = new SampleEntryBox(o)
    var dataStream = new DataStream()
    box.writeData(dataStream)
    assert.equal(dataStream.getByteLength(), data.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(data.byteLength), data)
  })
  it('write', () => {
    var box = new SampleEntryBox(o)
    var dataStream = new DataStream()
    box.write(dataStream)
    assert.equal(dataStream.getByteLength(), boxData.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(boxData.byteLength), boxData)
  })
  it(':fromStream', () => {
    var box = SampleEntryBox.fromStream(new DataStream(boxData.buffer))
    assert.equal(box.type, type)
    assert.equal(box.data_reference_index, data_reference_index)
  })
  it(':dataFromStream', () => {
    var box = SampleEntryBox.dataFromStream(type, boxData.byteLength, new DataStream(data.buffer))
    assert.equal(box.type, type)
    assert.equal(box.data_reference_index, data_reference_index)
  })
})
