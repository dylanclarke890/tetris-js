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
  blockDescendInterval: 1, // in seconds
};
let state;

let board = [];

(function createBoard() {
  const { cols, rows, emptyCellColor } = settings;
  board = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => emptyCellColor)
  );
})();

const blockTypes = {
  t: [
    [
      [0, 0, 0],
      [0, 1, 0],
      [1, 1, 1],
    ],
    [
      [1, 0, 0],
      [1, 1, 0],
      [1, 0, 0],
    ],
    [
      [1, 1, 1],
      [0, 1, 0],
      [0, 0, 0],
    ],
    [
      [0, 0, 1],
      [0, 1, 1],
      [0, 0, 1],
    ],
  ],
  z: [
    [
      [0, 0, 0],
      [1, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 1, 0],
      [1, 1, 0],
      [1, 0, 0],
    ],
    [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0],
    ],
  ],
  s: [
    [
      [0, 0, 0],
      [0, 1, 1],
      [1, 1, 0],
    ],
    [
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
    [
      [0, 1, 1],
      [1, 1, 0],
      [1, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 0, 1],
    ],
  ],
  j: [
    [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
    [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 1],
    ],
  ],
  l: [
    [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [1, 0, 0],
    ],
    [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [0, 0, 1],
      [1, 1, 1],
    ],
  ],
  o: [
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
  ],
  i: [
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
    ],
  ],
};

class Block {
  constructor(rotations, color) {
    this.rotations = rotations;
    this.color = color;
    this.currentRotation = 0;
    this.activeTetromino = this.rotations[this.currentRotation];
    this.downInterval = settings.blockDescendInterval * settings.fps;
    this.timer = 0;
    this.x = 0;
    this.y = 0;
  }

  update() {
    if (this.timer % this.downInterval === 0) this.y += 1;
    this.timer++;
  }

  draw() {
    for (let r = 0; r < this.activeTetromino.length; r++)
      for (let c = 0; c < this.activeTetromino[r].length; c++)
        if (this.activeTetromino[r][c])
          drawSquare(this.x + c, this.y + r, this.color);
  }

  nextRotation() {
    this.currentRotation++;
    this.activeTetromino =
      this.rotations[this.currentRotation % this.activeTetromino.length];
  }

  willCollide(x, y, piece = this.activeTetromino) {
    for (let r = 0; r < piece.length; r++) {
      for (let c = 0; c < piece.length; c++) {
        if (!piece[r][c]) continue;
        let newX = this.x + c + x;
        let newY = this.y + r + y;
        console.log(newX, newY);
        if (newX < 0 || newX >= settings.cols || newY >= settings.rows)
          return true;
        if (newY < 0) continue;
        if (board[newY][newX] != settings.emptyCellColor) return true;
      }
    }
    return false;
  }
}

function newGame() {
  state = {
    activeBlock: new Block(blockTypes.l, "green"),
  };
}

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

window.addEventListener("keyup", (e) => {
  switch (e.code.toLowerCase()) {
    case "arrowup":
      state.activeBlock.nextRotation();
      break;
    case "arrowleft":
      if (!state.activeBlock.willCollide(-1, 0)) state.activeBlock.x--;
      break;
    case "arrowright":
      if (!state.activeBlock.willCollide(1, 0)) state.activeBlock.x++;
      break;
    case "arrowdown":
      if (!state.activeBlock.willCollide(0, 1)) state.activeBlock.y++;
      break;

    default:
      break;
  }
});

function update() {
  drawBoard();
  state.activeBlock.update();
  state.activeBlock.draw();
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
