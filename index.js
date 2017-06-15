const [
  Container,
  autoDetectRenderer,
  loader,
  Sprite,
  Text,
  Graphics
] = [
  'Container',
  'autoDetectRenderer',
  'loader',
  'Sprite',
  'Text',
  'Graphics'
].map(m => require('pixi.js')[m])

const W = 800
const H = 600
const BASIC_V = 3

const renderer = autoDetectRenderer(W, H, {
  antialias: false, transparent: false, resolution: 1
})
const stage = new Container()
document.body.appendChild(renderer.view)

loader
  .add([
    {name: 'player1', url: 'assets/player1.json'}
  ])
  .load(splash)

function splash () {
  let splashContainer = new Container()

  const title = new Text('TIGGO', {
    fontFamily: 'monospace',
    fontSize: 72,
    fill: '#fff'
  })
  title.x = (W - title.width) / 2
  title.y = H / 2 - title.height

  const subtitle = new Text('Press ENTER to start ...', {
    fontFamily: 'arial',
    fontSize: 18,
    fill: '#fff'
  })
  subtitle.x = (W - subtitle.width) / 2
  subtitle.y = H / 2 + subtitle.height

  let enter = new Keyboard(13)  // ENTER
  enter.press = _ => {
    stage.removeChild(splashContainer)
    splashContainer = null
    enter.clean()
    game()
  }

  ;[title, subtitle].forEach(s => { splashContainer.addChild(s) })

  stage.addChild(splashContainer)
  renderer.render(stage)
}

let state, player1, border

function game () {
  border = new Graphics()
  border.beginFill(0x000000)
  border.lineStyle(4, 0xffffff, 1)
  border.drawRect(5, 5, H - 10, H - 10)
  border.endFill()

  const id = loader.resources['player1'].textures
  player1 = new Sprite(id['2'])

  player1.x = 10
  player1.y = 10
  player1.vx = 0
  player1.vy = 0

  let left = new Keyboard(37)
  let up = new Keyboard(38)
  let right = new Keyboard(39)
  let down = new Keyboard(40)

  // Left arrow key `press` method
  left.press = _ => {
    player1.texture = id['0']
    // Change the player1's velocity when the key is pressed
    player1.vx = -BASIC_V
    player1.vy = 0
  }

  // Left arrow key `release` method
  left.release = _ => {
    // If the left arrow has been released, and the right arrow isn't down,
    // and the player1 isn't moving vertically: Stop the player1
    if (!right.isDown && player1.vy === 0) {
      player1.vx = 0
    }
  }

  // Up
  up.press = _ => {
    player1.texture = id['2']
    player1.vy = -BASIC_V
    player1.vx = 0
  }
  up.release = _ => {
    if (!down.isDown && player1.vx === 0) {
      player1.vy = 0
    }
  }

  // Right
  right.press = _ => {
    player1.texture = id['4']
    player1.vx = BASIC_V
    player1.vy = 0
  }
  right.release = _ => {
    if (!left.isDown && player1.vy === 0) {
      player1.vx = 0
    }
  }

  // Down
  down.press = _ => {
    player1.texture = id['6']
    player1.vy = BASIC_V
    player1.vx = 0
  }
  down.release = _ => {
    if (!up.isDown && player1.vx === 0) {
      player1.vy = 0
    }
  }

  // Add to stage.
  ;[border, player1].forEach(o => { stage.addChild(o) })

  // Set the game state.
  state = play

  loop()
}

function loop () {
  requestAnimationFrame(loop)
  state()
  renderer.render(stage)
}

function play () {
  if (!hitTestBorder(player1, border)) {
    player1.x += player1.vx
    player1.y += player1.vy
  } else {
    player1.x += -player1.vx
    player1.y += -player1.vy
  }
}

class Keyboard {
  constructor (keyCode) {
    this.code = keyCode
    this.isDown = false
    this.isUp = true

    this.down = e => {
      if (e.keyCode === this.code) {
        if (this.isUp && this.press) this.press()
        this.isDown = true
        this.isUp = false
      }
      e.preventDefault()
    }

    this.up = e => {
      if (e.keyCode === this.code) {
        if (this.isDown && this.release) this.release()
        this.isDown = false
        this.isUp = true
      }
      e.preventDefault()
    }

    // Store for deleting.
    this.downHandler = this.down.bind(this)
    this.upHandler = this.up.bind(this)

    window.addEventListener('keydown', this.downHandler, false)
    window.addEventListener('keyup', this.upHandler, false)
  }

  clean () {
    window.removeEventListener('keydown', this.downHandler, false)
    window.removeEventListener('keyup', this.upHandler, false)
  }

  press () { /* user-defined */ }
  release () { /* user-defined */ }
}

function hitTestBorder (r1, r2) {
  // Define the variables we'll need to calculate
  let hit, combinedHalfWidths, combinedHalfHeights, dx, dy

  // hit will determine whether there's a collision
  hit = false

  // Find the center points of each sprite
  r1.centerX = r1.x + r1.width / 2
  r1.centerY = r1.y + r1.height / 2
  r2.centerX = r2.x + r2.width / 2
  r2.centerY = r2.y + r2.height / 2

  // Find the half-widths and half-heights of each sprite
  r1.halfWidth = r1.width / 2
  r1.halfHeight = r1.height / 2
  r2.halfWidth = r2.width / 2
  r2.halfHeight = r2.height / 2

  // Calculate the distance vector between the sprites
  dx = r1.centerX - r2.centerX
  dy = r1.centerY - r2.centerY

  // Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth - r2.halfWidth
  combinedHalfHeights = r1.halfHeight - r2.halfHeight

  if (Math.abs(dx) >= Math.abs(combinedHalfWidths)) hit = true
  if (Math.abs(dy) >= Math.abs(combinedHalfHeights)) hit = true

  // `hit` will be either `true` or `false`
  return hit
}
