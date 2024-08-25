const board = document.getElementById("game-board");
const message = document.getElementById("message");
const historyList = document.getElementById("history-list");
const restartButton = document.createElement('button');

// Initialize the 5x5 grid with updated pieces
let grid = [
    ['A-P1', 'A-P2', 'A-H1', 'A-H2', 'A-P3'], // Player A's row
    ['', '', '', '', ''], // Empty row
    ['', '', '', '', ''], // Empty row
    ['', '', '', '', ''], // Empty row
    ['B-P1', 'B-P2', 'B-H1', 'B-H2', 'B-P3']  // Player B's row
];

// Move history
const moveHistory = [];
//jnaefjnjnjnefjnjwnefnjnjewfw
function renderBoard() {
    board.innerHTML = ''; // Clear the board before re-rendering
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;

            const piece = grid[row][col];
            if (piece) {
                if (piece.includes('P')) {
                    cell.classList.add('pawn');
                    cell.classList.add(`pawn-${piece.split('-')[0]}`);
                } else if (piece.includes('H1')) {
                    cell.classList.add('hero1');
                    cell.classList.add(`hero1-${piece.split('-')[0]}`);
                } else if (piece.includes('H2')) {
                    cell.classList.add('hero2');
                    cell.classList.add(`hero2-${piece.split('-')[0]}`);
                } else if (piece.includes('H3')) {
                    cell.classList.add('hero3');
                    cell.classList.add(`hero3-${piece.split('-')[0]}`);
                }

                if (piece.includes('A')) {
                    cell.classList.add('player-A');
                } else if (piece.includes('B')) {
                    cell.classList.add('player-B');
                }

                cell.textContent = piece.split('-')[1]; // Display only 'P1', 'P2', 'H1', 'H2', 'H3'
            }

            cell.addEventListener('click', () => handleMove(row, col));
            board.appendChild(cell);
        }
    }
}

let currentPlayer = 'A';
let selectedPiece = null;

function handleMove(row, col) {
    const cellContent = grid[row][col];
    
    // If a piece is already selected and the player selects a new piece
    if (selectedPiece && cellContent && cellContent.includes(currentPlayer)) {
        selectedPiece = { row, col, piece: cellContent.split('-')[1] };
        message.textContent = `Selected ${selectedPiece.piece} at (${row}, ${col}). Now pick a destination.`;
    } else if (selectedPiece) {
        const { row: prevRow, col: prevCol, piece } = selectedPiece;
        const pieceType = piece[0]; // 'P' for Pawn, 'H' for Hero
        const isPlayerA = currentPlayer === 'A';

        if (isMoveValid(prevRow, prevCol, row, col, pieceType, isPlayerA)) {
            if (cellContent === '' || (cellContent.includes('B') && isPlayerA) || (cellContent.includes('A') && !isPlayerA)) {
                moveHistory.push(`Player ${currentPlayer} moved ${piece} from (${prevRow}, ${prevCol}) to (${row}, ${col})`);
                updateMoveHistory();

                grid[prevRow][prevCol] = ''; // Clear the previous position
                grid[row][col] = `${currentPlayer}-${piece}`; // Move to new position
                selectedPiece = null;

                if (checkWinCondition()) {
                    message.textContent = `Player ${currentPlayer} wins!`;
                    displayRestartButton();
                } else {
                    currentPlayer = currentPlayer === 'A' ? 'B' : 'A'; // Switch player
                    message.textContent = `Player ${currentPlayer}'s turn`;
                }
            } else {
                message.textContent = 'Invalid move! Cell occupied by own piece or invalid destination.';
            }
        } else {
            message.textContent = 'Invalid move! The piece cannot move in that way.';
        }
    } else if (cellContent && cellContent.includes(currentPlayer)) {
        selectedPiece = { row, col, piece: cellContent.split('-')[1] };
        message.textContent = `Selected ${selectedPiece.piece} at (${row}, ${col}). Now pick a destination.`;
    } else {
        message.textContent = 'Invalid selection! Pick your own piece.';
    }

    renderBoard();
}

function checkWinCondition() {
    // Check if either player has no remaining pieces
    const playerAPieces = grid.flat().filter(piece => piece.includes('A')).length;
    const playerBPieces = grid.flat().filter(piece => piece.includes('B')).length;

    if (playerAPieces === 0) {
        return 'B'; // Player B wins
    } else if (playerBPieces === 0) {
        return 'A'; // Player A wins
    }
    return null; // No winner yet
}

function displayRestartButton() {
    restartButton.textContent = 'Restart Game';
    restartButton.classList.add('restart-button'); // Add fancy styles
    restartButton.addEventListener('click', restartGame);
    document.body.appendChild(restartButton); // Add the button to the page
}

function restartGame() {
    // Reset the grid to the initial state
    grid = [
        ['A-P1', 'A-P2', 'A-H1', 'A-H2', 'A-P3'],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['B-P1', 'B-P2', 'B-H1', 'B-H2', 'B-P3']
    ];

    // Clear move history
    moveHistory.length = 0;
    updateMoveHistory();

    // Reset player and message
    currentPlayer = 'A';
    message.textContent = "Player A's turn";

    // Re-render the board
    renderBoard();
}

// Add event listener to the restart button
document.getElementById('restart-button').addEventListener('click', restartGame);

// Initial board rendering
renderBoard();

function isMoveValid(startRow, startCol, endRow, endCol, pieceType, isPlayerA) {
    const rowDiff = Math.abs(endRow - startRow);
    const colDiff = Math.abs(endCol - startCol);

    if (endRow < 0 || endRow >= 5 || endCol < 0 || endCol >= 5) return false;

    if (pieceType === 'P') {
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    } else if (pieceType === 'H') {
        if (grid[startRow][startCol].includes('H1')) {
            return (rowDiff === 2 && colDiff === 0) || (rowDiff === 0 && colDiff === 2) && checkStraightPathForKill(startRow, startCol, endRow, endCol);
        } else if (grid[startRow][startCol].includes('H2')) {
            return rowDiff === 2 && colDiff === 2 && checkDiagonalPathForKill(startRow, startCol, endRow, endCol);
        }
    }
    return false;
}

function checkStraightPathForKill(startRow, startCol, endRow, endCol) {
    const rowStep = startRow < endRow ? 1 : -1;
    const colStep = startCol < endCol ? 1 : -1;

    if (startRow === endRow) {
        let colBetween = startCol + colStep;
        while (colBetween !== endCol) {
            const betweenPiece = grid[startRow][colBetween];
            if (betweenPiece && betweenPiece.includes(currentPlayer === 'A' ? 'A' : 'B')) return false;
            if (betweenPiece && betweenPiece.includes(currentPlayer === 'A' ? 'B' : 'A')) grid[startRow][colBetween] = '';
            colBetween += colStep;
        }
    }

    if (startCol === endCol) {
        let rowBetween = startRow + rowStep;
        while (rowBetween !== endRow) {
            const betweenPiece = grid[rowBetween][startCol];
            if (betweenPiece && betweenPiece.includes(currentPlayer === 'A' ? 'A' : 'B')) return false;
            if (betweenPiece && betweenPiece.includes(currentPlayer === 'A' ? 'B' : 'A')) grid[rowBetween][startCol] = '';
            rowBetween += rowStep;
        }
    }

    return true;
}

function checkDiagonalPathForKill(startRow, startCol, endRow, endCol) {
    const rowStep = startRow < endRow ? 1 : -1;
    const colStep = startCol < endCol ? 1 : -1;
    let rowBetween = startRow + rowStep;
    let colBetween = startCol + colStep;

    while (rowBetween !== endRow && colBetween !== endCol) {
        const betweenPiece = grid[rowBetween][colBetween];
        if (betweenPiece && betweenPiece.includes(currentPlayer === 'A' ? 'A' : 'B')) return false;
        if (betweenPiece && betweenPiece.includes(currentPlayer === 'A' ? 'B' : 'A')) grid[rowBetween][colBetween] = '';
        rowBetween += rowStep;
        colBetween += colStep;
    }

    return true;
}

function updateMoveHistory() {
    historyList.innerHTML = ''; 
    moveHistory.forEach((move, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${index + 1}. ${move}`;
        historyList.appendChild(listItem);
    });
}

renderBoard();
