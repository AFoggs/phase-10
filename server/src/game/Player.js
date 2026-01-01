const { nanoid } = require('nanoid');
const { calculateHandPoints } = require('./phaseLogic');

class Player {
  constructor(id, name, isComputer = false) {
    this.id = id || nanoid(8);
    this.name = name;
    this.isComputer = isComputer;
    this.hand = [];
    this.currentPhase = 1;
    this.completedPhaseThisRound = false;
    this.laidDownPhase = null; // The phase cards laid on the table
    this.score = 0;
    this.skipCount = 0; // Number of turns to skip (can stack)
    this.connected = true;
    this.hasDrawnThisTurn = false;
  }

  // Add a card to hand
  addCard(card) {
    this.hand.push(card);
  }

  // Add multiple cards to hand
  addCards(cards) {
    this.hand.push(...cards);
  }

  // Remove a card from hand by ID
  removeCard(cardId) {
    const index = this.hand.findIndex(c => c.id === cardId);
    if (index === -1) {
      return null;
    }
    return this.hand.splice(index, 1)[0];
  }

  // Remove multiple cards from hand
  removeCards(cardIds) {
    const removed = [];
    for (const cardId of cardIds) {
      const card = this.removeCard(cardId);
      if (card) {
        removed.push(card);
      }
    }
    return removed;
  }

  // Get a card from hand without removing it
  getCard(cardId) {
    return this.hand.find(c => c.id === cardId) || null;
  }

  // Check if player has a card
  hasCard(cardId) {
    return this.hand.some(c => c.id === cardId);
  }

  // Get all cards of a specific type
  getCardsByType(type) {
    return this.hand.filter(c => c.type === type);
  }

  // Get all cards of a specific color
  getCardsByColor(color) {
    return this.hand.filter(c => c.color === color);
  }

  // Get all cards with a specific value
  getCardsByValue(value) {
    return this.hand.filter(c => c.value === value);
  }

  // Lay down phase (store the phase cards)
  layDownPhase(phaseGroups) {
    this.laidDownPhase = phaseGroups;
    this.completedPhaseThisRound = true;
  }

  // Add a card to the laid down phase (hitting)
  hitOnPhase(groupIndex, card) {
    if (!this.laidDownPhase || !this.laidDownPhase[groupIndex]) {
      return false;
    }
    this.laidDownPhase[groupIndex].push(card);
    return true;
  }

  // Calculate score from remaining hand
  calculateRemainingScore() {
    return calculateHandPoints(this.hand);
  }

  // Add points to total score
  addScore(points) {
    this.score += points;
  }

  // Advance to next phase
  advancePhase() {
    if (this.completedPhaseThisRound) {
      this.currentPhase++;
    }
  }

  // Reset for new round
  resetForNewRound() {
    this.hand = [];
    this.completedPhaseThisRound = false;
    this.laidDownPhase = null;
    this.skipCount = 0;
    this.hasDrawnThisTurn = false;
  }

  // Get hand count (for other players to see)
  getHandCount() {
    return this.hand.length;
  }

  // Sort hand by color then value
  sortHand() {
    this.hand.sort((a, b) => {
      // Wilds and skips at the end
      if (a.type !== 'number' && b.type === 'number') return 1;
      if (a.type === 'number' && b.type !== 'number') return -1;
      if (a.type !== 'number' && b.type !== 'number') {
        return a.type === 'wild' ? -1 : 1;
      }

      // Sort by color first
      const colorOrder = ['red', 'blue', 'green', 'yellow'];
      const colorDiff = colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color);
      if (colorDiff !== 0) return colorDiff;

      // Then by value
      return a.value - b.value;
    });
  }

  // Get public state (for sending to other players)
  getPublicState() {
    return {
      id: this.id,
      name: this.name,
      isComputer: this.isComputer,
      handCount: this.hand.length,
      currentPhase: this.currentPhase,
      completedPhaseThisRound: this.completedPhaseThisRound,
      laidDownPhase: this.laidDownPhase,
      score: this.score,
      skipCount: this.skipCount,
      connected: this.connected
    };
  }

  // Get full state (for the player themselves)
  getFullState() {
    return {
      ...this.getPublicState(),
      hand: [...this.hand],
      hasDrawnThisTurn: this.hasDrawnThisTurn
    };
  }

  // Set phase directly (for Choice/Chaos modes)
  setPhase(phaseNumber) {
    this.currentPhase = phaseNumber;
  }
}

module.exports = Player;
