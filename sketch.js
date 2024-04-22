let sh

function preload() {
  sh = loadShader("example.vert", "example.frag")
}

function setup() {
  createCanvas(600, 600, WEBGL);
  pixelDensity(1)
  noStroke()
  shader(sh)
  sh.setUniform("iResolution", [width, height])
}

function draw() {
  clear()
  background(0)
  sh.setUniform("millis", millis())
  
  rect(0, 0, width, height)
}

function mouseDragged(){
  sh.setUniform("iMouse", [mouseX, mouseY])
}
