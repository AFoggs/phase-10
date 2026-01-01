import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import PlayerHand from './PlayerHand';
import Card, { MiniCard, ItemTypes } from './Card';
import PhaseBuilder from './PhaseBuilder';
import DrawDiscardPiles from './DrawDiscardPiles';
import ScoreBoard from './ScoreBoard';
import { getPhaseInfo, GAME_MODES, getPhasesForMode } from '../utils/phaseDefinitions';
import { useGameSounds } from './AudioPlayer';
import { canHitOnPhase } from '../utils/cardHelpers';

function GameBoard({
  game,
  playerId,
  roomCode,
  room,
  cpuThinking,
  skipNotification: externalSkipNotification,
  onClearSkipNotification,
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
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [showPhaseSelector, setShowPhaseSelector] = useState(false);
  const [showSkipTargetSelector, setShowSkipTargetSelector] = useState(false);
  const [pendingSkipCard, setPendingSkipCard] = useState(null);
  const [notification, setNotification] = useState(null);
  const [lastDrawnCardId, setLastDrawnCardId] = useState(null);
  const [sortMode, setSortMode] = useState('color');

  // Phase builder state - persistent groups for drag-and-drop phase building
  const [phaseBuilderGroups, setPhaseBuilderGroups] = useState([]);

  // Sound effects
  const { playSound } = useGameSounds();
  const prevTurnPlayerId = useRef(game?.currentPlayerId);

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

  // Initialize phase builder groups when phase info changes
  React.useEffect(() => {
    if (myPhaseInfo && !hasCompletedPhase) {
      setPhaseBuilderGroups(myPhaseInfo.requirements.map(() => []));
    } else {
      setPhaseBuilderGroups([]);
    }
  }, [myPhaseInfo, hasCompletedPhase, game?.roundNumber]);

  // Cards currently in the phase builder
  const cardsInBuilder = useMemo(() => {
    const cardIds = new Set();
    phaseBuilderGroups.forEach(group => {
      group.forEach(card => cardIds.add(card.id));
    });
    return cardIds;
  }, [phaseBuilderGroups]);

  // Cards available for hand display (excluding those in builder)
  const availableHandCards = useMemo(() => {
    return (currentPlayer?.hand || []).filter(c => !cardsInBuilder.has(c.id));
  }, [currentPlayer?.hand, cardsInBuilder]);

  // Phase builder functions
  const addCardToPhaseBuilder = useCallback((card, groupIndex) => {
    setPhaseBuilderGroups(prev => prev.map((group, idx) => {
      if (idx === groupIndex) {
        // Add to this group if not already there
        if (!group.find(c => c.id === card.id)) {
          return [...group, card];
        }
        return group;
      }
      // Remove from other groups (in case card was dragged between groups)
      return group.filter(c => c.id !== card.id);
    }));
    // Clear selection when card is added to builder
    setSelectedCards([]);
  }, []);

  const removeCardFromPhaseBuilder = useCallback((cardId, groupIndex) => {
    setPhaseBuilderGroups(prev => prev.map((group, idx) => {
      if (idx === groupIndex) {
        return group.filter(c => c.id !== cardId);
      }
      return group;
    }));
  }, []);

  const clearPhaseBuilder = useCallback(() => {
    if (myPhaseInfo) {
      setPhaseBuilderGroups(myPhaseInfo.requirements.map(() => []));
    }
  }, [myPhaseInfo]);

  // Handle phase out (submit the phase from builder)
  const handlePhaseOut = useCallback(async () => {
    try {
      setError(null);
      await onLayDownPhase(phaseBuilderGroups);
      playSound('phaseComplete');
      setPhaseBuilderGroups([]);
      setSelectedCards([]);
    } catch (err) {
      setError(err);
    }
  }, [onLayDownPhase, phaseBuilderGroups, playSound]);

  // Handle drawing a card
  const handleDraw = useCallback(async (source) => {
    try {
      setError(null);
      const result = await onDrawCard(source);
      // Track the drawn card for highlighting
      if (result?.card?.id) {
        setLastDrawnCardId(result.card.id);
        playSound('draw');
        // Clear the highlight after a few seconds
        setTimeout(() => setLastDrawnCardId(null), 3000);
      }
    } catch (err) {
      setError(err);
    }
  }, [onDrawCard, playSound]);

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

  // Handle discarding (works with card ID or card object for drag-and-drop)
  const handleDiscard = useCallback(async (cardOrId, targetPlayerId = null) => {
    // Support both card object (from drag-and-drop) and card ID
    const card = typeof cardOrId === 'object' ? cardOrId : currentPlayer?.hand?.find(c => c.id === cardOrId);
    const cardId = typeof cardOrId === 'object' ? cardOrId.id : cardOrId;

    if (!card) {
      setError('Card not found');
      return;
    }

    // Check if it's a skip card and needs target selection
    if (card.type === 'skip' && !targetPlayerId) {
      // Show skip target selector
      setPendingSkipCard(card);
      setShowSkipTargetSelector(true);
      return;
    }

    try {
      setError(null);
      await onDiscardCard(cardId, targetPlayerId);
      playSound('discard');
      setSelectedCards([]);
      setPendingSkipCard(null);
      setShowSkipTargetSelector(false);
    } catch (err) {
      setError(err);
    }
  }, [onDiscardCard, currentPlayer, playSound]);

  // Handle skip target selection
  const handleSkipTargetSelect = useCallback(async (targetId) => {
    if (!pendingSkipCard) return;
    try {
      setError(null);
      await onDiscardCard(pendingSkipCard.id, targetId);
      playSound('discard');
      setSelectedCards([]);
      setPendingSkipCard(null);
      setShowSkipTargetSelector(false);
    } catch (err) {
      setError(err);
    }
  }, [onDiscardCard, pendingSkipCard, playSound]);

  // Cancel skip target selection
  const handleCancelSkipTarget = useCallback(() => {
    setPendingSkipCard(null);
    setShowSkipTargetSelector(false);
  }, []);

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

  // Play sound when it becomes your turn
  React.useEffect(() => {
    const currentTurnId = game?.currentPlayerId;
    // Only play sound when turn changes to this player
    if (currentTurnId === playerId && prevTurnPlayerId.current !== playerId && game?.phase === 'playing') {
      playSound('yourTurn');
    }
    prevTurnPlayerId.current = currentTurnId;
  }, [game?.currentPlayerId, playerId, playSound, game?.phase]);

  // Play sound when game ends
  React.useEffect(() => {
    if (game?.phase === 'gameEnd') {
      if (game?.winner === playerId) {
        playSound('gameWin');
      }
    }
  }, [game?.phase, game?.winner, playerId, playSound]);

  // Watch for skip notifications from dedicated socket event
  React.useEffect(() => {
    if (!externalSkipNotification) return;

    const { skippedPlayerId, skippedPlayerName } = externalSkipNotification;
    const isMe = skippedPlayerId === playerId;

    if (isMe) {
      playSound('skipped');
    }

    setNotification({
      type: 'skip',
      skippedPlayerName: skippedPlayerName,
      isMe: isMe
    });

    // Clear the external notification after processing
    if (onClearSkipNotification) {
      // Use a small delay to ensure the notification is shown first
      setTimeout(() => onClearSkipNotification(), 100);
    }
  }, [externalSkipNotification, playerId, playSound, onClearSkipNotification]);

  // Clear notification after timeout
  React.useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

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

      {/* Skip notification - prominent banner for all players */}
      {notification && notification.type === 'skip' && (
        <div className={`
          fixed top-16 left-1/2 -translate-x-1/2 px-10 py-5 rounded-xl shadow-2xl z-50
          flex flex-col items-center gap-2 animate-bounce-in border-2
          ${notification.isMe
            ? 'bg-red-600 text-white border-red-400'
            : 'bg-gradient-to-r from-amber-500 to-orange-500 text-black border-amber-300'}
        `}>
          <span className="text-4xl">⏭️</span>
          <span className="font-black text-2xl tracking-wide">
            {notification.skippedPlayerName} has been SKIPPED!
          </span>
          {notification.isMe && (
            <span className="text-sm opacity-90">You lose your next turn</span>
          )}
        </div>
      )}

      {/* Header - responsive */}
      <header className="flex flex-wrap justify-between items-center p-2 sm:p-4 border-b border-white/10 gap-2">
        <div className="flex items-center gap-2 sm:gap-4">
          <h1 className="text-lg sm:text-xl font-bold text-accent-gold">Phase 10</h1>
          <span className="text-xs sm:text-sm text-gray-400 hidden sm:inline">
            Room: {roomCode}
          </span>
          <span className="text-xs sm:text-sm text-gray-400">
            R{game?.roundNumber}
          </span>
        </div>

        {/* Compact Phase Info - Right side of header */}
        <div className="flex items-center gap-2 sm:gap-4 order-3 sm:order-2 w-full sm:w-auto justify-center sm:justify-start mt-2 sm:mt-0">
          <div className={`
            flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
            ${hasCompletedPhase ? 'bg-green-600/20 border border-green-500' : 'bg-accent-gold/20 border border-accent-gold'}
          `}>
            <span className={hasCompletedPhase ? 'text-green-400' : 'text-accent-gold'}>
              Phase {currentPlayer?.currentPhase}
            </span>
            {hasCompletedPhase && <span className="text-green-400">✓</span>}
          </div>
          <div className="text-xs text-gray-400 hidden md:block max-w-[200px] truncate">
            {myPhaseInfo?.name}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 order-2 sm:order-3">
          <button
            onClick={() => setShowScoreboard(!showScoreboard)}
            className="btn-secondary text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-4"
          >
            Scores
          </button>
          <button
            onClick={onLeaveRoom}
            className="text-red-400 hover:text-red-300 text-xs sm:text-sm"
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
        {/* Left sidebar - Other players (horizontal scroll on mobile) */}
        <div className="lg:w-56 flex lg:flex-col gap-2 sm:gap-4 overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0">
          {otherPlayers.map(player => (
            <OtherPlayerPanel
              key={player.id}
              player={player}
              isCurrentTurn={game?.currentPlayerId === player.id}
              cpuThinking={cpuThinking === player.id}
              myPhaseCompleted={hasCompletedPhase}
              canHitEnabled={canPlay && hasCompletedPhase}
              onHit={handleHit}
              selectedCard={selectedCards[0]}
            />
          ))}
        </div>

        {/* Center - Game table */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4 sm:gap-6">
          {/* Phase Builder - center of the game area when not completed */}
          {!hasCompletedPhase && myPhaseInfo && phaseBuilderGroups.length > 0 && (
            <div className="w-full max-w-2xl px-2 sm:px-4">
              <PhaseBuilder
                phaseNumber={currentPlayer?.currentPhase}
                phaseInfo={myPhaseInfo}
                groups={phaseBuilderGroups}
                onAddCard={addCardToPhaseBuilder}
                onRemoveCard={removeCardFromPhaseBuilder}
                onClearAll={clearPhaseBuilder}
                onPhaseOut={handlePhaseOut}
                disabled={!canPlay}
              />
            </div>
          )}

          {/* Completed phase - for hitting on self */}
          {hasCompletedPhase && currentPlayer?.laidDownPhase && (
            <div className="w-full max-w-xl px-2 sm:px-4">
              <div className="bg-green-900/20 rounded-lg p-3 border border-green-500/30">
                <div className="text-center text-green-400 text-sm mb-2">
                  Your Completed Phase {currentPlayer?.currentPhase}
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {currentPlayer.laidDownPhase.map((group, groupIdx) => (
                    <HitDropZone
                      key={groupIdx}
                      playerId={playerId}
                      groupIndex={groupIdx}
                      group={group}
                      phaseInfo={myPhaseInfo}
                      canHitEnabled={canPlay && hasCompletedPhase}
                      checkCanHit={(card, grp, idx) => {
                        const groupType = myPhaseInfo.requirements[idx];
                        if (!groupType) return false;
                        const result = canHitOnPhase(card, grp, groupType);
                        return result.canHit;
                      }}
                      selectedCard={selectedCards[0]}
                      onHit={handleHit}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Draw/Discard piles */}
          <DrawDiscardPiles
            deck={game?.deck}
            canDraw={canDraw}
            canDiscard={canPlay}
            onDrawFromDeck={() => handleDraw('deck')}
            onDrawFromDiscard={() => handleDraw('discard')}
            onDiscard={handleDiscard}
          />

          {/* Turn indicator - compact on mobile */}
          <div className={`
            px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-center text-sm sm:text-base
            ${isMyTurn ? 'bg-accent-gold/20 text-accent-gold current-turn' : 'bg-white/5 text-gray-400'}
          `}>
            {isMyTurn ? (
              <span>
                {turnPhase === 'draw' ? 'Draw a card to start' :
                  hasCompletedPhase ? 'Hit on phases or discard' :
                    'Build your phase or discard'}
              </span>
            ) : (
              <span>
                {cpuThinking ? (
                  <span className="thinking-dots">
                    {game?.players?.find(p => p.id === game?.currentPlayerId)?.name} thinking
                    <span>.</span><span>.</span><span>.</span>
                  </span>
                ) : (
                  `${game?.players?.find(p => p.id === game?.currentPlayerId)?.name}'s turn`
                )}
              </span>
            )}
          </div>
        </div>

        {/* Right sidebar - Actions (hidden on mobile, show as overlay) */}
        <div className="hidden lg:flex lg:w-48 flex-col gap-4">
          {/* Selected card actions */}
          {canPlay && selectedCards.length === 1 && (
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-2">Selected:</p>
              <div className="flex justify-center mb-3">
                <Card card={selectedCards[0]} small />
              </div>

              <button
                onClick={() => handleDiscard(selectedCards[0].id)}
                className="btn-secondary w-full text-sm py-1.5"
              >
                Discard
              </button>
            </div>
          )}

          {/* Drag hints */}
          {canPlay && (
            <div className="text-xs text-gray-500 text-center space-y-1">
              <p>Drag cards to discard</p>
              {!hasCompletedPhase && <p>or to phase builder</p>}
              {hasCompletedPhase && <p>or hit on phases</p>}
            </div>
          )}
        </div>
      </div>

      {/* Player's hand - responsive padding */}
      <div className="border-t border-white/10 p-2 sm:p-4 bg-white/5">
        <PlayerHand
          cards={availableHandCards}
          selectedCards={selectedCards}
          onCardSelect={setSelectedCards}
          disabled={!canPlay}
          canSelect={canPlay}
          maxSelect={1}
          highlightCardId={lastDrawnCardId}
          onSortModeChange={setSortMode}
        />
      </div>

      {/* Skip target selector modal */}
      {showSkipTargetSelector && pendingSkipCard && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="text-2xl font-bold mb-4 text-accent-gold">Skip a Player</h2>
            <p className="text-gray-400 mb-6">
              Choose which player to skip. They will lose their next turn.
            </p>

            <div className="space-y-3">
              {otherPlayers.map(player => (
                <button
                  key={player.id}
                  onClick={() => handleSkipTargetSelect(player.id)}
                  className="w-full p-4 rounded-lg text-left transition-colors flex items-center gap-3 bg-white/5 hover:bg-white/10 cursor-pointer"
                >
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold
                      ${player.isComputer ? 'bg-purple-600' : 'bg-blue-600'}
                    `}
                  >
                    {player.isComputer ? 'CPU' : player.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      {player.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {player.skipCount > 0
                        ? `Skipped ${player.skipCount}x - ${player.handCount} cards`
                        : `${player.handCount} cards in hand`}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleCancelSkipTarget}
              className="btn-secondary w-full mt-6"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Other player panel component - compact for mobile
function OtherPlayerPanel({
  player,
  isCurrentTurn,
  cpuThinking,
  myPhaseCompleted,
  canHitEnabled,
  onHit,
  selectedCard
}) {
  const phaseInfo = getPhaseInfo(player.currentPhase);

  // Check if a card can hit on a specific group
  const checkCanHit = useCallback((card, group, groupIdx) => {
    if (!card || !phaseInfo) return false;
    const groupType = phaseInfo.requirements[groupIdx];
    if (!groupType) return false;
    const result = canHitOnPhase(card, group, groupType);
    return result.canHit;
  }, [phaseInfo]);

  return (
    <div
      className={`
        bg-white/5 rounded-lg p-2 sm:p-3 min-w-[150px] sm:min-w-[180px] lg:min-w-0 flex-shrink-0
        ${isCurrentTurn ? 'ring-2 ring-accent-gold' : ''}
      `}
    >
      {/* Player info - compact */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`
            w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold
            ${player.isComputer ? 'bg-purple-600' : 'bg-blue-600'}
          `}
        >
          {player.isComputer ? '🤖' : player.name[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{player.name}</div>
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <span>P{player.currentPhase}</span>
            {player.completedPhaseThisRound && <span className="text-green-400">✓</span>}
            <span className="text-gray-500">• {player.handCount}🃏</span>
          </div>
        </div>
        {/* Score badge inline */}
        <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded text-gray-300">
          {player.score}
        </span>
      </div>

      {/* CPU thinking indicator */}
      {cpuThinking && (
        <div className="text-xs text-accent-gold mb-1 thinking-dots">
          Thinking<span>.</span><span>.</span><span>.</span>
        </div>
      )}

      {/* Skip indicator */}
      {player.skipCount > 0 && (
        <div className="text-xs text-red-400 mb-1">
          ⏭️ Skipped x{player.skipCount}
        </div>
      )}

      {/* Laid down phase - with hit drop zones */}
      {player.laidDownPhase && (
        <div className="mt-1 space-y-1">
          <div className="text-xs text-gray-500">Completed:</div>
          {player.laidDownPhase.map((group, groupIdx) => (
            <HitDropZone
              key={groupIdx}
              playerId={player.id}
              groupIndex={groupIdx}
              group={group}
              phaseInfo={phaseInfo}
              canHitEnabled={canHitEnabled}
              checkCanHit={checkCanHit}
              selectedCard={selectedCard}
              onHit={onHit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Drop zone for hitting on a player's laid down phase group
function HitDropZone({
  playerId,
  groupIndex,
  group,
  phaseInfo,
  canHitEnabled,
  checkCanHit,
  selectedCard,
  onHit
}) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    canDrop: (item) => {
      if (!canHitEnabled || !phaseInfo) return false;
      return checkCanHit(item.card, group, groupIndex);
    },
    drop: (item) => {
      onHit(playerId, item.card.id, groupIndex);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  }), [canHitEnabled, phaseInfo, checkCanHit, group, groupIndex, playerId, onHit]);

  const canHitWithSelected = selectedCard && checkCanHit(selectedCard, group, groupIndex);

  return (
    <div
      ref={drop}
      className={`
        flex flex-wrap gap-1 p-1 rounded transition-all
        ${isOver && canDrop ? 'bg-green-500/30 ring-2 ring-green-400' : ''}
        ${canDrop && !isOver ? 'bg-green-500/10' : ''}
      `}
    >
      {group.map(card => (
        <MiniCard key={card.id} card={card} />
      ))}
      {/* Hit button - show if selected card can hit, or drop indicator */}
      {(canHitWithSelected || (isOver && canDrop)) && (
        <button
          onClick={() => selectedCard && onHit(playerId, selectedCard.id, groupIndex)}
          disabled={!canHitWithSelected}
          className={`
            w-6 h-8 border border-dashed rounded flex items-center justify-center text-xs transition-all
            ${isOver && canDrop
              ? 'border-green-400 text-green-400 bg-green-500/20 scale-110'
              : 'border-accent-gold text-accent-gold hover:bg-accent-gold/10'}
          `}
          title="Hit here"
        >
          +
        </button>
      )}
    </div>
  );
}

export default GameBoard;
