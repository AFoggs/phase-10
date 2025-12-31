import React, { useState, useCallback, useMemo } from 'react';
import PlayerHand from './PlayerHand';
import Card, { MiniCard } from './Card';
import PhaseDisplay from './PhaseDisplay';
import PhaseValidation from './PhaseValidation';
import DrawDiscardPiles from './DrawDiscardPiles';
import ScoreBoard from './ScoreBoard';
import { getPhaseInfo, GAME_MODES, getPhasesForMode } from '../utils/phaseDefinitions';

function GameBoard({
  game,
  playerId,
  roomCode,
  room,
  cpuThinking,
  onDrawCard,
  onLayDownPhase,
  onHitCard,
  onDiscardCard,
  onSelectPhase,
  onStartNewRound,
  onLeaveRoom
}) {
  const [selectedCards, setSelectedCards] = useState([]);
  const [error, setError] = useState(null);
  const [showPhaseBuilder, setShowPhaseBuilder] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [showPhaseSelector, setShowPhaseSelector] = useState(false);

  // Find current player data
  const currentPlayer = useMemo(() =>
    game?.players?.find(p => p.id === playerId),
    [game, playerId]
  );

  // Other players
  const otherPlayers = useMemo(() =>
    game?.players?.filter(p => p.id !== playerId) || [],
    [game, playerId]
  );

  // Is it my turn?
  const isMyTurn = game?.currentPlayerId === playerId;

  // Turn phase
  const turnPhase = game?.turnPhase;

  // Can I draw?
  const canDraw = isMyTurn && turnPhase === 'draw';

  // Can I play/discard?
  const canPlay = isMyTurn && turnPhase === 'play';

  // Have I completed my phase this round?
  const hasCompletedPhase = currentPlayer?.completedPhaseThisRound;

  // My current phase info
  const myPhaseInfo = getPhaseInfo(currentPlayer?.currentPhase);

  // Handle drawing a card
  const handleDraw = useCallback(async (source) => {
    try {
      setError(null);
      await onDrawCard(source);
    } catch (err) {
      setError(err);
    }
  }, [onDrawCard]);

  // Handle laying down phase
  const handleLayPhase = useCallback(async (cardGroups) => {
    try {
      setError(null);
      await onLayDownPhase(cardGroups);
      setShowPhaseBuilder(false);
      setSelectedCards([]);
    } catch (err) {
      setError(err);
    }
  }, [onLayDownPhase]);

  // Handle hitting
  const handleHit = useCallback(async (targetPlayerId, cardId, groupIndex) => {
    try {
      setError(null);
      await onHitCard(targetPlayerId, cardId, groupIndex);
      setSelectedCards([]);
    } catch (err) {
      setError(err);
    }
  }, [onHitCard]);

  // Handle discarding
  const handleDiscard = useCallback(async (cardId) => {
    try {
      setError(null);
      await onDiscardCard(cardId);
      setSelectedCards([]);
    } catch (err) {
      setError(err);
    }
  }, [onDiscardCard]);

  // Handle phase selection (for Choice mode)
  const handleSelectPhase = useCallback(async (phaseNumber) => {
    try {
      setError(null);
      await onSelectPhase(phaseNumber);
      setShowPhaseSelector(false);
    } catch (err) {
      setError(err);
    }
  }, [onSelectPhase]);

  // Clear error after timeout
  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Show phase selector for Choice mode
  React.useEffect(() => {
    if (game?.phase === 'phaseSelection' && game?.pendingPhaseSelections?.includes(playerId)) {
      setShowPhaseSelector(true);
    }
  }, [game?.phase, game?.pendingPhaseSelections, playerId]);

  // Game end screen
  if (game?.phase === 'gameEnd') {
    const winner = game.players.find(p => p.id === game.winner);
    const isWinner = game.winner === playerId;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <h1 className={`text-5xl font-bold mb-4 ${isWinner ? 'text-accent-gold' : 'text-white'}`}>
            {isWinner ? 'You Won!' : 'Game Over'}
          </h1>
          <p className="text-xl text-gray-300">
            {isWinner ? 'Congratulations!' : `${winner?.name} won the game!`}
          </p>
        </div>

        <ScoreBoard players={game.players} playerId={playerId} final />

        <button
          onClick={onLeaveRoom}
          className="btn-primary mt-8"
        >
          Return to Lobby
        </button>
      </div>
    );
  }

  // Round end screen
  if (game?.phase === 'roundEnd') {
    const isHost = room?.hostId === playerId;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-accent-gold mb-4">
            Round {game.roundNumber} Complete!
          </h1>
        </div>

        <ScoreBoard players={game.players} playerId={playerId} />

        {isHost ? (
          <button
            onClick={onStartNewRound}
            className="btn-primary mt-8"
          >
            Start Next Round
          </button>
        ) : (
          <p className="text-gray-400 mt-8">
            Waiting for host to start next round...
          </p>
        )}
      </div>
    );
  }

  // Phase selection modal (for Choice mode)
  if (showPhaseSelector) {
    const availablePhases = getPhasesForMode(game?.mode);

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2 className="text-2xl font-bold mb-4">Select Your Phase</h2>
          <p className="text-gray-400 mb-6">
            Choose which phase you want to attempt this round
          </p>

          <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {availablePhases.map(phaseNum => {
              const info = getPhaseInfo(phaseNum);
              return (
                <button
                  key={phaseNum}
                  onClick={() => handleSelectPhase(phaseNum)}
                  className="p-4 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-colors"
                >
                  <div className="font-bold text-accent-gold">Phase {phaseNum}</div>
                  <div className="text-sm text-gray-300">{info?.name}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-game-bg">
      {/* Error toast */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}

      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-accent-gold">Phase 10</h1>
          <span className="text-sm text-gray-400">
            Room: {roomCode}
          </span>
          <span className="text-sm text-gray-400">
            Round {game?.roundNumber}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowScoreboard(!showScoreboard)}
            className="btn-secondary text-sm py-2"
          >
            Scores
          </button>
          <button
            onClick={onLeaveRoom}
            className="text-red-400 hover:text-red-300 text-sm"
          >
            Leave
          </button>
        </div>
      </header>

      {/* Scoreboard overlay */}
      {showScoreboard && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center" onClick={() => setShowScoreboard(false)}>
          <div onClick={e => e.stopPropagation()}>
            <ScoreBoard players={game?.players} playerId={playerId} />
          </div>
        </div>
      )}

      {/* Main game area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-auto">
        {/* Left sidebar - Other players */}
        <div className="lg:w-64 flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto">
          {otherPlayers.map(player => (
            <OtherPlayerPanel
              key={player.id}
              player={player}
              isCurrentTurn={game?.currentPlayerId === player.id}
              cpuThinking={cpuThinking === player.id}
              myPhaseCompleted={hasCompletedPhase}
              onHit={handleHit}
              selectedCard={selectedCards[0]}
            />
          ))}
        </div>

        {/* Center - Game table */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          {/* Current phase display */}
          <PhaseDisplay
            phaseNumber={currentPlayer?.currentPhase}
            phaseInfo={myPhaseInfo}
            completed={hasCompletedPhase}
            laidDownPhase={currentPlayer?.laidDownPhase}
          />

          {/* Draw/Discard piles */}
          <DrawDiscardPiles
            deck={game?.deck}
            canDraw={canDraw}
            onDrawFromDeck={() => handleDraw('deck')}
            onDrawFromDiscard={() => handleDraw('discard')}
          />

          {/* Turn indicator */}
          <div className={`
            px-6 py-3 rounded-lg text-center
            ${isMyTurn ? 'bg-accent-gold/20 text-accent-gold current-turn' : 'bg-white/5 text-gray-400'}
          `}>
            {isMyTurn ? (
              <span>
                {turnPhase === 'draw' ? 'Draw a card to start your turn' :
                  hasCompletedPhase ? 'Play cards on phases or discard to end turn' :
                    'Lay down your phase or discard to end turn'}
              </span>
            ) : (
              <span>
                {cpuThinking ? (
                  <span className="thinking-dots">
                    {game?.players?.find(p => p.id === game?.currentPlayerId)?.name} is thinking
                    <span>.</span><span>.</span><span>.</span>
                  </span>
                ) : (
                  `${game?.players?.find(p => p.id === game?.currentPlayerId)?.name}'s turn`
                )}
              </span>
            )}
          </div>
        </div>

        {/* Right sidebar - Actions */}
        <div className="lg:w-64 flex flex-col gap-4">
          {/* Phase builder button */}
          {canPlay && !hasCompletedPhase && (
            <button
              onClick={() => setShowPhaseBuilder(true)}
              className="btn-primary"
            >
              Build Phase {currentPlayer?.currentPhase}
            </button>
          )}

          {/* Selected card actions */}
          {canPlay && selectedCards.length === 1 && (
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-3">Selected card:</p>
              <div className="flex justify-center mb-4">
                <Card card={selectedCards[0]} small />
              </div>

              <button
                onClick={() => handleDiscard(selectedCards[0].id)}
                className="btn-secondary w-full"
              >
                Discard
              </button>
            </div>
          )}

          {/* Quick discard when no selection */}
          {canPlay && selectedCards.length === 0 && (
            <p className="text-sm text-gray-400 text-center">
              Select a card to discard
            </p>
          )}
        </div>
      </div>

      {/* Player's hand */}
      <div className="border-t border-white/10 p-4 bg-white/5">
        <PlayerHand
          cards={currentPlayer?.hand || []}
          selectedCards={selectedCards}
          onCardSelect={setSelectedCards}
          disabled={!canPlay}
          canSelect={canPlay}
          maxSelect={1}
        />
      </div>

      {/* Phase builder modal */}
      {showPhaseBuilder && (
        <PhaseValidation
          phaseNumber={currentPlayer?.currentPhase}
          phaseInfo={myPhaseInfo}
          hand={currentPlayer?.hand || []}
          onSubmit={handleLayPhase}
          onCancel={() => setShowPhaseBuilder(false)}
        />
      )}
    </div>
  );
}

// Other player panel component
function OtherPlayerPanel({
  player,
  isCurrentTurn,
  cpuThinking,
  myPhaseCompleted,
  onHit,
  selectedCard
}) {
  const phaseInfo = getPhaseInfo(player.currentPhase);

  return (
    <div
      className={`
        bg-white/5 rounded-lg p-4 min-w-[200px] lg:min-w-0
        ${isCurrentTurn ? 'ring-2 ring-accent-gold' : ''}
      `}
    >
      {/* Player info */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`
            w-10 h-10 rounded-full flex items-center justify-center font-bold
            ${player.isComputer ? 'bg-purple-600' : 'bg-blue-600'}
          `}
        >
          {player.isComputer ? 'CPU' : player.name[0].toUpperCase()}
        </div>
        <div>
          <div className="font-medium">{player.name}</div>
          <div className="text-xs text-gray-400">
            Phase {player.currentPhase}
            {player.completedPhaseThisRound && ' ✓'}
          </div>
        </div>
      </div>

      {/* CPU thinking indicator */}
      {cpuThinking && (
        <div className="text-sm text-accent-gold mb-2 thinking-dots">
          Thinking<span>.</span><span>.</span><span>.</span>
        </div>
      )}

      {/* Cards in hand */}
      <div className="text-sm text-gray-400 mb-2">
        {player.handCount} cards in hand
      </div>

      {/* Laid down phase */}
      {player.laidDownPhase && (
        <div className="mt-3 space-y-2">
          <div className="text-xs text-gray-400">Completed Phase:</div>
          {player.laidDownPhase.map((group, groupIdx) => (
            <div key={groupIdx} className="flex flex-wrap gap-1">
              {group.map(card => (
                <MiniCard key={card.id} card={card} />
              ))}
              {/* Hit button */}
              {myPhaseCompleted && selectedCard && (
                <button
                  onClick={() => onHit(player.id, selectedCard.id, groupIdx)}
                  className="w-6 h-8 border border-dashed border-accent-gold rounded flex items-center justify-center text-accent-gold text-xs hover:bg-accent-gold/10"
                  title="Hit here"
                >
                  +
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Score */}
      <div className="mt-3 text-right">
        <span className="score-badge">{player.score} pts</span>
      </div>
    </div>
  );
}

export default GameBoard;
