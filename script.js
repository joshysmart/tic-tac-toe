
const end = document.querySelector('.end>p');
const start = document.querySelector('.start');
const reset = document.querySelector('.reset');
const players = document.querySelector('.player');
const difficulty = document.querySelector('.difficulty');
const box = document.querySelectorAll('.box');
const selection = document.querySelector('.selection');
const container = document.querySelector('.container');

const winMoves = [
 [0,1,2],
 [3,4,5],
 [6,7,8],
 [0,3,6],
 [1,4,7],
 [2,5,8],
 [0,4,8],
 [2,4,6]
];

let lockBoard = false
let won = false

const playerFactory = (name, marker, turn) => {
 return {name, marker, turn};
}
const player1 = playerFactory('human1', 'O', false);
const player2 = playerFactory('human2', 'X', false);

const createBoard = (() => {

 function displayBoard() {
  selection.style.display = 'none';
  container.style.display = 'grid';
  reset.style.display = 'block';
 
  for (let i = 0; i < box.length; i++) {
   box[i].innerText = '';
   box[i].style.color = '#fff';
  }
 }

 return {displayBoard};
})()


const game = (() => {

 let gameBoard = Array.from(Array(9).keys());

 function startHuman(e) {
  player1.turn = true;
  if(!lockBoard) return
  if ((player1.turn && !player2.turn)) {
   playerTurn(e.target.dataset.box, player1.marker);
   player1.turn = !player1.turn;
   player2.turn = !player2.turn;
  } else {
   playerTurn(e.target.dataset.box, player2.marker);
   player1.turn = !player1.turn;
   player2.turn = !player2.turn;
  }
 }

 function startAI(e) {
  if (typeof gameBoard[e.target.dataset.box] !== 'number') return
  playerTurn(e.target.dataset.box, player1.marker); 
  if (!checkTie() && !checkWin(gameBoard, player1.marker)) setTimeout(() => {
   playerTurn(randMove(), player2.marker);
  }, 300); 
 }

 function startImpossibleAI(e) {
  if (typeof gameBoard[e.target.dataset.box] !== 'number') return
  playerTurn(e.target.dataset.box, player1.marker);
  if (!checkTie() && !checkWin(gameBoard, player1.marker)) setTimeout(() => {
   playerTurn(bestMove(), player2.marker);
  }, 300); 
 }

 function playerTurn(index, marker) {
  if (typeof gameBoard[index] !== 'number') return
  gameBoard[index] = marker;
  box[index].innerText = marker;
  const win = game.checkWin(gameBoard, marker);
  if(win) {
   won = true;
   game.gameOver(win);
  }
  const isTie = checkTie()
  if (isTie && !won) {
   end.style.display = 'block';
   lockBoard = !lockBoard;
  }
 }

 function bestMove() {
  return minimax(gameBoard, player2.marker).index
 }

 function randMove() {
  const emptySquares = gameBoard.filter(mark => typeof mark === 'number');
  return emptySquares[Math.floor(Math.random() * emptySquares.length)]
 }

 function checkWin(board, marker) {
 const plays = board.reduce((a,e,i) => e === marker ? a.concat(i) : a, []);
 let gameWon = null;
 for (const [index, win] of winMoves.entries()) {
  if (win.every(marker => plays.indexOf(marker) > -1)) {
   gameWon = {index, marker};
   break
  }
 }
  return gameWon;
 }

 function gameOver(gameWon) {
  for (const index of winMoves[gameWon.index]) {
   box[index].style.color = gameWon.marker === player1.marker ? 'green' : 'blue';
  }
  lockBoard = !lockBoard;
 }

 function checkTie() {
  const emptySquares = gameBoard.filter(mark => typeof mark === 'number');
  if (emptySquares.length === 0) {
   return true
  }
  return false
 }

 function minimax(newBoard, marker) {
  const availBox = gameBoard.filter(mark => typeof mark === 'number');
  if (checkWin(newBoard, player1.marker)) {
   return {score: -1}
  } else if (checkWin(newBoard, player2.marker)){
   return {score: 1}
  } else if (availBox.length === 0) {
   return {score: 0}
  }

  const moves = [];
  for (let i = 0; i < availBox.length; i++) {
   const move = {};
   move.index = newBoard[availBox[i]];
   newBoard[availBox[i]] = marker;

   if (marker === player2.marker) {
    const result = minimax(newBoard, player1.marker);
    move.score = result.score;
   } else {
    const result = minimax(newBoard, player2.marker);
    move.score = result.score;
   }

   newBoard[availBox[i]] = move.index;
   moves.push(move);
  }

  let bestBox;
  if (marker === player2.marker) {
   let bestScore = -10000;
   for (let i = 0; i < moves.length; i++) {
    if (moves[i].score > bestScore) {
     bestScore = moves[i].score;
     bestBox = i;
    }    
   }
  } else {
   let bestScore = 10000;
   for (let i = 0; i < moves.length; i++) {
    if (moves[i].score < bestScore) {
     bestScore = moves[i].score;
     bestBox = i;
    }    
   }
  }
  return moves[bestBox]
 }

 function resetGame() {
  gameBoard = Array.from(Array(9).keys());
  box.forEach(box => {
   box.innerText = '';
   box.style.color = '#fff';
  })
  end.style.display = 'none';
  lockBoard = true;
  won = false;
 }

 return {checkWin, gameOver, checkTie, resetGame, startHuman, startImpossibleAI, startAI} 
})();

const startGame = (() => {
 function selectGame() {
  if (players.value === 'multi player') {
   lockBoard = true;
   box.forEach(box => box.addEventListener('click', game.startHuman));
   createBoard.displayBoard();
  };
  if (players.value === 'single player' && difficulty.value === 'hard') {
   lockBoard = true;
   box.forEach(box => box.addEventListener('click', game.startImpossibleAI));
   createBoard.displayBoard();
  }
  if (players.value === 'single player' && difficulty.value === 'normal') {
   lockBoard = true;
   box.forEach(box => box.addEventListener('click', game.startAI));
   createBoard.displayBoard();
  }
 }

 return {selectGame}
})()

reset.addEventListener('click', game.resetGame);
start.addEventListener('click', startGame.selectGame);