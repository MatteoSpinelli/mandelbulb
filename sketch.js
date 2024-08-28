class Mover {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.mass = 1;
  }

  applyForce(force) {
    let f = force.copy();
    f.div(this.mass);
    this.acc = f;
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }
}

let sh;
let mover;

function preload() {
  sh = loadShader("bulb.vert", "bulb.frag");
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);
  /* mover = new Mover(-1.0276308000000314, -0.2378512000000007); */
  mover = new Mover(0, -3);
  noStroke();
  shader(sh);
  sh.setUniform("iResolution", [width, height]);
  sh.setUniform("dir", [mover.pos.x, mover.pos.y]);
}

function draw() {
  clear();
  background(0);
  sh.setUniform("millis", millis() / 1000);
  sh.setUniform("iMouse", [mouseX, mouseY]);

  if (keyIsDown(65)) {
    mover.applyForce(createVector(-0.00001, 0));
    mover.update();
  } else if (keyIsDown(68)) {
    mover.applyForce(createVector(0.00001, 0));
    mover.update();
  } else if (keyIsDown(87)) {
    mover.applyForce(createVector(0, 0.00001));
    mover.update();
  } else if (keyIsDown(83)) {
    mover.applyForce(createVector(0, -0.00001));
    mover.update();
  } else {
    mover.update();
  }

  if (mouseIsPressed) {
    console.log(mover.pos.x, mover.pos.y);
  }

  sh.setUniform("dir", [mover.pos.x, mover.pos.y]);
  rect(0, 0, width, height);
}

function mouseDragged() {
  sh.setUniform("iMouse", [mouseX, mouseY]);
}
