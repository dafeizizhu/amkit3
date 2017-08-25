import { getLogger } from 'amkit3-modules/utils/log4js'
const logger = getLogger('utils/ensuer-zepto')

let $ = null

let ensureZepto = cb => {
  if ($) {
    setTimeout(() => cb(null, $), 0)
  } else {
    if (global.$ && typeof global.$.ajax == 'function') {
      logger.debug('using global zepto/jquery')
      $ = global.$
      setTimeout(() => cb(null, $), 0)
    } else {
      if (typeof getComputedStyle == 'function') {
        logger.debug('using local zepto')
        require.ensure([], require => {
          $ = require('zepto')
          cb(null, $)
        })
      } else {
        logger.warn('browser not support zepto')
        setTimeout(() => cb(new Error('getComputedStyle is not defined')), 0)
      }
    }
  }
}

export default ensureZepto
