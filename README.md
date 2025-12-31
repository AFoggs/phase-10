# Phase 10 Online - Multiplayer Card Game

A fully functional multiplayer Phase 10 card game web application with real-time gameplay, CPU players, multiple game modes, and background music.

## Features

- **Real-time Multiplayer**: Play with 2-6 players online
- **CPU Players**: Add AI opponents with adjustable difficulty
- **9 Game Modes**:
  - Normal Phase 10/20/30 (complete phases in order)
  - Choice Phase 10/20/30 (choose your phase each round)
  - Chaos Phase 10/20/30 (random phase assignment)
- **All 30 Phases**: Full implementation of standard and extended phases
- **Drag-and-Drop**: Intuitive card placement for building phases
- **Background Music**: Optional jazz music for atmosphere
- **Responsive Design**: Play on desktop, tablet, or mobile

## Tech Stack

### Frontend
- React 18+ with hooks
- Socket.io-client for real-time communication
- Tailwind CSS for styling
- Howler.js for audio management
- React DnD for drag-and-drop

### Backend
- Node.js with Express
- Socket.io for WebSocket server
- nanoid for unique room code generation

## Project Structure

```
phase10-game/
├── client/                    # React frontend
│   ├── public/
│   │   ├── index.html
│   │   └── audio/
│   │       └── jazz-background.mp3  # Optional
│   ├── src/
│   │   ├── components/
│   │   │   ├── AudioPlayer.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── DrawDiscardPiles.jsx
│   │   │   ├── GameBoard.jsx
│   │   │   ├── Lobby.jsx
│   │   │   ├── PhaseDisplay.jsx
│   │   │   ├── PhaseValidation.jsx
│   │   │   ├── PlayerHand.jsx
│   │   │   └── ScoreBoard.jsx
│   │   ├── utils/
│   │   │   ├── cardHelpers.js
│   │   │   ├── phaseDefinitions.js
│   │   │   └── phaseValidator.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.jsx
│   │   └── index.css
│   ├── package.json
│   └── tailwind.config.js
├── server/                    # Node.js backend
│   ├── src/
│   │   ├── game/
│   │   │   ├── Deck.js
│   │   │   ├── Game.js
│   │   │   ├── Player.js
│   │   │   ├── CPUPlayer.js
│   │   │   └── phaseLogic.js
│   │   ├── rooms/
│   │   │   └── RoomManager.js
│   │   ├── server.js
│   │   └── socketHandlers.js
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd phase10-game
```

2. Install server dependencies:
```bash
cd server
npm install
```

3. Install client dependencies:
```bash
cd ../client
npm install
```

### Development

1. Start the server:
```bash
cd server
npm start
```
Server runs on http://localhost:3001

2. In a new terminal, start the client:
```bash
cd client
npm start
```
Client runs on http://localhost:3000

### Adding Background Music

To enable background music, add a jazz MP3 file to `client/public/audio/jazz-background.mp3`.

Recommended sources for royalty-free jazz:
- [Bensound](https://www.bensound.com/royalty-free-music/track/jazzy-frenchy)
- [Free Music Archive](https://freemusicarchive.org/genre/Jazz)
- [Incompetech](https://incompetech.com/music/royalty-free/music.html)

## Game Rules

### Objective
Complete all phases (10, 20, or 30 depending on mode) before other players. The first player to complete the final phase wins!

### Card Types
- **Number Cards (1-12)**: 4 colors (Red, Blue, Green, Yellow), 2 of each per color
- **Wild Cards (8 total)**: Can substitute for any number/color
- **Skip Cards (4 total)**: Skip the next player's turn

### Turn Structure
1. **Draw**: Take 1 card from draw pile or discard pile
2. **Lay Down Phase**: If you have the cards, complete your current phase
3. **Hit**: Add cards to any completed phases on the table
4. **Discard**: End your turn by discarding 1 card

### Phases 1-10 (Standard)
1. 2 sets of 3
2. 1 set of 3 + 1 run of 4
3. 1 set of 4 + 1 run of 4
4. 1 run of 7
5. 1 run of 8
6. 1 run of 9
7. 2 sets of 4
8. 7 cards of one color
9. 1 set of 5 + 1 set of 2
10. 1 set of 5 + 1 set of 3

### Scoring
At the end of each round, count remaining cards in hand:
- Cards 1-9: 5 points each
- Cards 10-12: 10 points each
- Wild/Skip: 25 points each

**Lower score is better!**

## Deployment

### Backend (Railway/Render)
```bash
cd server
git init
git add .
git commit -m "Phase 10 server"
# Deploy to Railway or Render
# Set environment variable: PORT=3001
```

### Frontend (Vercel/Netlify)
```bash
cd client
# Set environment variable: REACT_APP_SOCKET_URL=https://your-backend-url.com
npm run build
# Deploy build folder to Vercel or Netlify
```

## License

MIT License
