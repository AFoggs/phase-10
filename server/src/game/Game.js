const Deck = require('./Deck');
const Player = require('./Player');
const CPUPlayer = require('./CPUPlayer');
const { validatePhase, canHitOnPhase, getPhaseInfo, getPhasesForMode, calculateHandPoints } = require('./phaseLogic');

class Game {
  constructor(settings = {}) {
    this.id = settings.id || null;
    this.mode = settings.mode || 'normal10'; // normal10, choice10, chaos10, normal20, choice20, chaos20, normal30, choice30, chaos30
    this.players = [];
    this.deck = null;
    this.currentPlayerIndex = 0;
    this.roundNumber = 1;
    this.phase = 'waiting'; // waiting, playing, roundEnd, gameEnd
    this.turnPhase = 'draw'; // draw, play, discard
    this.winner = null;
    this.lastAction = null;
    this.cpuDifficulty = settings.cpuDifficulty || 'medium';

    // For Choice mode - pending phase selections
    this.pendingPhaseSelections = new Map();

    // For Chaos mode - assigned phases per round
    this.chaosPhases = new Map();
  }

  // Add a player to the game
  addPlayer(player) {
    if (this.players.length >= 6) {
      return { success: false, error: 'Game is full' };
    }
    this.players.push(player);
    return { success: true };
  }

  // Add a CPU player
  addCPU(name) {
    if (this.players.length >= 6) {
      return { success: false, error: 'Game is full' };
    }

    const cpu = new CPUPlayer(null, name || `CPU ${this.players.length + 1}`, this.cpuDifficulty);
    this.players.push(cpu);
    return { success: true, cpu };
  }

  // Remove a player
  removePlayer(playerId) {
    const index = this.players.findIndex(p => p.id === playerId);
    if (index === -1) {
      return { success: false, error: 'Player not found' };
    }
    this.players.splice(index, 1);
    return { success: true };
  }

  // Get max phase for current game mode
  getMaxPhase() {
    if (this.mode.includes('30')) return 30;
    if (this.mode.includes('20')) return 20;
    return 10;
  }

  // Start the game
  startGame() {
    if (this.players.length < 2) {
      return { success: false, error: 'Need at least 2 players' };
    }

    this.deck = new Deck();
    this.phase = 'playing';
    this.roundNumber = 1;
    this.currentPlayerIndex = 0;
    this.turnPhase = 'draw';

    // Deal cards to all players
    for (const player of this.players) {
      player.resetForNewRound();
      const cards = this.deck.dealCards(10);
      player.addCards(cards);
      player.sortHand();
    }

    // Initialize discard pile
    this.deck.initializeDiscardPile();

    // For Chaos mode, assign random phases
    if (this.mode.startsWith('chaos')) {
      this.assignChaosPhases();
    }

    this.lastAction = { type: 'gameStarted', roundNumber: this.roundNumber };

    return { success: true };
  }

  // Assign random phases for Chaos mode
  assignChaosPhases() {
    const maxPhase = this.getMaxPhase();

    for (const player of this.players) {
      const randomPhase = Math.floor(Math.random() * maxPhase) + 1;
      this.chaosPhases.set(player.id, randomPhase);
      player.setPhase(randomPhase);
    }
  }

  // Select phase for Choice mode
  selectPhase(playerId, phaseNumber) {
    if (!this.mode.startsWith('choice')) {
      return { success: false, error: 'Not in Choice mode' };
    }

    const availablePhases = getPhasesForMode(this.mode);
    if (!availablePhases.includes(phaseNumber)) {
      return { success: false, error: 'Invalid phase number' };
    }

    const player = this.players.find(p => p.id === playerId);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    // Check if phase was already completed
    if (player.completedPhases && player.completedPhases.includes(phaseNumber)) {
      return { success: false, error: 'Phase already completed' };
    }

    player.setPhase(phaseNumber);
    this.pendingPhaseSelections.delete(playerId);

    return { success: true };
  }

  // Get current player
  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  // Draw a card
  drawCard(playerId, source = 'deck') {
    if (this.phase !== 'playing') {
      return { success: false, error: 'Game not in playing phase' };
    }

    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer.id !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    if (this.turnPhase !== 'draw') {
      return { success: false, error: 'Already drew a card this turn' };
    }

    if (currentPlayer.isSkipped) {
      currentPlayer.isSkipped = false;
      this.advanceTurn();
      return { success: true, skipped: true };
    }

    let card;
    if (source === 'discard') {
      card = this.deck.drawFromDiscard();
      if (!card) {
        return { success: false, error: 'Discard pile is empty' };
      }
    } else {
      card = this.deck.draw();
      if (!card) {
        return { success: false, error: 'Deck is empty' };
      }
    }

    currentPlayer.addCard(card);
    currentPlayer.hasDrawnThisTurn = true;
    this.turnPhase = 'play';

    this.lastAction = {
      type: 'draw',
      playerId,
      source,
      cardId: card.id
    };

    return { success: true, card };
  }

  // Lay down a phase
  layDownPhase(playerId, cardGroups) {
    if (this.phase !== 'playing') {
      return { success: false, error: 'Game not in playing phase' };
    }

    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer.id !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    if (this.turnPhase === 'draw') {
      return { success: false, error: 'Must draw a card first' };
    }

    if (currentPlayer.completedPhaseThisRound) {
      return { success: false, error: 'Already laid down phase this round' };
    }

    // Validate the phase
    const phaseNumber = currentPlayer.currentPhase;
    const result = validatePhase(cardGroups, phaseNumber);

    if (!result.valid) {
      return { success: false, error: result.reason };
    }

    // Verify player has all these cards
    const allCardIds = cardGroups.flat().map(c => c.id);
    for (const cardId of allCardIds) {
      if (!currentPlayer.hasCard(cardId)) {
        return { success: false, error: 'You do not have one of the specified cards' };
      }
    }

    // Remove cards from hand and lay them down
    currentPlayer.removeCards(allCardIds);
    currentPlayer.layDownPhase(cardGroups);

    this.lastAction = {
      type: 'layPhase',
      playerId,
      phaseNumber,
      cardGroups
    };

    return { success: true, phaseNumber };
  }

  // Hit on another player's phase
  hitCard(playerId, targetPlayerId, cardId, groupIndex) {
    if (this.phase !== 'playing') {
      return { success: false, error: 'Game not in playing phase' };
    }

    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer.id !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    if (this.turnPhase === 'draw') {
      return { success: false, error: 'Must draw a card first' };
    }

    if (!currentPlayer.completedPhaseThisRound) {
      return { success: false, error: 'Must complete your phase before hitting' };
    }

    const targetPlayer = this.players.find(p => p.id === targetPlayerId);
    if (!targetPlayer) {
      return { success: false, error: 'Target player not found' };
    }

    if (!targetPlayer.laidDownPhase) {
      return { success: false, error: 'Target player has not laid down a phase' };
    }

    const card = currentPlayer.getCard(cardId);
    if (!card) {
      return { success: false, error: 'Card not in your hand' };
    }

    const targetGroup = targetPlayer.laidDownPhase[groupIndex];
    if (!targetGroup) {
      return { success: false, error: 'Invalid group index' };
    }

    // Get the requirement type for this group
    const targetPhaseInfo = getPhaseInfo(targetPlayer.currentPhase);
    const groupType = targetPhaseInfo.requirements[groupIndex];

    // Validate the hit
    const hitResult = canHitOnPhase(card, targetGroup, groupType);
    if (!hitResult.canHit) {
      return { success: false, error: hitResult.reason };
    }

    // Execute the hit
    currentPlayer.removeCard(cardId);
    targetPlayer.hitOnPhase(groupIndex, card);

    this.lastAction = {
      type: 'hit',
      playerId,
      targetPlayerId,
      cardId,
      groupIndex
    };

    return { success: true };
  }

  // Discard a card and end turn
  discardCard(playerId, cardId) {
    if (this.phase !== 'playing') {
      return { success: false, error: 'Game not in playing phase' };
    }

    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer.id !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    if (this.turnPhase === 'draw') {
      return { success: false, error: 'Must draw a card first' };
    }

    const card = currentPlayer.removeCard(cardId);
    if (!card) {
      return { success: false, error: 'Card not in your hand' };
    }

    this.deck.discard(card);

    // Check for Skip card
    if (card.type === 'skip') {
      const nextPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
      this.players[nextPlayerIndex].isSkipped = true;
    }

    this.lastAction = {
      type: 'discard',
      playerId,
      cardId,
      cardType: card.type
    };

    // Check if player won the round
    if (currentPlayer.hand.length === 0) {
      return this.endRound(playerId);
    }

    // Advance to next turn
    this.advanceTurn();

    return { success: true, turnEnded: true };
  }

  // Advance to next player
  advanceTurn() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    this.turnPhase = 'draw';

    const nextPlayer = this.getCurrentPlayer();
    nextPlayer.hasDrawnThisTurn = false;

    // If next player is skipped, skip them
    if (nextPlayer.isSkipped) {
      nextPlayer.isSkipped = false;
      this.lastAction = {
        type: 'skipped',
        playerId: nextPlayer.id
      };
      this.advanceTurn();
      return;
    }

    // If next player is CPU, trigger their turn
    if (nextPlayer.isComputer) {
      this.lastAction = {
        type: 'cpuTurn',
        playerId: nextPlayer.id
      };
    }
  }

  // End the current round
  endRound(winnerId) {
    this.phase = 'roundEnd';

    // Calculate scores
    for (const player of this.players) {
      const points = calculateHandPoints(player.hand);
      player.addScore(points);

      // Advance phase for players who completed it
      if (player.completedPhaseThisRound) {
        player.advancePhase();
      }
    }

    // Check for game winner
    const maxPhase = this.getMaxPhase();
    const gameWinner = this.players.find(p => p.currentPhase > maxPhase);

    if (gameWinner) {
      this.phase = 'gameEnd';
      this.winner = gameWinner.id;

      this.lastAction = {
        type: 'gameEnd',
        winnerId: gameWinner.id,
        scores: this.players.map(p => ({
          id: p.id,
          name: p.name,
          score: p.score,
          currentPhase: p.currentPhase
        }))
      };

      return {
        success: true,
        roundEnded: true,
        gameEnded: true,
        winnerId: gameWinner.id
      };
    }

    this.lastAction = {
      type: 'roundEnd',
      roundWinnerId: winnerId,
      scores: this.players.map(p => ({
        id: p.id,
        name: p.name,
        score: p.score,
        currentPhase: p.currentPhase,
        completedPhase: p.completedPhaseThisRound
      }))
    };

    return {
      success: true,
      roundEnded: true,
      gameEnded: false,
      roundWinnerId: winnerId
    };
  }

  // Start a new round
  startNewRound() {
    if (this.phase !== 'roundEnd') {
      return { success: false, error: 'Not in round end phase' };
    }

    this.roundNumber++;
    this.deck.reset();

    // Reset all players for new round
    for (const player of this.players) {
      player.resetForNewRound();
      const cards = this.deck.dealCards(10);
      player.addCards(cards);
      player.sortHand();
    }

    // Initialize discard pile
    this.deck.initializeDiscardPile();

    // For Chaos mode, assign new random phases
    if (this.mode.startsWith('chaos')) {
      this.assignChaosPhases();
    }

    // For Choice mode, wait for phase selections
    if (this.mode.startsWith('choice')) {
      this.phase = 'phaseSelection';
      for (const player of this.players) {
        if (!player.isComputer) {
          this.pendingPhaseSelections.set(player.id, true);
        } else {
          // CPU auto-selects phase
          const availablePhases = getPhasesForMode(this.mode);
          const selectedPhase = player.selectPhase(availablePhases);
          player.setPhase(selectedPhase);
        }
      }

      // If no human players need to select, continue
      if (this.pendingPhaseSelections.size === 0) {
        this.phase = 'playing';
      }
    } else {
      this.phase = 'playing';
    }

    this.currentPlayerIndex = 0;
    this.turnPhase = 'draw';

    this.lastAction = {
      type: 'newRound',
      roundNumber: this.roundNumber
    };

    return { success: true };
  }

  // Execute CPU turn
  async executeCPUTurn(cpuId) {
    const cpu = this.players.find(p => p.id === cpuId);
    if (!cpu || !cpu.isComputer) {
      return { success: false, error: 'Not a CPU player' };
    }

    const actions = [];

    // 1. Draw
    const topDiscard = this.deck.getTopDiscard();
    const drawSource = cpu.selectCardToDraw(topDiscard);
    const drawResult = this.drawCard(cpuId, drawSource);
    if (drawResult.skipped) {
      return { success: true, actions: [{ type: 'skipped' }], skipped: true };
    }
    actions.push({ type: 'draw', source: drawSource, card: drawResult.card });

    // 2. Try to lay down phase
    if (!cpu.completedPhaseThisRound) {
      const phaseGroups = cpu.attemptPhase();
      if (phaseGroups) {
        const phaseResult = this.layDownPhase(cpuId, phaseGroups);
        if (phaseResult.success) {
          actions.push({ type: 'layPhase', groups: phaseGroups });
        }
      }
    }

    // 3. Try to hit
    if (cpu.completedPhaseThisRound) {
      const hits = cpu.selectCardToHit(this.players);
      for (const hit of hits) {
        if (cpu.hasCard(hit.card.id)) {
          const hitResult = this.hitCard(cpuId, hit.targetPlayerId, hit.card.id, hit.groupIndex);
          if (hitResult.success) {
            actions.push({
              type: 'hit',
              card: hit.card,
              targetPlayerId: hit.targetPlayerId,
              groupIndex: hit.groupIndex
            });
          }
        }
      }
    }

    // 4. Discard
    const discardCard = cpu.selectCardToDiscard();
    if (discardCard) {
      const discardResult = this.discardCard(cpuId, discardCard.id);
      actions.push({
        type: 'discard',
        card: discardCard,
        roundEnded: discardResult.roundEnded,
        gameEnded: discardResult.gameEnded
      });
    }

    return { success: true, actions };
  }

  // Get the full game state for a specific player
  getStateForPlayer(playerId) {
    const player = this.players.find(p => p.id === playerId);

    return {
      id: this.id,
      mode: this.mode,
      phase: this.phase,
      roundNumber: this.roundNumber,
      currentPlayerIndex: this.currentPlayerIndex,
      currentPlayerId: this.getCurrentPlayer()?.id,
      turnPhase: this.turnPhase,
      winner: this.winner,
      maxPhase: this.getMaxPhase(),
      lastAction: this.lastAction,

      // Player's own full state
      you: player ? player.getFullState() : null,

      // Other players' public state
      players: this.players.map(p => {
        if (p.id === playerId) {
          return p.getFullState();
        }
        return p.getPublicState();
      }),

      // Deck state
      deck: this.deck ? this.deck.getState() : null,

      // Pending phase selections (for Choice mode)
      pendingPhaseSelections: Array.from(this.pendingPhaseSelections.keys()),

      // Chaos phases (for Chaos mode)
      chaosPhases: Object.fromEntries(this.chaosPhases)
    };
  }

  // Get public game state (for spectators)
  getPublicState() {
    return {
      id: this.id,
      mode: this.mode,
      phase: this.phase,
      roundNumber: this.roundNumber,
      currentPlayerIndex: this.currentPlayerIndex,
      currentPlayerId: this.getCurrentPlayer()?.id,
      turnPhase: this.turnPhase,
      winner: this.winner,
      maxPhase: this.getMaxPhase(),
      lastAction: this.lastAction,
      players: this.players.map(p => p.getPublicState()),
      deck: this.deck ? this.deck.getState() : null
    };
  }
}

module.exports = Game;
