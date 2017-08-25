exports.bits = (byte, start, length) => {
  var mask
  for (var i = 0; i < 8; i++) {
    if (i < start || i >= start + length) {
      if (mask) mask = (mask << 1) | 0
      else mask = 0
    } else {
      if (mask) mask = (mask << 1) | 1
      else mask = 1
    }
  }
  return (byte & mask) >>> (8 - start - length)
}

exports.uint32 = (bytes, position) => {
  return new DataView(bytes.buffer, bytes.byteOffset + position).getUint32()
}

exports.int32 = (bytes, position) => {
  return new DataView(bytes.buffer, bytes.byteOffset + position).getInt32()
}

exports.uint16 = (bytes, position) => {
  return new DataView(bytes.buffer, bytes.byteOffset + position).getUint16()
}

exports.int16 = (bytes, position) => {
  return new DataView(bytes.buffer, bytes.byteOffset + position).getInt16()
}

exports.uint8 = (bytes, position) => {
  return new DataView(bytes.buffer, bytes.byteOffset + position).getUint8()
}

exports.int8 = (bytes, position) => {
  return new DataView(bytes.buffer, bytes.byteOffset + position).getInt8()
}

exports.str = (bytes, position, length) => {
  return String.fromCharCode.apply(null, bytes.subarray(position, position + length))
}

