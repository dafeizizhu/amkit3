import { assert } from 'chai'

import AudioSampleEntryBox from 'amkit3-modules/utils/v/mp4/audio-sample-entry-box'
import DataBox from 'amkit3-modules/utils/v/mp4/data-box'
import DataStream from 'amkit3-modules/utils/data-stream'

describe.only('utils/v/mp4/audio-sample-entry-box', () => {
  var type = 'mp4a'
  var data_reference_index = 1
  var channelcount = 2
  var samplesize = 16
  var samplerate = 2890137600
  var boxes = [new DataBox({ type: 'test', data: new Uint8Array([
    0x00, 0x00, 0x00, 0x00,
    0x03, 0x80, 0x80, 0x80, 0x22, 0x00, 0x02, 0x00,
    0x04, 0x80, 0x80, 0x80, 0x14, 0x40, 0x15, 0x00,
    0x00, 0x00, 0x00, 0x00, 0xf7, 0xee, 0x00, 0x00,
    0xf7, 0xee, 0x05, 0x80, 0x80, 0x80, 0x02, 0x12,
    0x10, 0x06, 0x80, 0x80, 0x80, 0x01, 0x02 
  ])})]
  var data = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x02, 0x00, 0x10, 0x00, 0x00, 0x00, 0x00,
    0xac, 0x44, 0x00, 0x00, 0x00, 0x00, 0x00, 0x33,
    0x74, 0x65, 0x73, 0x74, 0x00, 0x00, 0x00, 0x00,
    0x03, 0x80, 0x80, 0x80, 0x22, 0x00, 0x02, 0x00,
    0x04, 0x80, 0x80, 0x80, 0x14, 0x40, 0x15, 0x00,
    0x00, 0x00, 0x00, 0x00, 0xf7, 0xee, 0x00, 0x00,
    0xf7, 0xee, 0x05, 0x80, 0x80, 0x80, 0x02, 0x12,
    0x10, 0x06, 0x80, 0x80, 0x80, 0x01, 0x02 
  ])
  var boxData = new Uint8Array(data.byteLength + 8)
  boxData.set(new Uint8Array([0x00, 0x00, 0x00, 0x57, 0x6d, 0x70, 0x34, 0x61]))
  boxData.set(data, 8)
  var o = { type, data_reference_index, channelcount, samplesize, samplerate, boxes }

  it(':constructor', () => {
    assert.throws(() => new AudioSampleEntryBox({ type, data_reference_index }))
    assert.throws(() => new AudioSampleEntryBox({ type, data_reference_index, channelcount: 'str' }))
    assert.throws(() => new AudioSampleEntryBox({ type, data_reference_index, channelcount, samplesize: 'str' }))
    assert.throws(() => new AudioSampleEntryBox({ type, data_reference_index, channelcount, samplesize, samplerate: 'str' }))
    assert.throws(() => new AudioSampleEntryBox({ type, data_reference_index, channelcount, samplesize, samplerate, boxes: 'str' }))
    assert.throws(() => new AudioSampleEntryBox({ type, data_reference_index, channelcount, samplesize, samplerate, boxes: [1, 2, 3] }))
    assert.doesNotThrow(() => {
      var box = new AudioSampleEntryBox(o)
      assert.equal(box.channelcount, channelcount)
      assert.equal(box.samplesize, samplesize)
      assert.equal(box.samplerate, samplerate)
      assert.deepEqual(box.boxes, boxes)
    })
  })
  it('getSize', () => {
    var box = new AudioSampleEntryBox(o)
    assert.equal(box.getSize(), boxData.byteLength)
  })
  it('writeData', () => {
    var box = new AudioSampleEntryBox(o)
    var dataStream = new DataStream()
    box.writeData(dataStream)
    assert.equal(dataStream.getByteLength(), data.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(data.byteLength), data)
  })
  it('write', () => {
    var box = new AudioSampleEntryBox(o)
    var dataStream = new DataStream()
    box.write(dataStream)
    assert.equal(dataStream.getByteLength(), boxData.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(boxData.byteLength), boxData)
  })
  it(':fromStream', () => {
    var box = AudioSampleEntryBox.fromStream(new DataStream(boxData.buffer))
    assert.equal(box.type, type)
    assert.equal(box.data_reference_index, data_reference_index)
    assert.equal(box.channelcount, channelcount)
    assert.equal(box.samplesize, samplesize)
    assert.equal(box.samplerate, samplerate)
    assert.deepEqual(box.boxes, boxes)
  })
  it(':dataFromStream', () => {
    var box = AudioSampleEntryBox.dataFromStream(type, boxData.byteLength, new DataStream(data.buffer))
    assert.equal(box.type, type)
    assert.equal(box.data_reference_index, data_reference_index)
    assert.equal(box.channelcount, channelcount)
    assert.equal(box.samplesize, samplesize)
    assert.equal(box.samplerate, samplerate)
    assert.deepEqual(box.boxes, boxes)
  })
})
