const { nanoid } = require('nanoid');
const Game = require('../game/Game');
const Player = require('../game/Player');
const CPUPlayer = require('../game/CPUPlayer');

class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.playerToRoom = new Map(); // Quick lookup for which room a player is in
  }

  // Generate a unique 6-character room code
  generateRoomCode() {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing characters
    let code;
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
    } while (this.rooms.has(code));
    return code;
  }

  // Create a new room
  createRoom(hostPlayer, settings = {}) {
    const roomCode = this.generateRoomCode();

    const room = {
      code: roomCode,
      hostId: hostPlayer.id,
      settings: {
        maxPlayers: settings.maxPlayers || 6,
        cpuCount: settings.cpuCount || 0,
        cpuDifficulty: settings.cpuDifficulty || 'medium',
        mode: settings.mode || 'normal10',
        ...settings
      },
      players: [hostPlayer],
      game: null,
      status: 'waiting', // waiting, playing, finished
      createdAt: Date.now()
    };

    this.rooms.set(roomCode, room);
    this.playerToRoom.set(hostPlayer.id, roomCode);

    // Add CPU players if specified
    if (settings.cpuCount > 0) {
      for (let i = 0; i < settings.cpuCount; i++) {
        this.addCPU(roomCode);
      }
    }

    return { success: true, roomCode, room: this.getRoomPublicState(roomCode) };
  }

  // Join an existing room
  joinRoom(roomCode, player) {
    const room = this.rooms.get(roomCode.toUpperCase());

    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.status !== 'waiting') {
      return { success: false, error: 'Game already in progress' };
    }

    if (room.players.length >= room.settings.maxPlayers) {
      return { success: false, error: 'Room is full' };
    }

    // Check if player is already in the room
    if (room.players.find(p => p.id === player.id)) {
      return { success: false, error: 'Already in room' };
    }

    room.players.push(player);
    this.playerToRoom.set(player.id, roomCode);

    return { success: true, room: this.getRoomPublicState(roomCode) };
  }

  // Add a CPU player to a room
  addCPU(roomCode, name = null) {
    const room = this.rooms.get(roomCode.toUpperCase());

    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.status !== 'waiting') {
      return { success: false, error: 'Game already in progress' };
    }

    if (room.players.length >= room.settings.maxPlayers) {
      return { success: false, error: 'Room is full' };
    }

    const cpuPlayer = new CPUPlayer(
      nanoid(8),
      name || `CPU ${room.players.filter(p => p.isComputer).length + 1}`,
      room.settings.cpuDifficulty || 'medium'
    );

    room.players.push(cpuPlayer);

    return { success: true, cpu: cpuPlayer, room: this.getRoomPublicState(roomCode) };
  }

  // Remove a CPU player from a room
  removeCPU(roomCode, cpuId) {
    const room = this.rooms.get(roomCode.toUpperCase());

    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.status !== 'waiting') {
      return { success: false, error: 'Game already in progress' };
    }

    const cpuIndex = room.players.findIndex(p => p.id === cpuId && p.isComputer);
    if (cpuIndex === -1) {
      return { success: false, error: 'CPU not found' };
    }

    room.players.splice(cpuIndex, 1);

    return { success: true, room: this.getRoomPublicState(roomCode) };
  }

  // Remove a player from a room
  removePlayer(roomCode, playerId) {
    const room = this.rooms.get(roomCode.toUpperCase());

    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    const playerIndex = room.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) {
      return { success: false, error: 'Player not found in room' };
    }

    const wasHost = room.hostId === playerId;
    room.players.splice(playerIndex, 1);
    this.playerToRoom.delete(playerId);

    // If room is empty, delete it
    if (room.players.filter(p => !p.isComputer).length === 0) {
      this.rooms.delete(roomCode.toUpperCase());
      return { success: true, roomDeleted: true };
    }

    // If host left, assign new host
    if (wasHost) {
      const newHost = room.players.find(p => !p.isComputer);
      if (newHost) {
        room.hostId = newHost.id;
      }
    }

    return { success: true, room: this.getRoomPublicState(roomCode), newHostId: room.hostId };
  }

  // Start the game in a room
  startGame(roomCode, requesterId) {
    const room = this.rooms.get(roomCode.toUpperCase());

    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.hostId !== requesterId) {
      return { success: false, error: 'Only the host can start the game' };
    }

    if (room.players.length < 2) {
      return { success: false, error: 'Need at least 2 players to start' };
    }

    if (room.status !== 'waiting') {
      return { success: false, error: 'Game already started' };
    }

    // Create game instance
    room.game = new Game({
      id: roomCode,
      mode: room.settings.mode,
      cpuDifficulty: room.settings.cpuDifficulty
    });

    // Add all players to the game
    for (const player of room.players) {
      room.game.addPlayer(player);
    }

    // Start the game
    const result = room.game.startGame();
    if (!result.success) {
      return result;
    }

    room.status = 'playing';

    return { success: true, game: room.game };
  }

  // Update room settings
  updateSettings(roomCode, requesterId, newSettings) {
    const room = this.rooms.get(roomCode.toUpperCase());

    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.hostId !== requesterId) {
      return { success: false, error: 'Only the host can change settings' };
    }

    if (room.status !== 'waiting') {
      return { success: false, error: 'Cannot change settings during game' };
    }

    room.settings = { ...room.settings, ...newSettings };

    return { success: true, room: this.getRoomPublicState(roomCode) };
  }

  // Get room by code
  getRoom(roomCode) {
    return this.rooms.get(roomCode.toUpperCase());
  }

  // Get room by player ID
  getRoomByPlayerId(playerId) {
    const roomCode = this.playerToRoom.get(playerId);
    if (!roomCode) return null;
    return this.rooms.get(roomCode);
  }

  // Get room code for a player
  getRoomCodeForPlayer(playerId) {
    return this.playerToRoom.get(playerId);
  }

  // Get public room state (for sending to clients)
  getRoomPublicState(roomCode) {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return null;

    return {
      code: room.code,
      hostId: room.hostId,
      settings: room.settings,
      players: room.players.map(p => ({
        id: p.id,
        name: p.name,
        isComputer: p.isComputer,
        connected: p.connected !== false
      })),
      status: room.status,
      playerCount: room.players.length
    };
  }

  // Clean up old/abandoned rooms
  cleanupRooms(maxAge = 3600000) { // Default: 1 hour
    const now = Date.now();

    for (const [code, room] of this.rooms) {
      // Delete rooms older than maxAge that are still waiting
      if (room.status === 'waiting' && now - room.createdAt > maxAge) {
        for (const player of room.players) {
          this.playerToRoom.delete(player.id);
        }
        this.rooms.delete(code);
      }

      // Delete finished games after a shorter period
      if (room.status === 'finished' && now - room.createdAt > maxAge / 4) {
        for (const player of room.players) {
          this.playerToRoom.delete(player.id);
        }
        this.rooms.delete(code);
      }
    }
  }

  // Handle player disconnect
  handleDisconnect(playerId) {
    const roomCode = this.playerToRoom.get(playerId);
    if (!roomCode) return null;

    const room = this.rooms.get(roomCode);
    if (!room) return null;

    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.connected = false;
    }

    // If game hasn't started, remove player
    if (room.status === 'waiting') {
      return this.removePlayer(roomCode, playerId);
    }

    // If game in progress, just mark as disconnected
    return { success: true, roomCode, disconnected: true };
  }

  // Handle player reconnect
  handleReconnect(playerId, roomCode) {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return null;

    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.connected = true;
      this.playerToRoom.set(playerId, roomCode);
      return { success: true, room: this.getRoomPublicState(roomCode) };
    }

    return { success: false, error: 'Player not found in room' };
  }

  // Get all rooms (for debugging/admin)
  getAllRooms() {
    return Array.from(this.rooms.values()).map(room => this.getRoomPublicState(room.code));
  }
}

// Singleton instance
const roomManager = new RoomManager();

module.exports = roomManager;
