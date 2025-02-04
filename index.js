import readline from "readline";
import chalk from "chalk";
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

let data = Array.from({ length: 4 }, () => Array(4).fill(0));
let score = 0;

// Initializes the game state
function initializeGame() {
  data = data.map((row) => row.map(() => 0));
  addNewNumber();
  addNewNumber();
  score = 0;
  render();
}

// Renders the game board
function render() {
  console.clear();

  const separator = "=".repeat(25);

  // Display game instructions and score
  let ui = "";
  ui += chalk.blueBright(`=== 🎮 2048 Game 🎮 ===\n`);
  ui += `Use arrow keys to move tiles\nPress 'q' to quit\n`;
  ui += `Score: ${score} 🎯\n${separator}\n`;

  for (const row of data) {
    let rowStr = "|";
    for (const cell of row) {
      let cellStr = "";
      if (cell === 0) {
        cellStr = "     ";
      } else {
        // Colorful numbers with emojis
        switch (cell) {
          case 2:
            cellStr = chalk.green(String(cell).padStart(5, " "));
            break;
          case 4:
            cellStr = chalk.yellow(String(cell).padStart(5, " "));
            break;
          case 8:
            cellStr = chalk.red(String(cell).padStart(5, " "));
            break;
          case 16:
            cellStr = chalk.magenta(String(cell).padStart(5, " "));
            break;
          case 32:
            cellStr = chalk.cyan(String(cell).padStart(5, " "));
            break;
          case 64:
            cellStr = chalk.blue(String(cell).padStart(5, " "));
            break;
          default:
            cellStr = chalk.whiteBright(String(cell).padStart(5, " "));
            break;
        }
      }
      rowStr += cellStr + "|";
    }
    ui += rowStr + "\n" + separator + "\n";
  }

  console.log(ui);
}

// Processes a row to combine numbers
function processRow(row) {
  let nonZero = row.filter((x) => x !== 0);

  for (let i = 0; i < nonZero.length - 1; i++) {
    if (nonZero[i] === nonZero[i + 1]) {
      nonZero[i] *= 2;
      score += nonZero[i];
      nonZero[i + 1] = 0;
      i++;
    }
  }

  nonZero = nonZero.filter((x) => x !== 0);
  while (nonZero.length < 4) nonZero.push(0);
  return nonZero;
}

// Transposes the matrix to enable column movement
function transpose(matrix) {
  return matrix[0].map((_, i) => matrix.map((row) => row[i]));
}

// Adds a new number (2 or 4) to a random empty cell
function addNewNumber() {
  const emptyCells = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (data[i][j] === 0) emptyCells.push({ i, j });
    }
  }
  if (emptyCells.length === 0) return;

  const { i, j } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  data[i][j] = Math.random() < 0.9 ? 2 : 4;
}

// Handles player movement
function handleMove(direction) {
  const original = JSON.stringify(data);

  switch (direction) {
    case "left":
      data = data.map((row) => processRow(row));
      break;
    case "right":
      data = data.map((row) => processRow([...row].reverse()).reverse());
      break;
    case "up":
      data = transpose(transpose(data).map((row) => processRow(row)));
      break;
    case "down":
      data = transpose(
        transpose(data).map((row) => processRow([...row].reverse()).reverse())
      );
      break;
  }

  if (JSON.stringify(data) !== original) {
    addNewNumber();
    return true;
  }
  return false;
}

// Checks if the player has won
function checkWin() {
  return data.some((row) => row.some((cell) => cell === 2048));
}

// Checks if the player has lost
function checkLose() {
  if (data.some((row) => row.includes(0))) return false;

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 3; j++) {
      if (data[i][j] === data[i][j + 1]) return false;
    }
  }
  for (let j = 0; j < 4; j++) {
    for (let i = 0; i < 3; i++) {
      if (data[i][j] === data[i + 1][j]) return false;
    }
  }
  return true;
}

// Handles keyboard input
process.stdin.on("keypress", (_, key) => {
  if (key.name === "q") {
    console.log("👋 Exiting... Goodbye!");
    process.exit();
  }

  const directions = ["left", "right", "up", "down"];
  if (directions.includes(key.name)) {
    const moved = handleMove(key.name);
    if (moved) {
      render();
      if (checkWin()) {
        console.log("🎉 VICTORY! You have reached 2048! 🎉");
        process.exit();
      }
      if (checkLose()) {
        console.log("💀 DEFEAT! No possible moves left! 💀");
        process.exit();
      }
    }
  }
});

// Starts the game
initializeGame();
