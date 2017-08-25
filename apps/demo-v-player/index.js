import Player from 'amkit3-modules/v/player'

if (typeof console == 'undefined') global.console = { log: () => {} }

new Player(document.getElementById('container'), {
  src: 'http://w2.dwstatic.com/58/8/1635/3139238-101-1472627640.mp4'
}, err => {
  if (err) {
    console.log('player initialize failed', err)
  } else {
    console.log('player initialized')
  }
})
