import React, { useState } from 'react';
import { GAME_MODES } from '../utils/phaseDefinitions';

function Lobby({
  connected,
  playerId,
  roomCode,
  room,
  onCreateRoom,
  onJoinRoom,
  onAddCPU,
  onRemoveCPU,
  onUpdateSettings,
  onLeaveRoom,
  onStartGame
}) {
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [settings, setSettings] = useState({
    maxPlayers: 4,
    mode: 'normal10'
  });

  const isHost = room && room.hostId === playerId;
  const canStart = room && room.players.length >= 2;

  // Initial screen - choose to create or join
  if (!roomCode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-bold text-accent-gold mb-4">
            Phase 10
          </h1>
          <p className="text-gray-400 text-lg">
            The Classic Card Game - Now Online!
          </p>
        </div>

        <div className="w-full max-w-md space-y-6">
          {/* Player name input */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="input-field"
              maxLength={20}
            />
          </div>

          {!showCreate ? (
            <>
              {/* Create room button */}
              <button
                onClick={() => setShowCreate(true)}
                disabled={!connected || !playerName.trim()}
                className="btn-primary w-full"
              >
                Create New Game
              </button>

              {/* Join room */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-game-bg text-gray-400">or join existing</span>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Room Code"
                  className="input-field flex-1"
                  maxLength={6}
                />
                <button
                  onClick={() => onJoinRoom(playerName, joinCode)}
                  disabled={!connected || !playerName.trim() || joinCode.length !== 6}
                  className="btn-primary"
                >
                  Join
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Game settings */}
              <div className="bg-white/5 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold mb-4">Game Settings</h3>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Max Players</label>
                  <select
                    value={settings.maxPlayers}
                    onChange={(e) => setSettings({ ...settings, maxPlayers: parseInt(e.target.value) })}
                    className="select-field"
                  >
                    {[2, 3, 4, 5, 6].map(n => (
                      <option key={n} value={n}>{n} Players</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Game Mode</label>
                  <select
                    value={settings.mode}
                    onChange={(e) => setSettings({ ...settings, mode: e.target.value })}
                    className="select-field"
                  >
                    {Object.entries(GAME_MODES).map(([key, mode]) => (
                      <option key={key} value={key}>{mode.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {GAME_MODES[settings.mode]?.description}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="btn-secondary flex-1"
                >
                  Back
                </button>
                <button
                  onClick={() => onCreateRoom(playerName, settings)}
                  disabled={!connected || !playerName.trim()}
                  className="btn-primary flex-1"
                >
                  Create Room
                </button>
              </div>
            </>
          )}
        </div>

        {/* Connection status */}
        <div className="mt-8 text-sm text-gray-500">
          {connected ? (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Connected to server
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              Connecting...
            </span>
          )}
        </div>
      </div>
    );
  }

  // Waiting room
  return (
    <div className="min-h-screen flex flex-col items-center p-4 py-8">
      <h1 className="text-4xl font-bold text-accent-gold mb-8">Waiting Room</h1>

      {/* Room code */}
      <div className="text-center mb-8">
        <p className="text-gray-400 mb-2">Share this code with friends:</p>
        <div className="room-code select-all cursor-pointer" title="Click to copy">
          {roomCode}
        </div>
      </div>

      {/* Game mode info */}
      <div className="bg-white/5 rounded-lg px-6 py-3 mb-8">
        <span className="text-gray-400">Mode: </span>
        <span className="text-white font-semibold">
          {GAME_MODES[room?.settings?.mode]?.name || 'Normal Phase 10'}
        </span>
      </div>

      {/* Players list */}
      <div className="w-full max-w-md mb-8">
        <h3 className="text-lg font-semibold mb-4">
          Players ({room?.players?.length || 0}/{room?.settings?.maxPlayers || 6})
        </h3>

        <div className="space-y-2">
          {room?.players?.map((player) => (
            <div
              key={player.id}
              className={`player-item ${player.id === room.hostId ? 'is-host' : ''} ${player.isComputer ? 'is-cpu' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold
                    ${player.isComputer ? 'bg-purple-600' : 'bg-blue-600'}
                  `}
                >
                  {player.isComputer ? 'CPU' : player.name[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">
                    {player.name}
                    {player.id === playerId && <span className="text-accent-gold ml-2">(You)</span>}
                    {player.id === room.hostId && <span className="text-yellow-500 ml-2">Host</span>}
                  </div>
                  {player.isComputer && (
                    <div className="text-xs text-gray-400">Computer Player</div>
                  )}
                </div>
              </div>

              {isHost && player.isComputer && (
                <button
                  onClick={() => onRemoveCPU(player.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add CPU button */}
        {isHost && room?.players?.length < room?.settings?.maxPlayers && (
          <button
            onClick={onAddCPU}
            className="btn-secondary w-full mt-4"
          >
            + Add CPU Player
          </button>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        <button
          onClick={onLeaveRoom}
          className="btn-secondary"
        >
          Leave Room
        </button>

        {isHost && (
          <button
            onClick={onStartGame}
            disabled={!canStart}
            className="btn-primary"
          >
            {canStart ? 'Start Game' : 'Need 2+ Players'}
          </button>
        )}
      </div>

      {!isHost && (
        <p className="text-gray-400 mt-4">
          Waiting for host to start the game...
        </p>
      )}
    </div>
  );
}

export default Lobby;
