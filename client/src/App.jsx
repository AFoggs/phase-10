import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import AudioPlayer from './components/AudioPlayer';
import './App.css';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

function App() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [playerId, setPlayerId] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState(null);
  const [room, setRoom] = useState(null);
  const [game, setGame] = useState(null);
  const [error, setError] = useState(null);
  const [cpuThinking, setCpuThinking] = useState(null);
  const [skipNotification, setSkipNotification] = useState(null);
  const [deckExhaustedNotification, setDeckExhaustedNotification] = useState(null);
  const [hitNotification, setHitNotification] = useState(null);
  const [phaseOutNotification, setPhaseOutNotification] = useState(null);
  const [drawNotification, setDrawNotification] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Unable to connect to server. Please try again.');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    // Room events
    socket.on('roomUpdated', ({ room }) => {
      setRoom(room);
    });

    socket.on('playerJoined', ({ player, room }) => {
      setRoom(room);
    });

    socket.on('playerLeft', ({ playerId: leftId, room, newHostId }) => {
      setRoom(room);
    });

    socket.on('playerDisconnected', ({ playerId: disconnectedId, room }) => {
      if (room) setRoom(room);
    });

    // Game events
    socket.on('gameStarted', ({ game }) => {
      setGame(game);
    });

    socket.on('gameUpdated', ({ game }) => {
      setGame(game);
      setCpuThinking(null);
    });

    socket.on('cpuThinking', ({ playerId }) => {
      setCpuThinking(playerId);
    });

    socket.on('cpuAction', ({ playerId, action }) => {
      // Handle CPU action display if needed
    });

    socket.on('roundEnded', ({ roundWinnerId }) => {
      // Round ended - game state already updated
    });

    socket.on('gameEnded', ({ winnerId }) => {
      // Game ended - game state already updated
    });

    socket.on('newRoundStarted', ({ roundNumber }) => {
      setCpuThinking(null);
    });

    socket.on('playerSkipped', ({ skippedPlayerId, skippedPlayerName }) => {
      setSkipNotification({ skippedPlayerId, skippedPlayerName });
    });

    socket.on('deckExhausted', ({ message }) => {
      setDeckExhaustedNotification({ message });
      // Auto-clear after 5 seconds
      setTimeout(() => setDeckExhaustedNotification(null), 5000);
    });

    socket.on('playerHit', ({ hittingPlayerId, hittingPlayerName, targetPlayerId, targetPlayerName, card }) => {
      setHitNotification({ hittingPlayerId, hittingPlayerName, targetPlayerId, targetPlayerName, card });
      // Auto-clear after 2.5 seconds
      setTimeout(() => setHitNotification(null), 2500);
    });

    socket.on('playerPhasedOut', ({ playerId, playerName, phaseNumber }) => {
      setPhaseOutNotification({ playerId, playerName, phaseNumber });
      // Auto-clear after 3 seconds
      setTimeout(() => setPhaseOutNotification(null), 3000);
    });

    socket.on('playerDrew', ({ playerId, playerName, source, card }) => {
      setDrawNotification({ playerId, playerName, source, card });
      // Auto-clear after 2 seconds
      setTimeout(() => setDrawNotification(null), 2000);
    });

    return () => {
      socket.off('roomUpdated');
      socket.off('playerJoined');
      socket.off('playerLeft');
      socket.off('playerDisconnected');
      socket.off('gameStarted');
      socket.off('gameUpdated');
      socket.off('cpuThinking');
      socket.off('cpuAction');
      socket.off('roundEnded');
      socket.off('gameEnded');
      socket.off('newRoundStarted');
      socket.off('playerSkipped');
      socket.off('deckExhausted');
      socket.off('playerHit');
      socket.off('playerPhasedOut');
      socket.off('playerDrew');
    };
  }, [socket]);

  // Create room handler
  const handleCreateRoom = useCallback((name, settings) => {
    if (!socket) return;

    setPlayerName(name);
    socket.emit('createRoom', { playerName: name, settings }, (response) => {
      if (response.success) {
        setPlayerId(response.playerId);
        setRoomCode(response.roomCode);
        setRoom(response.room);
        setError(null);
      } else {
        setError(response.error);
      }
    });
  }, [socket]);

  // Join room handler
  const handleJoinRoom = useCallback((name, code) => {
    if (!socket) return;

    setPlayerName(name);
    socket.emit('joinRoom', { roomCode: code, playerName: name }, (response) => {
      if (response.success) {
        setPlayerId(response.playerId);
        setRoomCode(code.toUpperCase());
        setRoom(response.room);
        setError(null);
      } else {
        setError(response.error);
      }
    });
  }, [socket]);

  // Add CPU handler
  const handleAddCPU = useCallback(() => {
    if (!socket || !roomCode) return;

    socket.emit('addCPU', { roomCode }, (response) => {
      if (response.success) {
        setRoom(response.room);
      } else {
        setError(response.error);
      }
    });
  }, [socket, roomCode]);

  // Remove CPU handler
  const handleRemoveCPU = useCallback((cpuId) => {
    if (!socket || !roomCode) return;

    socket.emit('removeCPU', { roomCode, cpuId }, (response) => {
      if (response.success) {
        setRoom(response.room);
      } else {
        setError(response.error);
      }
    });
  }, [socket, roomCode]);

  // Update settings handler
  const handleUpdateSettings = useCallback((settings) => {
    if (!socket || !roomCode) return;

    socket.emit('updateSettings', { roomCode, settings }, (response) => {
      if (response.success) {
        setRoom(response.room);
      } else {
        setError(response.error);
      }
    });
  }, [socket, roomCode]);

  // Leave room handler
  const handleLeaveRoom = useCallback(() => {
    if (!socket || !roomCode) return;

    socket.emit('leaveRoom', { roomCode }, (response) => {
      if (response.success) {
        setRoomCode(null);
        setRoom(null);
        setGame(null);
        setPlayerId(null);
      } else {
        setError(response.error);
      }
    });
  }, [socket, roomCode]);

  // Start game handler
  const handleStartGame = useCallback(() => {
    if (!socket || !roomCode) return;

    socket.emit('startGame', { roomCode }, (response) => {
      if (!response.success) {
        setError(response.error);
      }
    });
  }, [socket, roomCode]);

  // Game action handlers
  const handleDrawCard = useCallback((source) => {
    if (!socket || !roomCode) return Promise.reject('Not connected');

    return new Promise((resolve, reject) => {
      socket.emit('drawCard', { roomCode, source }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(response.error);
        }
      });
    });
  }, [socket, roomCode]);

  const handleLayDownPhase = useCallback((cardGroups) => {
    if (!socket || !roomCode) return Promise.reject('Not connected');

    return new Promise((resolve, reject) => {
      socket.emit('layDownPhase', { roomCode, cardGroups }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(response.error);
        }
      });
    });
  }, [socket, roomCode]);

  const handleHitCard = useCallback((targetPlayerId, cardId, groupIndex, position = null) => {
    if (!socket || !roomCode) return Promise.reject('Not connected');

    return new Promise((resolve, reject) => {
      socket.emit('hitCard', { roomCode, targetPlayerId, cardId, groupIndex, position }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(response.error);
        }
      });
    });
  }, [socket, roomCode]);

  const handleDiscardCard = useCallback((cardId, targetPlayerId = null) => {
    if (!socket || !roomCode) return Promise.reject('Not connected');

    return new Promise((resolve, reject) => {
      socket.emit('discardCard', { roomCode, cardId, targetPlayerId }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(response.error);
        }
      });
    });
  }, [socket, roomCode]);

  const handleSelectPhase = useCallback((phaseNumber) => {
    if (!socket || !roomCode) return Promise.reject('Not connected');

    return new Promise((resolve, reject) => {
      socket.emit('selectPhase', { roomCode, phaseNumber }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(response.error);
        }
      });
    });
  }, [socket, roomCode]);

  const handleStartNewRound = useCallback(() => {
    if (!socket || !roomCode) return Promise.reject('Not connected');

    return new Promise((resolve, reject) => {
      socket.emit('startNewRound', { roomCode }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(response.error);
        }
      });
    });
  }, [socket, roomCode]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-game-bg text-white">
        {/* Audio Player */}
        <AudioPlayer />

        {/* Error Toast */}
        {error && (
          <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in">
            {error}
          </div>
        )}

        {/* Connection status */}
        {!connected && (
          <div className="fixed top-4 left-4 bg-yellow-600 text-white px-4 py-2 rounded-lg z-50">
            Connecting to server...
          </div>
        )}

        {/* Main content */}
        {!game ? (
          <Lobby
            connected={connected}
            playerId={playerId}
            roomCode={roomCode}
            room={room}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onAddCPU={handleAddCPU}
            onRemoveCPU={handleRemoveCPU}
            onUpdateSettings={handleUpdateSettings}
            onLeaveRoom={handleLeaveRoom}
            onStartGame={handleStartGame}
          />
        ) : (
          <GameBoard
            game={game}
            playerId={playerId}
            roomCode={roomCode}
            room={room}
            cpuThinking={cpuThinking}
            skipNotification={skipNotification}
            onClearSkipNotification={() => setSkipNotification(null)}
            deckExhaustedNotification={deckExhaustedNotification}
            hitNotification={hitNotification}
            phaseOutNotification={phaseOutNotification}
            drawNotification={drawNotification}
            onDrawCard={handleDrawCard}
            onLayDownPhase={handleLayDownPhase}
            onHitCard={handleHitCard}
            onDiscardCard={handleDiscardCard}
            onSelectPhase={handleSelectPhase}
            onStartNewRound={handleStartNewRound}
            onLeaveRoom={handleLeaveRoom}
          />
        )}
      </div>
    </DndProvider>
  );
}

export default App;
