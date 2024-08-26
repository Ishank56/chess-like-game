// WebSocket connection
const socket = new WebSocket("ws://localhost:3000");

socket.addEventListener('open', function(event) {
    console.log('Connected to WS Server!');
});

socket.addEventListener('message', function(event) {
    console.log('Message from server:', event.data);
    try {
        const message = JSON.parse(event.data);
        switch(message.type) {
            case 'move':
                handleServerMove(message);
                break;
            case 'win':
                handleServerWin(message);
                break;
            case 'restart':
                handleServerRestart();
                break;
            case 'invalid-move':
                messageElement.textContent = message.message;  // Display invalid move message
                break;
        }
    } catch (error) {
        console.log('Received non-JSON message:', event.data);
    }
});

const board = document.getElementById("game-board");
const messageElement = document.getElementById("message");
const historyList = document.getElementById("history-list");
const restartButton = document.getElementById('restart-button');

// Initialize the 5x5 grid with updated pieces
let grid = [
    ['A-P1', 'A-H1', 'A-H2', 'A-H3', 'A-P2'],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['B-P1', 'B-H1', 'B-H2', 'B-H3', 'B-P2']
];

// Move history
const moveHistory = [];

let currentPlayer = 'A';
let selectedPiece = null;

function renderBoard() {
    board.innerHTML = '';
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

                cell.textContent = piece.split('-')[1];
            }

            cell.addEventListener('click', () => handleMove(row, col));
            board.appendChild(cell);
        }
    }
}

function handleMove(row, col) {
    const cellContent = grid[row][col];
    
    if (selectedPiece && cellContent && cellContent.includes(currentPlayer)) {
        selectedPiece = { row, col, piece: cellContent.split('-')[1] };
        messageElement.textContent = `Selected ${selectedPiece.piece} at (${row}, ${col}). Now pick a destination.`;
    } else if (selectedPiece) {
        const { row: prevRow, col: prevCol, piece } = selectedPiece;
        const pieceType = piece[0];
        const isPlayerA = currentPlayer === 'A';

        if (isMoveValid(prevRow, prevCol, row, col, pieceType, isPlayerA)) {
            if (cellContent === '' || (cellContent.includes('B') && isPlayerA) || (cellContent.includes('A') && !isPlayerA)) {
                const moveInfo = {
                    type: 'move',
                    from: { row: prevRow, col: prevCol },
                    to: { row, col },
                    piece: `${currentPlayer}-${piece}`
                };
                socket.send(JSON.stringify(moveInfo));

                moveHistory.push(`Player ${currentPlayer} moved ${piece} from (${prevRow}, ${prevCol}) to (${row}, ${col})`);
                updateMoveHistory();

                grid[prevRow][prevCol] = '';
                grid[row][col] = `${currentPlayer}-${piece}`;
                selectedPiece = null;

                const winner = checkWinCondition();
                if (winner) {
                    messageElement.textContent = `Player ${winner} wins!`;
                    restartButton.style.display = 'block';
                } else {
                    currentPlayer = currentPlayer === 'A' ? 'B' : 'A';
                    messageElement.textContent = `Player ${currentPlayer}'s turn`;
                }
            } else {
                messageElement.textContent = 'Invalid move! Cell occupied by own piece or invalid destination.';
                socket.send(JSON.stringify({ type: 'invalid-move', message: 'Invalid move! Cell occupied by own piece or invalid destination.' }));
            }
        } else {
            messageElement.textContent = 'Invalid move! The piece cannot move in that way.';
            socket.send(JSON.stringify({ type: 'invalid-move', message: 'Invalid move! The piece cannot move in that way.' }));
        }
    } else if (cellContent && cellContent.includes(currentPlayer)) {
        selectedPiece = { row, col, piece: cellContent.split('-')[1] };
        messageElement.textContent = `Selected ${selectedPiece.piece} at (${row}, ${col}). Now pick a destination.`;
    } else {
        messageElement.textContent = 'Invalid selection! Pick your own piece.';
        socket.send(JSON.stringify({ type: 'invalid-move', message: 'Invalid selection! Pick your own piece.' }));
    }

    renderBoard();
}

function checkWinCondition() {
    const playerAPieces = grid.flat().filter(piece => piece.includes('A')).length;
    const playerBPieces = grid.flat().filter(piece => piece.includes('B')).length;

    if (playerAPieces === 0) {
        socket.send(JSON.stringify({ type: 'win', winner: 'B' }));
        return 'B';
    } else if (playerBPieces === 0) {
        socket.send(JSON.stringify({ type: 'win', winner: 'A' }));
        return 'A';
    }
    return null;
}

function restartGame() {
    socket.send(JSON.stringify({ type: 'restart' }));
    grid = [
        ['A-P1', 'A-H1', 'A-H2', 'A-H3', 'A-P2'],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['B-P1', 'B-H1', 'B-H2', 'B-H3', 'B-P2']
    ];
    moveHistory.length = 0;
    updateMoveHistory();
    currentPlayer = 'A';
    messageElement.textContent = "Player A's turn";
    renderBoard();
}

restartButton.addEventListener('click', restartGame);

function isMoveValid(startRow, startCol, endRow, endCol, pieceType, isPlayerA) {
    const rowDiff = Math.abs(endRow - startRow);
    const colDiff = Math.abs(endCol - startCol);

    if (endRow < 0 || endRow >= 5 || endCol < 0 || endCol >= 5) return false;

    if (pieceType === 'P') {
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    } else if (pieceType === 'H') {
        if (grid[startRow][startCol].includes('H1')) {
            return (rowDiff === 2 && colDiff === 0 || rowDiff === 0 && colDiff === 2) && checkStraightPathForKill(startRow, startCol, endRow, endCol);
        } else if (grid[startRow][startCol].includes('H2')) {
            return rowDiff === 2 && colDiff === 2 && checkDiagonalPathForKill(startRow, startCol, endRow, endCol);
        } else if (grid[startRow][startCol].includes('H3')) {
            return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
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
    moveHistory.forEach(move => {
        const listItem = document.createElement('li');
        listItem.textContent = move;
        historyList.appendChild(listItem);
    });
}

function handleServerMove(moveInfo) {
    grid[moveInfo.from.row][moveInfo.from.col] = '';
    grid[moveInfo.to.row][moveInfo.to.col] = moveInfo.piece;
    currentPlayer = currentPlayer === 'A' ? 'B' : 'A';
    renderBoard();
    updateMoveHistory();
}

function handleServerWin(winInfo) {
    messageElement.textContent = `Player ${winInfo.winner} wins!`;
}

function handleServerRestart() {
    restartGame();
}

// Initial board rendering
renderBoard();
