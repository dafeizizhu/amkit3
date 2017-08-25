import { assert } from 'chai'

import DataBox from 'amkit3-modules/utils/v/mp4/data-box'
import DataStream from 'amkit3-modules/utils/data-stream'

describe('utils/v/data-box', () => {
  var type = 'ftyp'
  var data = new Uint8Array([0x00, 0x02, 0x01, 0x03, 0x04])
  var streamData = new Uint8Array(8 + data.byteLength)
  streamData.set(new Uint8Array([0x00, 0x00, 0x00, data.byteLength + 8]))
  streamData.set(new Uint8Array(type.split('').map(s => s.charCodeAt(0))), 4)
  streamData.set(data, 8)

  it(':constructor', () => {
    assert.throws(() => new DataBox({ type, data: 'dummy' }))
    assert.doesNotThrow(() => {
      var box = new DataBox({ type, data })
      assert.deepEqual(box.data, data)
    })
  })
  it(':fromStream', () => {
    var dataBox = DataBox.fromStream(new DataStream(streamData.buffer))
    assert.equal(dataBox.type, type)
    assert.deepEqual(dataBox.data, data)
  })
  it(':dataFromStream', () => {
    var dataBox = DataBox.dataFromStream(type, 8 + data.byteLength, new DataStream(data.buffer))
    assert.deepEqual(dataBox.data, data)
  })
  it('getSize', () => {
    var dataBox = new DataBox({ type, data })
    var dataStream = new DataStream()
    assert.equal(dataBox.getSize(), streamData.byteLength)
  })
  it('writeData', () => {
    var dataBox = new DataBox({ type, data })
    var dataStream = new DataStream()
    dataBox.writeData(dataStream)
    assert.equal(dataStream.getByteLength(), data.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(data.byteLength), data)
  })
  it('write', () => {
    var dataBox = new DataBox({ type, data })
    var dataStream = new DataStream()
    dataBox.write(dataStream)
    assert.equal(dataStream.getByteLength(), streamData.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(streamData.byteLength), streamData)
  })
})
