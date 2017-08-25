import cookie from 'amkit3-modules/utils/cookie'

const VOLUME_KEY = 'amkit3-v-player-profile-volume'

exports.getVolume = () => {
  let volume = Number(cookie.get(VOLUME_KEY))
  if (isNaN(volume)) {
    volume = 1
  }
  return volume
}

exports.setVolume = value => {
  cookie.set(VOLUME_KEY, value, {
    path: '/',
    expires: new Date(new Date().valueOf() + 365 * 24 * 60 * 60 * 1000)
  })
}

const DEFINITION_KEY = 'amkit3-v-player-profile-definition'

exports.getDefinition = () => cookie.get(DEFINITION_KEY)

exports.setDefinition = value => {
  cookie.set(DEFINITION_KEY, value, {
    path: '/',
    expires: new Date(new Date().valueOf() + 365 * 24 * 60 * 60 * 1000)
  })
} 
