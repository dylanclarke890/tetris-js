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
  cols: 10,
  rows: 20,
  size: 25,
  emptyCellColor: "white",
};
let state;

let board = [];

(function createBoard() {
  const { cols, rows, emptyCellColor } = settings;
  board = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => emptyCellColor)
  );
  console.log(board);
})();

function newGame() {
  state = {};
}

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

function drawSquare(x, y, color) {
  const size = settings.size;
  ctx.fillStyle = color;
  ctx.fillRect(x * size, y * size, size, size);
  ctx.strokeRect(x * size, y * size, size, size);
}

function drawBoard() {
  for (let r = 0; r < board.length; r++) {
    const row = board[r];
    for (let c = 0; c < row.length; c++) {
      drawSquare(c, r, row[c]);
    }
  }
}

function update() {
  drawBoard();
}

let stop = false,
  now,
  lastFrame;

(function startAnimating() {
  lastFrame = window.performance.now();
  newGame();
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
