import ensureZepto from 'amkit3-modules/utils/ensure-zepto'

import { getLogger } from 'amkit3-modules/utils/log4js'
const logger = getLogger('utils/ajax')

import { urlencoded } from 'amkit3-modules/utils/params'

exports.jsonp = (url, data, cb) => {
  logger.debug('jsonp, url[', url, '], data[', data, ']')
  ensureZepto((err, $) => {
    var tId = setTimeout(() => {
      isTimeout = true
      logger.warn('jsonp, url[', url, '], data[', data, '] timeout') 
      cb(new Error('timeout'))
    }, 5000)
    var isTimeout = false

    if (err) {
      logger.debug('jsonp, url[', url, '], data[', data, '] failed, err[', err, ']')
      cb(err)
    } else {
      $.ajax({
        url,
        data,
        dataType: 'jsonp',
        success: (ret, status, xhr) => {
          clearTimeout(tId)
          logger.debug('jsonp, url[', url, '], data[', data, '] success, ret[', ret, ']')
          if (!isTimeout) cb(null, ret)
        },
        err: (xhr, errorType, error) => {
          clearTimeout(tId)
          logger.warn('jsonp, url[', url, '], data[', data, '] failed, err[', error, ']')
          if (!isTimeout) cb(error)
        }
      })
    }
  })
}

exports.sendToURL = (url, data) => {
  let u = url + (url.indexOf('?') >= 0 ? '&' : '?') + urlencoded(data)
  logger.debug('sendToURL, url[', url, '], data[', data, '], u[', u, ']')
  if (!(process.env.NODE_ENV == 'dev')) {
    new Image().src = u
  }
}
