import random from './random.js'

const requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || ((fn) => setTimeout(fn, 16))

/**
 * Create a default Render
 * @param  {Canvas} canvas canvas
 * @param  {Context} context context
 * @return {Function} handler
 */
function createRender (image, canvas, context) {

  let getScale = (lifespan) => {
    return Math.max((0.5 + lifespan * 0.5));
  }

  const offset = 0
  const basicTranslateX = canvas.width / 2 + random.uniformDiscrete(-offset, offset)
  const amplitude = (canvas.width - Math.sqrt(Math.pow(image.width, 2) + Math.pow(image.height, 2))) / 2 - offset
  const wave = random.uniformDiscrete(amplitude * 0.1, amplitude) * (random.uniformDiscrete(0, 1) ? 1 : -1)
  const frequency = random.uniformDiscrete(250, 800)
  let getTranslateX = (lifespan) => {
    return basicTranslateX + wave * Math.sin(frequency * (1 - lifespan) * Math.PI / 180)
  }

  let getTranslateY = (lifespan) => {
    return (canvas.height - image.height / 2) * lifespan
  }

  const fadeOutStage = random.uniformDiscrete(84, 98) / 100
  let getAlpha = (lifespan) => {
    if (lifespan > fadeOutStage) {
      return 1
    } else {
      return 1 - ((fadeOutStage - lifespan) / fadeOutStage).toFixed(2)
    }
  }

  return (lifespan) => {
    if (lifespan >= 0) {
      context.save()
      let scale = getScale(lifespan)
      let translateX = getTranslateX(lifespan)
      let translateY = getTranslateY(lifespan)
      context.translate(translateX, translateY)
      context.scale(scale, scale)
      context.globalAlpha = getAlpha(lifespan)
      context.drawImage(
        image,
        -image.width / 2,
        -image.height / 2,
        image.width,
        image.height
      )
      context.restore()
    } else {
      return true
    }
  }
}

class BubbleHearts {
  /**
     * Init a stage
     * @return {BubbleHearts} this
     */
  constructor () {
    let canvas = this.canvas = document.createElement('canvas')
    let context = this.context = canvas.getContext('2d')
    let children = this._children = []
    let animate = () => {
      requestAnimationFrame(animate)
      context.clearRect(0, 0, canvas.width, canvas.height)
      let index = 0
      let length = children.length
      while (index < length) {
        let child = children[index]
        if (child.render.call(null, (child.timestamp + child.duration - new Date()) / child.duration)) {
          // pop it
          children.splice(index, 1)
          length--
        } else {
          // continue
          index++
        }
      }
    }
    requestAnimationFrame(animate)
  }

  /**
     * Create a bubble heart animation on stage
     * @param  {Image} image heart e.g.
     * @param  {Number} duration lifespan
     * @param  {Function} render handler
     * @return {BubbleHearts} this
     */
  bubble (image, duration = random.uniformDiscrete(2000, 4000), render = createRender(image, this.canvas, this.context)) {
    this._children.push({
      render,
      duration,
      timestamp: +new Date()
    })
    return this
  }
}

export default BubbleHearts
