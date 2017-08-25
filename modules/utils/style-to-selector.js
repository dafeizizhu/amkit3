function styleToSelector(style) {
  let result = {}
  for (let k in style) {
    result[k] = '.' + style[k].split(' ').join('.')
  }
  return result
}

export default styleToSelector
