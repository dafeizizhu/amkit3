import { assert } from 'chai'

import DataBox from 'amkit3-modules/utils/v/mp4/data-box'
import ContainerBox from 'amkit3-modules/utils/v/mp4/container-box'
import DataStream from 'amkit3-modules/utils/data-stream'

describe('utils/v/mp4/container-box', () => {
  var type = 'moov'
  var boxes = [
    new DataBox({ type: 'dat1', data: new Uint8Array([0x01, 0x03, 0x05]) }),
    new DataBox({ type: 'dat2', data: new Uint8Array([0x02, 0x04, 0x06]) })
  ]
  var data = new Uint8Array([
    0x00, 0x00, 0x00, 0x0b, 0x64, 0x61, 0x74, 0x31,
    0x01, 0x03, 0x05, 0x00, 0x00, 0x00, 0x0b, 0x64,
    0x61, 0x74, 0x32, 0x02, 0x04, 0x06
  ])
  var boxData = new Uint8Array([
    0x00, 0x00, 0x00, 0x1e, 0x6d, 0x6f, 0x6f, 0x76,
    0x00, 0x00, 0x00, 0x0b, 0x64, 0x61, 0x74, 0x31,
    0x01, 0x03, 0x05, 0x00, 0x00, 0x00, 0x0b, 0x64,
    0x61, 0x74, 0x32, 0x02, 0x04, 0x06
  ])

  it(':constructor', () => {
    assert.throws(() => new ContainerBox({ type }))
    assert.throws(() => new ContainerBox({ type, boxes: 'foo' }))
    assert.throws(() => new ContainerBox({ type, boxes: [1, 2, 3] }))
    assert.doesNotThrow(() => {
      var box = new ContainerBox({ type, boxes })
      assert.deepEqual(box.boxes, boxes)
    })
  })
  it(':fromStream', () => {
    var containerBox = ContainerBox.fromStream(new DataStream(boxData.buffer))
    assert.equal(containerBox.type, type)
    containerBox.boxes.forEach((b, i) => {
      assert.deepEqual(b.data, boxes[i].data)
    })
  })
  it(':dataFromStream', () => {
    var containerBox = ContainerBox.dataFromStream(type, 8 + data.byteLength, new DataStream(data.buffer))
    assert.equal(containerBox.type, type)
    containerBox.boxes.forEach((b, i) => {
      assert.deepEqual(b.data, boxes[i].data)
    })
  })
  it('getSize', () => {
    var box = new ContainerBox({ type, boxes })
    assert.equal(box.getSize(), 8 + boxes.map(b => b.getSize()).reduce((p, c) => p + c))
  })
  it('writeData', () => {
    var box = new ContainerBox({ type, boxes })
    var dataStream = new DataStream()
    box.writeData(dataStream)
    assert.equal(dataStream.getByteLength(), data.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(data.byteLength), data)
  })
  it('write', () => {
    var box = new ContainerBox({ type, boxes })
    var dataStream = new DataStream()
    box.write(dataStream)
    assert.equal(dataStream.getByteLength(), boxData.byteLength)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(boxData.byteLength), boxData)
  })
})
