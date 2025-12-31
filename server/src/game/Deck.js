const { nanoid } = require('nanoid');

class Deck {
  constructor() {
    this.cards = [];
    this.discardPile = [];
    this.initializeDeck();
    this.shuffle();
  }

  initializeDeck() {
    this.cards = [];
    const colors = ['red', 'blue', 'green', 'yellow'];

    // Create 96 numbered cards (2 of each number 1-12 in 4 colors)
    for (const color of colors) {
      for (let value = 1; value <= 12; value++) {
        // Two of each number per color
        for (let i = 0; i < 2; i++) {
          this.cards.push({
            id: nanoid(8),
            type: 'number',
            value: value,
            color: color
          });
        }
      }
    }

    // Add 8 Wild cards
    for (let i = 0; i < 8; i++) {
      this.cards.push({
        id: nanoid(8),
        type: 'wild',
        value: null,
        color: null
      });
    }

    // Add 4 Skip cards
    for (let i = 0; i < 4; i++) {
      this.cards.push({
        id: nanoid(8),
        type: 'skip',
        value: null,
        color: null
      });
    }
  }

  shuffle() {
    // Fisher-Yates shuffle
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  draw() {
    if (this.cards.length === 0) {
      this.reshuffleDiscardPile();
    }

    if (this.cards.length === 0) {
      return null; // No cards available
    }

    return this.cards.pop();
  }

  drawFromDiscard() {
    if (this.discardPile.length === 0) {
      return null;
    }
    return this.discardPile.pop();
  }

  discard(card) {
    this.discardPile.push(card);
  }

  getTopDiscard() {
    if (this.discardPile.length === 0) {
      return null;
    }
    return this.discardPile[this.discardPile.length - 1];
  }

  reshuffleDiscardPile() {
    if (this.discardPile.length <= 1) {
      return; // Keep at least the top card in discard
    }

    // Keep the top card
    const topCard = this.discardPile.pop();

    // Move remaining discard pile to draw pile
    this.cards = [...this.discardPile];
    this.discardPile = [topCard];

    // Shuffle the new draw pile
    this.shuffle();
  }

  dealCards(count) {
    const hand = [];
    for (let i = 0; i < count; i++) {
      const card = this.draw();
      if (card) {
        hand.push(card);
      }
    }
    return hand;
  }

  getDrawPileCount() {
    return this.cards.length;
  }

  getDiscardPileCount() {
    return this.discardPile.length;
  }

  // Initialize the discard pile with one card from the draw pile
  initializeDiscardPile() {
    let card = this.draw();
    // Don't start with a Skip or Wild on discard pile
    while (card && (card.type === 'skip' || card.type === 'wild')) {
      // Put it back somewhere in the deck
      this.cards.unshift(card);
      this.shuffle();
      card = this.draw();
    }
    if (card) {
      this.discardPile.push(card);
    }
  }

  // Reset the deck for a new round
  reset() {
    this.initializeDeck();
    this.shuffle();
    this.discardPile = [];
  }

  // Get state for sending to clients (hide exact deck contents)
  getState() {
    return {
      drawPileCount: this.cards.length,
      discardPile: [...this.discardPile],
      topDiscard: this.getTopDiscard()
    };
  }
}

module.exports = Deck;
