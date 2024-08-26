markdown
Copy code
# Chess-Like Game with WebSocket Integration

## Project Overview

This project is a turn-based chess-like game where players can control pieces on a 5x5 grid. The game includes real-time updates via WebSocket communication, allowing players to see moves and game state changes as they happen. The project features a client-side interface for gameplay and move history, and a server-side WebSocket implementation to handle real-time interactions.

## Features

- **5x5 Game Grid**: Custom grid with unique movement rules for pieces.
- **WebSocket Communication**: Real-time updates and synchronization between clients and server.
- **Move History**: Tracks and displays all moves made during the game.
- **Piece Movement**: Validates and executes piece movements, including captures.
- **Game Restart**: Ability to restart the game and reset the board.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (Node Package Manager)

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/Ishank56/chess-like-game.git
Navigate to the Project Directory

bash
Copy code
cd chess-like-game
Install Dependencies

bash
Copy code
npm install ws
Running the Server
Start the Server

bash
Copy code
node start
The server will be running on http://localhost:3000.

Open the Game in Your Browser

Navigate to http://localhost:3000 to play the game.

WebSocket Communication
Server: Uses WebSocket to handle game state updates and broadcast to all connected clients.
Client: Connects to the server via WebSocket to send and receive game updates.
Client-Side Details
script.js: Handles the game logic, UI updates, and WebSocket communication.
index.html: Provides the basic HTML structure for the game interface.
style.css: Contains styling for the game board and pieces.
Server-Side Details
server.js: Sets up an Express server and integrates WebSocket for real-time communication.
Usage
Move Pieces: Click on a piece to select it, then click on a destination cell to move it.
View Move History: The move history will be updated automatically as moves are made.
Restart Game: Click the restart button to reset the game and start a new session.
Contributing
Fork the repository.
Create a new branch (git checkout -b feature-branch).
Make your changes.
Commit your changes (git commit -am 'Add new feature').
Push to the branch (git push origin feature-branch).
Create a new Pull Request.
License
This project is licensed under the MIT License. See the LICENSE file for details.

Acknowledgments
WebSocket API
Express.js
CSS Grid Layout
Feel free to reach out if you have any questions or need further assistance!


