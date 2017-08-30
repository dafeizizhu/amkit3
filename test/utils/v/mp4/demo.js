import async from 'async'

import { range } from 'amkit3-modules/utils/fetch'
import Box from 'amkit3-modules/utils/v/mp4/box'
import Boxes from 'amkit3-modules/utils/v/mp4/boxes'
import DataStream from 'amkit3-modules/utils/data-stream'

describe('utils/v/mp4/demo', () => {
  it('demo-test', cb => {
    var start = 0,
        end = 1024 - 1,
        ready = false,
        //url = 'http://huya-w6.huya.com/1733/15833540/1300/cd23604ac09647c8272f09f8e4276454.mp4',
        url = 'http://huya-w6.huya.com/1734/17240000/1300/50c8c54f03537baec2d745c6b0f513d5.mp4',
        dataStream = new DataStream(),
        type, size, boxes = [], readPos = 0

    async.whilst(() => !ready, cb => {
      console.log('start', start, 'end', end)
      range(url, [start, end], (err, uint8Array) => {
        dataStream.seek(dataStream.getByteLength())
        dataStream.writeUint8Array(uint8Array)
        if (!size) {
          dataStream.seek(readPos)
          var box = Box.fromStream(dataStream)
          type = box.type
          size = box.size
          readPos = dataStream.getPosition()
        }
        while (readPos + size <= dataStream.getByteLength()) {
          dataStream.seek(readPos)
          console.log(type, size, readPos, dataStream.getPosition(), dataStream.getByteLength())
          if (type == 'moov') ready = true
          if (Boxes[type]) {
            boxes.push(Boxes[type].dataFromStream(type, size, dataStream))
          } else {
            console.warn('box', type, 'parsed to data box')
            boxes.push(Boxes.data.dataFromStream(type, size, dataStream))
          }
          var box = Box.fromStream(dataStream)
          type = box.type
          size = box.size
          readPos = dataStream.getPosition()
        }
        start = end + 1
        end = end * 2
        cb()
      })
    }, err => {
      console.log('boxes', boxes)
      cb()
    })
  }).timeout(10000)
})
