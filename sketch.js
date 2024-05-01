
class Mover {
  constructor(x, y) {
    this.pos = createVector(x, y)
    this.vel = createVector(0, 0)
    this.acc = createVector(0, 0)
    this.mass = 1
  }

  applyForce(force) {
    let f = force.copy()
    f.div(this.mass)
    this.acc.add(f)
  }

  update() {
    this.vel.add(this.acc)
    this.pos.add(this.vel)
    this.acc.mult(0)
  }
}


let sh
let mover;

function preload() {
  sh = loadShader("bulb.vert", "bulb.frag")
}

function setup() {
  createCanvas(windowWidth * 0.6, windowHeight, WEBGL);
  pixelDensity(1)
  mover = new Mover(0, -3)
  noStroke()
  shader(sh)
  sh.setUniform("iResolution", [width, height])
  sh.setUniform("dir", [mover.pos.x, mover.pos.y])
}

function draw() {
  clear()
  background(0)
  sh.setUniform("millis", millis() / 1000)
  sh.setUniform("iMouse", [mouseX, mouseY]) 
  mover.update()

  if (keyIsDown(65)) {
    mover.applyForce(createVector(-0.0001, 0))
    mover.update()
  }
  if (keyIsDown(68)) {
    mover.applyForce(createVector(0.0001, 0))
    mover.update()
  }
  if (keyIsDown(87)) {
    mover.applyForce(createVector(0, 0.0001))
    mover.update()
  }
  if (keyIsDown(83)) {
    mover.applyForce(createVector(0, -0.0001))
    mover.update()
  }
  
  sh.setUniform("dir", [mover.pos.x, mover.pos.y])
  rect(0, 0, width, height)
}

function mouseDragged(){
  sh.setUniform("iMouse", [mouseX, mouseY])
}
