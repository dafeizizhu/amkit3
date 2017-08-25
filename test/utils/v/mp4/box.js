import { assert } from 'chai'

import Box from 'amkit3-modules/utils/v/mp4/box'
import DataStream from 'amkit3-modules/utils/data-stream'

describe('utils/v/mp4/box', () => {
  var type = 'ftyp'
  var data = new Uint8Array([0x00, 0x00, 0x00, 0x08].concat(type.split('').map(c => c.charCodeAt(0))))

  it(':constructor', () => {
    assert.throws(() => new Box())
    assert.throws(() => new Box({}))
    assert.throws(() => new Box({ type: 123 }))
    assert.throws(() => new Box({ type: 'jfdasjfiasif' }))
    assert.doesNotThrow(() => {
      var box = new Box({ type })
      assert.equal(box.type, type)
    })
  })
  it(':fromStream', () => {
    var box = Box.fromStream(new DataStream(data.buffer))
    assert.equal(box.size, 8)
    assert.equal(box.type, type)
  })
  it('getSize', () => {
    assert.throws(() => new Box({ type: 'ftyp' }).getSize())
  })
  it('writeHead', () => {
    assert.throws(() => new Box({ type: 'ftyp' }).writeHead(new DataStream()))
  })
  it('write', () => {
    assert.throws(() => new Box({ type: 'ftyp' }).write(new DataStream()))
  })
})
