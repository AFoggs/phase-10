const roomManager = require('./rooms/RoomManager');
const Player = require('./game/Player');

// Store socket ID to player ID mapping
const socketToPlayer = new Map();
const playerToSocket = new Map();

// CPU turn delay in ms
const CPU_TURN_DELAY = 1500;
const CPU_ACTION_DELAY = 800;

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Create a new room
    socket.on('createRoom', (data, callback) => {
      const { playerName, settings } = data;

      const player = new Player(null, playerName);
      socketToPlayer.set(socket.id, player.id);
      playerToSocket.set(player.id, socket.id);

      const result = roomManager.createRoom(player, settings);

      if (result.success) {
        socket.join(result.roomCode);
        callback({
          success: true,
          roomCode: result.roomCode,
          playerId: player.id,
          room: result.room
        });
      } else {
        callback({ success: false, error: result.error });
      }
    });

    // Join an existing room
    socket.on('joinRoom', (data, callback) => {
      const { roomCode, playerName } = data;

      const player = new Player(null, playerName);
      socketToPlayer.set(socket.id, player.id);
      playerToSocket.set(player.id, socket.id);

      const result = roomManager.joinRoom(roomCode, player);

      if (result.success) {
        socket.join(roomCode.toUpperCase());
        callback({
          success: true,
          playerId: player.id,
          room: result.room
        });

        // Notify other players
        socket.to(roomCode.toUpperCase()).emit('playerJoined', {
          player: { id: player.id, name: player.name, isComputer: false },
          room: result.room
        });
      } else {
        callback({ success: false, error: result.error });
      }
    });

    // Add CPU player
    socket.on('addCPU', (data, callback) => {
      const { roomCode, cpuName } = data;
      const playerId = socketToPlayer.get(socket.id);

      const room = roomManager.getRoom(roomCode);
      if (!room) {
        callback({ success: false, error: 'Room not found' });
        return;
      }

      if (room.hostId !== playerId) {
        callback({ success: false, error: 'Only host can add CPU players' });
        return;
      }

      const result = roomManager.addCPU(roomCode, cpuName);

      if (result.success) {
        callback({ success: true, room: result.room });
        io.to(roomCode.toUpperCase()).emit('roomUpdated', { room: result.room });
      } else {
        callback({ success: false, error: result.error });
      }
    });

    // Remove CPU player
    socket.on('removeCPU', (data, callback) => {
      const { roomCode, cpuId } = data;
      const playerId = socketToPlayer.get(socket.id);

      const room = roomManager.getRoom(roomCode);
      if (!room) {
        callback({ success: false, error: 'Room not found' });
        return;
      }

      if (room.hostId !== playerId) {
        callback({ success: false, error: 'Only host can remove CPU players' });
        return;
      }

      const result = roomManager.removeCPU(roomCode, cpuId);

      if (result.success) {
        callback({ success: true, room: result.room });
        io.to(roomCode.toUpperCase()).emit('roomUpdated', { room: result.room });
      } else {
        callback({ success: false, error: result.error });
      }
    });

    // Update room settings
    socket.on('updateSettings', (data, callback) => {
      const { roomCode, settings } = data;
      const playerId = socketToPlayer.get(socket.id);

      const result = roomManager.updateSettings(roomCode, playerId, settings);

      if (result.success) {
        callback({ success: true, room: result.room });
        io.to(roomCode.toUpperCase()).emit('roomUpdated', { room: result.room });
      } else {
        callback({ success: false, error: result.error });
      }
    });

    // Leave room
    socket.on('leaveRoom', (data, callback) => {
      const { roomCode } = data;
      const playerId = socketToPlayer.get(socket.id);

      const result = roomManager.removePlayer(roomCode, playerId);

      if (result.success) {
        socket.leave(roomCode.toUpperCase());
        socketToPlayer.delete(socket.id);
        playerToSocket.delete(playerId);

        callback({ success: true });

        if (!result.roomDeleted) {
          io.to(roomCode.toUpperCase()).emit('playerLeft', {
            playerId,
            room: result.room,
            newHostId: result.newHostId
          });
        }
      } else {
        callback({ success: false, error: result.error });
      }
    });

    // Start game
    socket.on('startGame', (data, callback) => {
      const { roomCode } = data;
      const playerId = socketToPlayer.get(socket.id);

      const result = roomManager.startGame(roomCode, playerId);

      if (result.success) {
        const room = roomManager.getRoom(roomCode);

        // Send game state to each player
        for (const player of room.players) {
          if (!player.isComputer) {
            const playerSocket = playerToSocket.get(player.id);
            if (playerSocket) {
              io.to(playerSocket).emit('gameStarted', {
                game: room.game.getStateForPlayer(player.id)
              });
            }
          }
        }

        callback({ success: true });

        // If first card was a skip, emit skip notification
        if (room.game.firstPlayerSkipped) {
          setTimeout(() => {
            io.to(roomCode.toUpperCase()).emit('playerSkipped', {
              skippedPlayerId: room.game.firstPlayerSkipped.playerId,
              skippedPlayerName: room.game.firstPlayerSkipped.playerName,
              reason: 'First card was a Skip!'
            });
            room.game.firstPlayerSkipped = null;
          }, 500); // Small delay so players see the game board first
        }

        // Check if first player is CPU
        checkAndExecuteCPUTurn(io, roomCode);
      } else {
        callback({ success: false, error: result.error });
      }
    });

    // Draw card
    socket.on('drawCard', (data, callback) => {
      const { roomCode, source } = data;
      const playerId = socketToPlayer.get(socket.id);

      const room = roomManager.getRoom(roomCode);
      if (!room || !room.game) {
        callback({ success: false, error: 'Game not found' });
        return;
      }

      const player = room.game.players.find(p => p.id === playerId);
      // For discard draws, get the card info BEFORE drawing (for notification)
      const topDiscardCard = source === 'discard' ? room.game.deck.getTopDiscard() : null;
      const result = room.game.drawCard(playerId, source);

      if (result.success) {
        // Emit draw notification to all players
        // Include the card for discard draws so everyone can see what was picked up
        io.to(roomCode.toUpperCase()).emit('playerDrew', {
          playerId: playerId,
          playerName: player?.name,
          source: source,
          card: source === 'discard' ? topDiscardCard : null
        });

        // Check if deck was exhausted (triggers round end)
        if (result.deckExhausted) {
          callback({
            success: true,
            deckExhausted: true,
            roundEnded: result.roundEnded,
            gameEnded: result.gameEnded
          });

          broadcastGameState(io, roomCode);

          // Emit deck exhausted event for UI notification
          io.to(roomCode.toUpperCase()).emit('deckExhausted', {
            message: 'Deck ran out! Round ending...'
          });

          if (result.roundEnded && !result.gameEnded) {
            io.to(roomCode.toUpperCase()).emit('roundEnded', {
              roundWinnerId: null,
              deckExhausted: true
            });
          }

          if (result.gameEnded) {
            io.to(roomCode.toUpperCase()).emit('gameEnded', {
              winnerId: result.winnerId,
              deckExhausted: true
            });
            room.status = 'finished';
          }
        } else {
          callback({ success: true, card: result.card });
          broadcastGameState(io, roomCode);
        }
      } else {
        callback({ success: false, error: result.error });
      }
    });

    // Lay down phase
    socket.on('layDownPhase', (data, callback) => {
      const { roomCode, cardGroups } = data;
      const playerId = socketToPlayer.get(socket.id);

      const room = roomManager.getRoom(roomCode);
      if (!room || !room.game) {
        callback({ success: false, error: 'Game not found' });
        return;
      }

      const player = room.game.players.find(p => p.id === playerId);
      const result = room.game.layDownPhase(playerId, cardGroups);

      if (result.success) {
        callback({ success: true, phaseNumber: result.phaseNumber, roundEnded: result.roundEnded, gameEnded: result.gameEnded });

        // Emit phase out notification
        io.to(roomCode.toUpperCase()).emit('playerPhasedOut', {
          playerId: playerId,
          playerName: player?.name,
          phaseNumber: result.phaseNumber
        });

        broadcastGameState(io, roomCode);

        // Handle round/game end from phasing out with all cards
        if (result.roundEnded && !result.gameEnded) {
          io.to(roomCode.toUpperCase()).emit('roundEnded', {
            roundWinnerId: playerId
          });
        }

        if (result.gameEnded) {
          io.to(roomCode.toUpperCase()).emit('gameEnded', {
            winnerId: room.game.winner
          });
          room.status = 'finished';
        }
      } else {
        callback({ success: false, error: result.error });
      }
    });

    // Hit on another player's phase
    socket.on('hitCard', (data, callback) => {
      const { roomCode, targetPlayerId, cardId, groupIndex, position } = data;
      const playerId = socketToPlayer.get(socket.id);

      const room = roomManager.getRoom(roomCode);
      if (!room || !room.game) {
        callback({ success: false, error: 'Game not found' });
        return;
      }

      // Get card info before hit (for notification)
      const hittingPlayer = room.game.players.find(p => p.id === playerId);
      const targetPlayer = room.game.players.find(p => p.id === targetPlayerId);
      const card = hittingPlayer?.getCard(cardId);

      const result = room.game.hitCard(playerId, targetPlayerId, cardId, groupIndex, position);

      if (result.success) {
        callback({ success: true, roundEnded: result.roundEnded, gameEnded: result.gameEnded });

        // Emit hit notification
        io.to(roomCode.toUpperCase()).emit('playerHit', {
          hittingPlayerId: playerId,
          hittingPlayerName: hittingPlayer?.name,
          targetPlayerId: targetPlayerId,
          targetPlayerName: targetPlayer?.name,
          card: card
        });

        broadcastGameState(io, roomCode);

        // Handle round/game end from hitting out
        if (result.roundEnded && !result.gameEnded) {
          io.to(roomCode.toUpperCase()).emit('roundEnded', {
            roundWinnerId: playerId
          });
        }

        if (result.gameEnded) {
          io.to(roomCode.toUpperCase()).emit('gameEnded', {
            winnerId: room.game.winner
          });
          room.status = 'finished';
        }
      } else {
        callback({ success: false, error: result.error });
      }
    });

    // Discard card
    socket.on('discardCard', (data, callback) => {
      const { roomCode, cardId, targetPlayerId } = data;
      const playerId = socketToPlayer.get(socket.id);

      const room = roomManager.getRoom(roomCode);
      if (!room || !room.game) {
        callback({ success: false, error: 'Game not found' });
        return;
      }

      const result = room.game.discardCard(playerId, cardId, targetPlayerId);
      console.log('[SOCKET] discardCard result:', JSON.stringify(result));
      console.log('[SOCKET] Game phase after discard:', room.game.phase);

      if (result.success) {
        callback({ success: true, roundEnded: result.roundEnded, gameEnded: result.gameEnded });

        // Emit skip notification BEFORE broadcasting game state
        // This ensures the notification is sent even if CPU turns follow immediately
        if (targetPlayerId) {
          const skippedPlayer = room.game.players.find(p => p.id === targetPlayerId);
          if (skippedPlayer) {
            io.to(roomCode.toUpperCase()).emit('playerSkipped', {
              skippedPlayerId: targetPlayerId,
              skippedPlayerName: skippedPlayer.name
            });
          }
        }

        broadcastGameState(io, roomCode);

        if (result.roundEnded && !result.gameEnded) {
          // Send round end event
          io.to(roomCode.toUpperCase()).emit('roundEnded', {
            roundWinnerId: result.roundWinnerId
          });
        }

        if (result.gameEnded) {
          // Send game end event
          io.to(roomCode.toUpperCase()).emit('gameEnded', {
            winnerId: result.winnerId
          });
          room.status = 'finished';
        } else if (!result.roundEnded) {
          // Check if next player is CPU
          checkAndExecuteCPUTurn(io, roomCode);
        }
      } else {
        callback({ success: false, error: result.error });
      }
    });

    // Select phase (for Choice mode)
    socket.on('selectPhase', (data, callback) => {
      const { roomCode, phaseNumber } = data;
      const playerId = socketToPlayer.get(socket.id);

      const room = roomManager.getRoom(roomCode);
      if (!room || !room.game) {
        callback({ success: false, error: 'Game not found' });
        return;
      }

      const result = room.game.selectPhase(playerId, phaseNumber);

      if (result.success) {
        callback({ success: true });
        broadcastGameState(io, roomCode);

        // Check if all players have selected
        if (room.game.phase === 'playing') {
          checkAndExecuteCPUTurn(io, roomCode);
        }
      } else {
        callback({ success: false, error: result.error });
      }
    });

    // Start new round
    socket.on('startNewRound', (data, callback) => {
      const { roomCode } = data;
      const playerId = socketToPlayer.get(socket.id);

      const room = roomManager.getRoom(roomCode);
      if (!room || !room.game) {
        callback({ success: false, error: 'Game not found' });
        return;
      }

      if (room.hostId !== playerId) {
        callback({ success: false, error: 'Only host can start new round' });
        return;
      }

      const result = room.game.startNewRound();

      if (result.success) {
        callback({ success: true });
        broadcastGameState(io, roomCode);
        io.to(roomCode.toUpperCase()).emit('newRoundStarted', {
          roundNumber: room.game.roundNumber
        });

        // If first card was a skip, emit skip notification
        if (room.game.firstPlayerSkipped) {
          setTimeout(() => {
            io.to(roomCode.toUpperCase()).emit('playerSkipped', {
              skippedPlayerId: room.game.firstPlayerSkipped.playerId,
              skippedPlayerName: room.game.firstPlayerSkipped.playerName,
              reason: 'First card was a Skip!'
            });
            room.game.firstPlayerSkipped = null;
          }, 500); // Small delay so players see the game board first
        }

        // Check if current player is CPU
        checkAndExecuteCPUTurn(io, roomCode);
      } else {
        callback({ success: false, error: result.error });
      }
    });

    // Request current game state
    socket.on('requestGameState', (data, callback) => {
      const { roomCode } = data;
      const playerId = socketToPlayer.get(socket.id);

      const room = roomManager.getRoom(roomCode);
      if (!room) {
        callback({ success: false, error: 'Room not found' });
        return;
      }

      if (room.game) {
        callback({
          success: true,
          game: room.game.getStateForPlayer(playerId)
        });
      } else {
        callback({
          success: true,
          room: roomManager.getRoomPublicState(roomCode)
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const playerId = socketToPlayer.get(socket.id);
      if (playerId) {
        const result = roomManager.handleDisconnect(playerId);
        if (result && result.roomCode) {
          io.to(result.roomCode.toUpperCase()).emit('playerDisconnected', {
            playerId,
            room: result.room
          });
        }
        socketToPlayer.delete(socket.id);
        playerToSocket.delete(playerId);
      }
      console.log('Client disconnected:', socket.id);
    });
  });

  // Start cleanup interval
  setInterval(() => {
    roomManager.cleanupRooms();
  }, 60000); // Every minute
}

// Broadcast game state to all players in a room
function broadcastGameState(io, roomCode) {
  const room = roomManager.getRoom(roomCode);
  if (!room || !room.game) return;

  for (const player of room.players) {
    if (!player.isComputer) {
      const playerSocket = playerToSocket.get(player.id);
      if (playerSocket) {
        io.to(playerSocket).emit('gameUpdated', {
          game: room.game.getStateForPlayer(player.id)
        });
      }
    }
  }
}

// Check if current player is CPU and execute their turn
async function checkAndExecuteCPUTurn(io, roomCode) {
  const room = roomManager.getRoom(roomCode);
  if (!room || !room.game) return;
  if (room.game.phase !== 'playing') return;

  const currentPlayer = room.game.getCurrentPlayer();
  if (!currentPlayer || !currentPlayer.isComputer) return;

  // Notify clients that CPU is thinking
  io.to(roomCode.toUpperCase()).emit('cpuThinking', {
    playerId: currentPlayer.id
  });

  // Wait before CPU acts
  await new Promise(resolve => setTimeout(resolve, CPU_TURN_DELAY));

  // Execute CPU turn
  try {
    const result = await room.game.executeCPUTurn(currentPlayer.id);

    if (result.success) {
      // Emit each action with delays
      for (const action of result.actions) {
        io.to(roomCode.toUpperCase()).emit('cpuAction', {
          playerId: currentPlayer.id,
          action
        });

        // Emit draw notification for CPU draws
        if (action.type === 'draw') {
          io.to(roomCode.toUpperCase()).emit('playerDrew', {
            playerId: currentPlayer.id,
            playerName: currentPlayer.name,
            source: action.source,
            // For discard draws, action.card is the card that was drawn
            card: action.source === 'discard' ? action.card : null
          });
        }

        // Emit phase out notification for CPU
        if (action.type === 'layPhase') {
          io.to(roomCode.toUpperCase()).emit('playerPhasedOut', {
            playerId: currentPlayer.id,
            playerName: currentPlayer.name,
            phaseNumber: currentPlayer.currentPhase
          });
        }

        // Emit hit notification for CPU hits
        if (action.type === 'hit') {
          const targetPlayer = room.game.players.find(p => p.id === action.targetPlayerId);
          io.to(roomCode.toUpperCase()).emit('playerHit', {
            hittingPlayerId: currentPlayer.id,
            hittingPlayerName: currentPlayer.name,
            targetPlayerId: action.targetPlayerId,
            targetPlayerName: targetPlayer?.name,
            card: action.card
          });
        }

        // Emit skip notification for CPU skip cards
        if (action.type === 'discard' && action.skipTargetId) {
          const skippedPlayer = room.game.players.find(p => p.id === action.skipTargetId);
          if (skippedPlayer) {
            io.to(roomCode.toUpperCase()).emit('playerSkipped', {
              skippedPlayerId: action.skipTargetId,
              skippedPlayerName: skippedPlayer.name
            });
          }
        }

        await new Promise(resolve => setTimeout(resolve, CPU_ACTION_DELAY));
      }

      // Broadcast updated state
      broadcastGameState(io, roomCode);

      // Check for round/game end
      const lastAction = result.actions[result.actions.length - 1];
      if (lastAction && lastAction.roundEnded) {
        io.to(roomCode.toUpperCase()).emit('roundEnded', {
          roundWinnerId: currentPlayer.id
        });

        if (lastAction.gameEnded) {
          io.to(roomCode.toUpperCase()).emit('gameEnded', {
            winnerId: room.game.winner
          });
          room.status = 'finished';
        }
        // Round ended - don't continue with more CPU turns
        return;
      }

      // Check if next player is also CPU
      if (room.game.phase === 'playing') {
        checkAndExecuteCPUTurn(io, roomCode);
      }
    }
  } catch (error) {
    console.error('CPU turn error:', error);
  }
}

module.exports = setupSocketHandlers;
