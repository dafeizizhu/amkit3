import { hex } from 'amkit3-modules/utils/dump'

var memcpy = (dst, dstOffset, src, srcOffset, byteLength) => {
  var dstU8 = new Uint8Array(dst, dstOffset, byteLength)
  var srcU8 = new Uint8Array(src, srcOffset, byteLength)
  dstU8.set(srcU8)
}

class DataStream {
  constructor(arrayBuffer, byteOffset) {
    this._byteOffset = byteOffset || 0
    this._buffer = arrayBuffer || new ArrayBuffer(0)
    this._byteLength = this._buffer.byteLength
    this._position = 0
    this._dataView = new DataView(this._buffer, this._byteOffset)
  }
  _realloc(extra) {
    var req = this._byteOffset + this._position + extra
    var blen = this._buffer.byteLength
    if (req <= blen) {
      if (req > this._byteLength) {
        this._byteLength = req
      }
      return
    }
    if (blen < 1) blen = 1
    while (req > blen) blen *= 2
    var buf = new ArrayBuffer(blen)
    var src = new Uint8Array(this._buffer)
    var dst = new Uint8Array(buf, 0, src.length)
    dst.set(src)
    this._buffer = buf
    this._byteLength = req
    this._dataView = new DataView(this._buffer, this._byteOffset)
  }
  _trimAlloc() {
    if (this._byteLength == this._buffer.byteLength) return
    var buf = new ArrayBuffer(this._byteLength)
    var dst = new Uint8Array(buf)
    var src = new Uint8Array(this._buffer, 0, dst.length)
    dst.set(src)
    this._buffer = buf
  }
  getByteLength() {
    return this._byteLength - this._byteOffset
  }
  getPosition() {
    return this._position
  }
  seek(pos) {
    pos = Math.max(0, Math.min(this._byteLength, pos))
    this._position = (isNaN(pos) || !isFinite(pos)) ? 0 : pos
  }
  writeUint8Array(arr) {
    this._realloc(arr.length * 1)
    if (arr instanceof Uint8Array && this._byteOffset + this._position % arr.BYTES_PER_ELEMENT == 0) {
      memcpy(this._buffer, this._byteOffset + this._position,
        arr.buffer, 0, arr.byteLength)
      this._position += arr.byteLength
    } else {
      for (var i = 0; i < arr.length; i++) {
        this.writeUint8(arr[i])
      }
    }
  }
  readUint8Array(length) {
    var arr = new Uint8Array(length)
    memcpy(arr.buffer, 0,
      this._buffer, this._byteOffset + this._position,
      length * arr.BYTES_PER_ELEMENT)
    this._position += arr.byteLength
    return arr
  }
  writeUint8(v) {
    this._realloc(1)
    this._dataView.setUint8(this._position, v)
    this._position += 1
  }
  readUint8() {
    if (this._position >= this._byteLength) throw new Error('outside the bounds')
    var v = this._dataView.getUint8(this._position)
    this._position += 1
    return v
  }
  writeInt8(v) {
    this._realloc(1)
    this._dataView.setInt8(this._position, v)
    this._position += 1
  }
  readInt8() {
    if (this._position >= this._byteLength) throw new Error('outside the bounds')
    var v = this._dataView.getInt8(this._position)
    this._position += 1
    return v
  }
  writeUint16(v) {
    this._realloc(2)
    this._dataView.setUint16(this._position, v)
    this._position += 2
  }
  readUint16() {
    if (this._position + 1 >= this._byteLength) throw new Error('outside the bounds')
    var v = this._dataView.getUint16(this._position)
    this._position += 2
    return v
  }
  writeInt16(v) {
    this._realloc(2)
    this._dataView.setInt16(this._position, v)
    this._position += 2
  }
  readInt16() {
    if (this._position + 1 >= this._byteLength) throw new Error('outside the bounds')
    var v = this._dataView.getInt16(this._position)
    this._position += 2
    return v
  }
  writeUint32(v) {
    this._realloc(4)
    this._dataView.setUint32(this._position, v)
    this._position += 4
  }
  readUint32() {
    if (this._position + 3 >= this._byteLength) throw new Error('outside the bounds')
    var v = this._dataView.getUint32(this._position)
    this._position += 4
    return v
  }
  writeInt32(v) {
    this._realloc(4)
    this._dataView.setInt32(this._position, v)
    this._position += 4
  }
  readInt32() {
    if (this._position + 3 >= this._byteLength) throw new Error('outside the bounds')
    var v = this._dataView.getInt32(this._position)
    this._position += 4
    return v
  }
  writeString(s, encoding, length) {
    var i = 0
    if (!encoding || encoding == 'ASCII') {
      if (!isNaN(length)) {
        var len = Math.min(s.length, length)
        for (i = 0; i < len; i++) {
          this.writeUint8(s.charCodeAt(i))
        }
        for (; i < length; i++) {
          this.writeUint8(0)
        }
      } else {
        for (i = 0; i < s.length; i++) {
          this.writeUint8(s.charCodeAt(i))
        }
      }
    } else {
      throw new Error('not support encoding ' + encoding)
    }
  }
  readString(length, encoding) {
    var arr = new Uint8Array(length)
    memcpy(arr.buffer, 0,
      this._buffer, this._byteOffset + this._position,
      length)
    this._position += length
    if (!encoding || encoding == 'ASCII') {
      return String.fromCharCode.apply(null, arr)
    } else {
      throw new Error('not support encoding ' + encoding)
    }
  }
  skip(length) {
    // TODO
    this._position += length
  }
}

export default DataStream
