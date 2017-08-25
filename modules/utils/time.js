export function formalFormat(timeInSeconds) {
  let hours = Math.floor(timeInSeconds / 3600)
  let minutes = Math.floor(timeInSeconds % 3600 / 60)
  let seconds = Math.floor(timeInSeconds % 60)

  return (hours <= 0 ? '' : hours + ':') + 
    (minutes < 10 ? '0' + minutes : '' + minutes) + ':' +
    (seconds < 10 ? '0' + seconds : '' + seconds)
}
