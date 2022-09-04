function new2dCanvas(id, width, height) {
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  return [canvas, ctx];
}

const [canvas, ctx] = new2dCanvas("play-area", 800, 500);

const FPS = 60,
  COLS = 10,
  SIZE = 25;
const settings = {
  fps: FPS,
  fpsInterval: 1000 / FPS,
  cols: COLS,
  rows: 20,
  size: SIZE,
  boardOffset: COLS * SIZE,
  emptyCellColor: "white",
  blockDescendInterval: 1, // in seconds
  keyboardMoveInterval: 0.25,
};
let state;
let board = [];
let downPressed = false;

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
      [0, 0, 0],
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

const colors = ["green", "orange", "red", "blue", "purple"];

function randomPiece() {
  const blocks = Object.keys(blockTypes);
  return blockTypes[blocks[Math.floor(Math.random() * blocks.length)]];
}

function randomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

class Block {
  constructor(rotations, color) {
    this.x = 4;
    this.y = -4;
    this.color = color;
    this.downInterval = settings.blockDescendInterval * settings.fps;
    this.timer = 0;
    this.rotations = rotations;
    this.currentRotation = 0;
    this.activeTetromino = this.rotations[this.currentRotation];
    this.locked = false;
  }

  update() {
    if (
      this.timer % this.downInterval === 0 ||
      (downPressed &&
        this.timer % (settings.keyboardMoveInterval * settings.fps) === 0)
    ) {
      if (!this.willCollide(0, 1, this.activeTetromino)) this.y += 1;
      else this.lock();
    }

    this.timer++;
  }

  draw() {
    for (let r = 0; r < this.activeTetromino.length; r++)
      for (let c = 0; c < this.activeTetromino[r].length; c++)
        if (this.activeTetromino[r][c])
          drawSquare(this.x + c, this.y + r, this.color);
  }

  nextRotation() {
    const mod = this.rotations.length;
    const next = this.rotations[(this.currentRotation + 1) % mod];
    let kick = this.willCollide(0, 0, next)
      ? this.x > settings.cols / 2
        ? -1
        : 1
      : 0;

    if (!this.willCollide(kick, 0, next)) {
      this.x += kick;
      this.currentRotation++;
      this.activeTetromino = next;
    }
  }

  willCollide(x, y, piece = this.activeTetromino) {
    for (let r = 0; r < piece.length; r++) {
      for (let c = 0; c < piece.length; c++) {
        if (!piece[r][c]) continue;
        let newX = this.x + c + x;
        let newY = this.y + r + y;
        if (newX < 0 || newX >= settings.cols || newY >= settings.rows)
          return true;
        if (newY < 0) continue;
        if (board[newY][newX] != settings.emptyCellColor) return true;
      }
    }
    return false;
  }

  lock() {
    for (let r = 0; r < this.activeTetromino.length; r++)
      for (let c = 0; c < this.activeTetromino[r].length; c++) {
        if (!this.activeTetromino[r][c]) continue;
        if (this.y + r < 0) {
          state.gameOver = true;
          break;
        }
        this.locked = true;
        board[this.y + r][this.x + c] = this.color;
        removeFullRows();
      }
  }
}

function newGame() {
  state = {
    activeBlock: new Block(randomPiece(), randomColor()),
    gameOver: false,
    score: 0,
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

function removeFullRows() {
  for (let r = 0; r < board.length; r++) {
    const row = board[r];
    let rowIsFull = true;
    for (let c = 0; c < row.length; c++) {
      if (row[c] === settings.emptyCellColor) {
        rowIsFull = false;
        break;
      }
    }
    if (rowIsFull) {
      for (let y = r; y > 1; y--)
        for (let c = 0; c < settings.cols; c++) board[y][c] = board[y - 1][c];
      for (let i = 0; i < settings.cols; i++)
        board[0][i] = settings.emptyCellColor;
      state.score += 10;
    }
  }
}

function drawScore() {
  const scorePos = {
    x: settings.boardOffset + 50,
    y: 50,
  };
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText(state.score, scorePos.x, scorePos.y);
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
      downPressed = false;
      break;

    default:
      break;
  }
});

window.addEventListener("keydown", (e) => {
  if (e.code === "ArrowDown") downPressed = true;
});

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBoard();
  drawScore();
  state.activeBlock.draw();
  state.activeBlock.update();

  if (state.activeBlock.locked)
    state.activeBlock = new Block(randomPiece(), randomColor());
  if (state.gameOver) stop = true;
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
