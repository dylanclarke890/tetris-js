function new2dCanvas(id, width, height) {
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  return [canvas, ctx];
}

const [canvas, ctx] = new2dCanvas("play-area", 800, 500);

const FPS = 60;
const settings = {
  fps: FPS,
  fpsInterval: 1000 / FPS,
};

const blockTypes = {
  t: [
    [0, 0, 0],
    [0, 1, 0],
    [1, 1, 1],
  ],
  z: [
    [0, 0, 0],
    [1, 1, 0],
    [0, 1, 1],
  ],
  s: [
    [0, 0, 0],
    [0, 1, 1],
    [1, 1, 0],
  ],
  j: [
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 0],
  ],
  l: [
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 1],
  ],
  o: [
    [0, 0, 0],
    [1, 1, 0],
    [1, 1, 0],
  ],
  i: [
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
  ],
};

function update() {}

let stop = false,
  now,
  lastFrame;

(function startAnimating() {
  lastFrame = window.performance.now();
  animate();
})();

function animate(newtime) {
  if (stop) return;
  requestAnimationFrame(animate);
  now = newtime;
  const elapsed = now - lastFrame;
  if (elapsed > settings.fpsInterval) {
    lastFrame = now - (elapsed % settings.fpsInterval);
    update();
  }
}
