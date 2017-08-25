import DataStream from 'amkit3-modules/utils/data-stream'
import { assert } from 'chai'

describe('utils/data-stream', () => {
  var dataStream,
      u8Arr = new Uint8Array([0x01, 0x02, 0x03, 0x04]),
      ascii_string = 'hello world'

  beforeEach(() => {
    dataStream = new DataStream()
  })
  it('getByteLength', () => {
    assert.equal(dataStream.getByteLength(), 0)
  })
  it('write/read Uint8Array', () => {
    dataStream.writeUint8Array(u8Arr)
    assert.equal(dataStream.getByteLength(), 4)
    dataStream.seek(0)
    assert.deepEqual(dataStream.readUint8Array(4), u8Arr)
    dataStream.writeUint8Array(u8Arr)
    dataStream.writeUint8Array(u8Arr)
    dataStream.writeUint8Array(u8Arr)
    dataStream.writeUint8Array(u8Arr)
    assert.equal(dataStream.getByteLength(), 20)
    dataStream.seek(4)
    assert.deepEqual(dataStream.readUint8Array(4), u8Arr)
    assert.deepEqual(dataStream.readUint8Array(4), u8Arr)
    assert.deepEqual(dataStream.readUint8Array(4), u8Arr)
    assert.deepEqual(dataStream.readUint8Array(4), u8Arr)
  })
  it('write/read uint8', () => {
    dataStream.writeUint8(0)
    assert.equal(dataStream.getByteLength(), 1)
    dataStream.seek(0)
    assert.equal(dataStream.readUint8(), 0)
    dataStream.writeUint8(1)
    dataStream.writeUint8(2)
    dataStream.writeUint8(3)
    dataStream.writeUint8(4)
    assert.equal(dataStream.getByteLength(), 5)
    dataStream.seek(1)
    assert.equal(dataStream.readUint8(), 1)
    assert.equal(dataStream.readUint8(), 2)
    assert.equal(dataStream.readUint8(), 3)
    assert.equal(dataStream.readUint8(), 4)
  })
  it('write/read int8', () => {
    dataStream.writeInt8(0)
    assert.equal(dataStream.getByteLength(), 1)
    dataStream.seek(0)
    assert.equal(dataStream.readInt8(), 0)
    dataStream.writeInt8(-1)
    dataStream.writeInt8(-2)
    dataStream.writeInt8(3)
    dataStream.writeInt8(4)
    assert.equal(dataStream.getByteLength(), 5)
    dataStream.seek(1)
    assert.equal(dataStream.readInt8(), -1)
    assert.equal(dataStream.readInt8(), -2)
    assert.equal(dataStream.readInt8(), 3)
    assert.equal(dataStream.readInt8(), 4)
  })
  it('write/read uint16', () => {
    dataStream.writeUint16(0)
    assert.equal(dataStream.getByteLength(), 2)
    dataStream.seek(0)
    assert.equal(dataStream.readUint16(), 0)
    dataStream.writeUint16(1)
    dataStream.writeUint16(2)
    dataStream.writeUint16(3)
    dataStream.writeUint16(4)
    assert.equal(dataStream.getByteLength(), 10)
    dataStream.seek(2)
    assert.equal(dataStream.readUint16(), 1)
    assert.equal(dataStream.readUint16(), 2)
    assert.equal(dataStream.readUint16(), 3)
    assert.equal(dataStream.readUint16(), 4)
  })
  it('write/read int16', () => {
    dataStream.writeInt16(0)
    assert.equal(dataStream.getByteLength(), 2)
    dataStream.seek(0)
    assert.equal(dataStream.readInt16(), 0)
    dataStream.writeInt16(-1)
    dataStream.writeInt16(-2)
    dataStream.writeInt16(3)
    dataStream.writeInt16(4)
    assert.equal(dataStream.getByteLength(), 10)
    dataStream.seek(2)
    assert.equal(dataStream.readInt16(), -1)
    assert.equal(dataStream.readInt16(), -2)
    assert.equal(dataStream.readInt16(), 3)
    assert.equal(dataStream.readInt16(), 4)
  })
  it('write/read uint32', () => {
    dataStream.writeUint32(0)
    assert.equal(dataStream.getByteLength(), 4)
    dataStream.seek(0)
    assert.equal(dataStream.readUint32(), 0)
    dataStream.writeUint32(1)
    dataStream.writeUint32(2)
    dataStream.writeUint32(3)
    dataStream.writeUint32(4)
    assert.equal(dataStream.getByteLength(), 20)
    dataStream.seek(4)
    assert.equal(dataStream.readUint32(), 1)
    assert.equal(dataStream.readUint32(), 2)
    assert.equal(dataStream.readUint32(), 3)
    assert.equal(dataStream.readUint32(), 4)
  })
  it('write/read int32', () => {
    dataStream.writeInt32(0)
    assert.equal(dataStream.getByteLength(), 4)
    dataStream.seek(0)
    assert.equal(dataStream.readInt32(), 0)
    dataStream.writeInt32(-1)
    dataStream.writeInt32(-2)
    dataStream.writeInt32(3)
    dataStream.writeInt32(4)
    assert.equal(dataStream.getByteLength(), 20)
    dataStream.seek(4)
    assert.equal(dataStream.readInt32(), -1)
    assert.equal(dataStream.readInt32(), -2)
    assert.equal(dataStream.readInt32(), 3)
    assert.equal(dataStream.readInt32(), 4)
  })
  it('write/read string', () => {
    dataStream.writeString(ascii_string, 'ASCII', ascii_string.length)
    assert.equal(dataStream.getByteLength(), ascii_string.length)
    dataStream.seek(0)
    assert.equal(dataStream.readString(ascii_string.length, 'ASCII'), ascii_string)
  })
})
