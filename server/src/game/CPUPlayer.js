const Player = require('./Player');
const { PHASES, validatePhase, canHitOnPhase, getPhaseInfo } = require('./phaseLogic');

class CPUPlayer extends Player {
  constructor(id, name, difficulty = 'medium') {
    super(id, name, true);
    this.difficulty = difficulty; // 'easy', 'medium', 'hard'
    this.discardedCards = []; // Track discarded cards for hard AI
  }

  // Track a card that was discarded (for hard AI)
  trackDiscard(card) {
    if (this.difficulty === 'hard') {
      this.discardedCards.push(card);
    }
  }

  // Decide whether to draw from deck or discard pile
  selectCardToDraw(topDiscard) {
    if (!topDiscard) {
      return 'deck';
    }

    // Skip cards CANNOT be picked up from discard pile (Phase 10 rules)
    if (topDiscard.type === 'skip') {
      return 'deck';
    }

    // Wild cards are always valuable - but add some randomness
    if (topDiscard.type === 'wild') {
      // Even humans sometimes don't take wilds (to hide their strategy)
      if (this.difficulty === 'easy' && Math.random() > 0.8) {
        return 'deck';
      }
      return 'discard';
    }

    const phaseInfo = getPhaseInfo(this.currentPhase);
    if (!phaseInfo) return 'deck';

    // Analyze if the discard card helps with current phase
    const helpfulness = this.analyzeCardHelpfulness(topDiscard);

    // Add human-like randomness - sometimes make suboptimal choices
    const randomFactor = Math.random();

    switch (this.difficulty) {
      case 'easy':
        // Easy CPU is mostly random, occasionally takes obviously good cards
        if (randomFactor > 0.7) {
          return 'deck'; // Often just draws from deck regardless
        }
        return helpfulness > 0.7 ? 'discard' : 'deck';

      case 'medium':
        // Medium CPU makes reasonable decisions with some randomness
        // Prefer deck unless card is quite helpful
        if (randomFactor > 0.85) {
          return 'deck'; // Sometimes ignores good cards
        }
        if (randomFactor < 0.1) {
          return helpfulness > 0.3 ? 'discard' : 'deck'; // Occasionally takes marginal cards
        }
        return helpfulness > 0.5 ? 'discard' : 'deck';

      case 'hard':
        // Hard CPU is strategic but not perfect
        if (randomFactor > 0.95) {
          return 'deck'; // Rarely makes mistakes
        }
        if (helpfulness > 0.4) return 'discard';
        // Consider blocking opponents occasionally
        if (this.shouldBlockOpponent(topDiscard) && randomFactor > 0.5) return 'discard';
        return 'deck';

      default:
        return 'deck';
    }
  }

  // Analyze how helpful a card is for current phase (more conservative scoring)
  analyzeCardHelpfulness(card) {
    if (card.type === 'wild') return 1.0;
    if (card.type === 'skip') return 0.1; // Skip cards aren't very helpful for completing phases

    const phaseInfo = getPhaseInfo(this.currentPhase);
    if (!phaseInfo) return 0;

    let helpfulness = 0;

    for (const req of phaseInfo.requirements) {
      switch (req.type) {
        case 'set':
        case 'colorSet': {
          // Check if we have cards with same value
          const sameValue = this.hand.filter(c => c.value === card.value);
          // Need at least 2 matching cards for it to be helpful (would give us 3)
          if (sameValue.length >= 2) {
            helpfulness = Math.max(helpfulness, 0.8);
          } else if (sameValue.length === 1) {
            helpfulness = Math.max(helpfulness, 0.4); // One match is marginally helpful
          }
          break;
        }

        case 'run':
        case 'colorRun': {
          // Check if card extends or fills a gap in a potential run
          const values = this.hand
            .filter(c => c.type === 'number')
            .map(c => c.value);

          // Count how many consecutive neighbors this card has
          let consecutiveCount = 0;
          if (values.includes(card.value - 1)) consecutiveCount++;
          if (values.includes(card.value + 1)) consecutiveCount++;
          if (values.includes(card.value - 2) && values.includes(card.value - 1)) consecutiveCount++;
          if (values.includes(card.value + 2) && values.includes(card.value + 1)) consecutiveCount++;

          // Only helpful if it connects to at least 2 consecutive cards
          if (consecutiveCount >= 2) {
            helpfulness = Math.max(helpfulness, 0.7);
          } else if (consecutiveCount === 1) {
            helpfulness = Math.max(helpfulness, 0.3);
          }
          break;
        }

        case 'color': {
          // Check if we have cards of same color
          const sameColor = this.hand.filter(c => c.color === card.color);
          // Need significant matching for color requirements
          if (sameColor.length >= req.count - 2) {
            helpfulness = Math.max(helpfulness, 0.7);
          } else if (sameColor.length >= req.count / 2) {
            helpfulness = Math.max(helpfulness, 0.4);
          }
          break;
        }

        case 'oddRun':
        case 'oddColorRun':
          if (card.value % 2 === 1) {
            const oddCards = this.hand.filter(c => c.type === 'number' && c.value % 2 === 1);
            if (oddCards.length >= req.count - 2) {
              helpfulness = Math.max(helpfulness, 0.6);
            }
          }
          break;

        case 'evenRun':
        case 'evenColorRun':
          if (card.value % 2 === 0) {
            const evenCards = this.hand.filter(c => c.type === 'number' && c.value % 2 === 0);
            if (evenCards.length >= req.count - 2) {
              helpfulness = Math.max(helpfulness, 0.6);
            }
          }
          break;
      }
    }

    return helpfulness;
  }

  // Check if taking a card would block an opponent
  shouldBlockOpponent(card) {
    // Simplified - in a real implementation we'd track what opponents need
    return Math.random() > 0.7;
  }

  // Attempt to form and validate a phase
  attemptPhase() {
    const phaseInfo = getPhaseInfo(this.currentPhase);
    if (!phaseInfo) return null;

    // Try to find valid card groupings for the phase
    const groups = this.findPhaseGroups(phaseInfo);

    if (!groups) return null;

    // Validate the phase
    const result = validatePhase(groups, this.currentPhase);
    if (result.valid) {
      return groups;
    }

    return null;
  }

  // Find valid card groups for a phase
  findPhaseGroups(phaseInfo) {
    const availableCards = [...this.hand];
    const groups = [];

    for (const req of phaseInfo.requirements) {
      const group = this.findGroupForRequirement(req, availableCards);
      if (!group) return null;

      groups.push(group);
      // Remove used cards from available pool
      for (const card of group) {
        const idx = availableCards.findIndex(c => c.id === card.id);
        if (idx !== -1) availableCards.splice(idx, 1);
      }
    }

    return groups;
  }

  // Find cards that satisfy a requirement
  findGroupForRequirement(req, availableCards) {
    switch (req.type) {
      case 'set':
        return this.findSet(availableCards, req.count);
      case 'run':
        return this.findRun(availableCards, req.count);
      case 'color':
        return this.findColorGroup(availableCards, req.count);
      case 'colorRun':
        return this.findColorRun(availableCards, req.count);
      case 'oddRun':
        return this.findOddEvenRun(availableCards, req.count, true);
      case 'evenRun':
        return this.findOddEvenRun(availableCards, req.count, false);
      case 'oddColorRun':
        return this.findOddEvenColorRun(availableCards, req.count, true);
      case 'evenColorRun':
        return this.findOddEvenColorRun(availableCards, req.count, false);
      case 'colorSet':
        return this.findColorSet(availableCards, req.count);
      default:
        return null;
    }
  }

  // Find a set of cards with the same value
  findSet(cards, count) {
    const wilds = cards.filter(c => c.type === 'wild');
    const numbers = cards.filter(c => c.type === 'number');

    // Group by value
    const byValue = {};
    for (const card of numbers) {
      if (!byValue[card.value]) byValue[card.value] = [];
      byValue[card.value].push(card);
    }

    // Find best value with enough cards (including wilds)
    for (const [value, valueCards] of Object.entries(byValue)) {
      if (valueCards.length >= count) {
        return valueCards.slice(0, count);
      }
      if (valueCards.length + wilds.length >= count) {
        const needed = count - valueCards.length;
        return [...valueCards, ...wilds.slice(0, needed)];
      }
    }

    return null;
  }

  // Find a run of consecutive numbers
  findRun(cards, count) {
    const wilds = cards.filter(c => c.type === 'wild');
    const numbers = cards.filter(c => c.type === 'number');

    // Sort by value
    numbers.sort((a, b) => a.value - b.value);

    // Try each possible starting position
    for (let start = 1; start <= 13 - count; start++) {
      const run = [];
      let wildsUsed = 0;

      for (let val = start; val < start + count; val++) {
        const card = numbers.find(c => c.value === val && !run.includes(c));
        if (card) {
          run.push(card);
        } else if (wildsUsed < wilds.length) {
          run.push(wilds[wildsUsed]);
          wildsUsed++;
        } else {
          break;
        }
      }

      if (run.length === count) {
        return run;
      }
    }

    return null;
  }

  // Find a color group
  findColorGroup(cards, count) {
    const wilds = cards.filter(c => c.type === 'wild');
    const colors = ['red', 'blue', 'green', 'yellow'];

    for (const color of colors) {
      const colorCards = cards.filter(c => c.color === color);
      if (colorCards.length >= count) {
        return colorCards.slice(0, count);
      }
      if (colorCards.length + wilds.length >= count) {
        const needed = count - colorCards.length;
        return [...colorCards, ...wilds.slice(0, needed)];
      }
    }

    return null;
  }

  // Find a color run
  findColorRun(cards, count) {
    const wilds = cards.filter(c => c.type === 'wild');
    const colors = ['red', 'blue', 'green', 'yellow'];

    for (const color of colors) {
      const colorCards = cards.filter(c => c.color === color);
      const result = this.findRun([...colorCards, ...wilds], count);
      if (result) return result;
    }

    return null;
  }

  // Find odd or even run
  findOddEvenRun(cards, count, isOdd) {
    const wilds = cards.filter(c => c.type === 'wild');
    const numbers = cards.filter(c =>
      c.type === 'number' && (isOdd ? c.value % 2 === 1 : c.value % 2 === 0)
    );

    const sequence = isOdd ? [1, 3, 5, 7, 9, 11] : [2, 4, 6, 8, 10, 12];

    for (let startIdx = 0; startIdx <= sequence.length - count; startIdx++) {
      const run = [];
      let wildsUsed = 0;

      for (let i = 0; i < count; i++) {
        const val = sequence[startIdx + i];
        const card = numbers.find(c => c.value === val && !run.includes(c));
        if (card) {
          run.push(card);
        } else if (wildsUsed < wilds.length) {
          run.push(wilds[wildsUsed]);
          wildsUsed++;
        } else {
          break;
        }
      }

      if (run.length === count) {
        return run;
      }
    }

    return null;
  }

  // Find odd/even color run
  findOddEvenColorRun(cards, count, isOdd) {
    const wilds = cards.filter(c => c.type === 'wild');
    const colors = ['red', 'blue', 'green', 'yellow'];

    for (const color of colors) {
      const colorCards = cards.filter(c =>
        c.color === color && (isOdd ? c.value % 2 === 1 : c.value % 2 === 0)
      );
      const result = this.findOddEvenRun([...colorCards, ...wilds], count, isOdd);
      if (result) return result;
    }

    return null;
  }

  // Find a color set
  findColorSet(cards, count) {
    const wilds = cards.filter(c => c.type === 'wild');
    const colors = ['red', 'blue', 'green', 'yellow'];

    for (const color of colors) {
      const colorCards = cards.filter(c => c.color === color);
      // Group by value within this color
      const byValue = {};
      for (const card of colorCards) {
        if (!byValue[card.value]) byValue[card.value] = [];
        byValue[card.value].push(card);
      }

      for (const [value, valueCards] of Object.entries(byValue)) {
        if (valueCards.length >= count) {
          return valueCards.slice(0, count);
        }
        if (valueCards.length + wilds.length >= count) {
          const needed = count - valueCards.length;
          return [...valueCards, ...wilds.slice(0, needed)];
        }
      }
    }

    return null;
  }

  // Select a card to discard
  // Returns { card, skipTargetId } - skipTargetId is only set for skip cards
  selectCardToDiscard(allPlayers = []) {
    // Don't discard if empty hand
    if (this.hand.length === 0) return null;

    const phaseInfo = getPhaseInfo(this.currentPhase);

    // Calculate helpfulness for each card
    const cardScores = this.hand.map(card => ({
      card,
      score: this.analyzeCardHelpfulness(card)
    }));

    // Sort by helpfulness (least helpful first)
    cardScores.sort((a, b) => a.score - b.score);

    let selectedCard;

    switch (this.difficulty) {
      case 'easy':
        // Sometimes discard randomly
        if (Math.random() > 0.7) {
          selectedCard = this.hand[Math.floor(Math.random() * this.hand.length)];
        } else {
          selectedCard = cardScores[0].card;
        }
        break;

      case 'medium':
        // Prefer discarding high-value unhelpful cards
        const unhelpful = cardScores.filter(c => c.score < 0.3);
        if (unhelpful.length > 0) {
          // Sort by card point value (discard high points first)
          unhelpful.sort((a, b) => {
            const aPoints = a.card.type === 'number' ? a.card.value : 25;
            const bPoints = b.card.type === 'number' ? b.card.value : 25;
            return bPoints - aPoints;
          });
          selectedCard = unhelpful[0].card;
        } else {
          selectedCard = cardScores[0].card;
        }
        break;

      case 'hard':
        // Strategic discard - avoid giving opponents useful cards
        // For simplicity, discard least helpful low-value card
        const leastHelpful = cardScores.filter(c => c.score < 0.2);
        if (leastHelpful.length > 0) {
          selectedCard = leastHelpful[0].card;
        } else {
          // If all cards are helpful, discard the one with lowest score
          selectedCard = cardScores[0].card;
        }
        break;

      default:
        selectedCard = cardScores[0].card;
    }

    // If it's a skip card, select a target
    let skipTargetId = null;
    if (selectedCard && selectedCard.type === 'skip') {
      skipTargetId = this.selectSkipTarget(allPlayers);
      // If no valid target available, try to discard a different card
      if (!skipTargetId) {
        const nonSkipCards = cardScores.filter(c => c.card.type !== 'skip');
        if (nonSkipCards.length > 0) {
          selectedCard = nonSkipCards[0].card;
        }
        // If only skip cards available and no valid targets, we must return null or skip anyway
      }
    }

    return { card: selectedCard, skipTargetId };
  }

  // Select a target player to skip
  selectSkipTarget(allPlayers) {
    // Find valid targets (not self - skips can stack so all other players are valid)
    const validTargets = allPlayers.filter(p => p.id !== this.id);

    if (validTargets.length === 0) return null;

    switch (this.difficulty) {
      case 'easy':
        // Random target
        return validTargets[Math.floor(Math.random() * validTargets.length)].id;

      case 'medium':
        // Skip the player with the fewest cards (closest to winning)
        validTargets.sort((a, b) => (a.hand?.length || a.handCount || 10) - (b.hand?.length || b.handCount || 10));
        return validTargets[0].id;

      case 'hard':
        // Skip the player who has completed their phase and has few cards
        const dangerous = validTargets.filter(p => p.completedPhaseThisRound);
        if (dangerous.length > 0) {
          dangerous.sort((a, b) => (a.hand?.length || a.handCount || 10) - (b.hand?.length || b.handCount || 10));
          return dangerous[0].id;
        }
        // Otherwise skip player with fewest cards
        validTargets.sort((a, b) => (a.hand?.length || a.handCount || 10) - (b.hand?.length || b.handCount || 10));
        return validTargets[0].id;

      default:
        return validTargets[0].id;
    }
  }

  // Find cards that can hit on other players' completed phases
  selectCardToHit(allPlayers) {
    if (!this.completedPhaseThisRound) return [];

    const hits = [];

    for (const player of allPlayers) {
      if (player.id === this.id) continue;
      if (!player.laidDownPhase) continue;

      const playerPhaseInfo = getPhaseInfo(player.currentPhase);
      if (!playerPhaseInfo) continue;

      for (let groupIdx = 0; groupIdx < player.laidDownPhase.length; groupIdx++) {
        const group = player.laidDownPhase[groupIdx];
        const groupType = playerPhaseInfo.requirements[groupIdx];

        for (const card of this.hand) {
          const result = canHitOnPhase(card, group, groupType);
          if (result.canHit) {
            hits.push({
              card,
              targetPlayerId: player.id,
              groupIndex: groupIdx
            });
          }
        }
      }
    }

    // Sort by card point value (hit with high-value cards first)
    hits.sort((a, b) => {
      const aPoints = a.card.type === 'number' ? a.card.value : 25;
      const bPoints = b.card.type === 'number' ? b.card.value : 25;
      return bPoints - aPoints;
    });

    return hits;
  }

  // Execute a complete turn
  async executeTurn(game, delay = 1500) {
    const actions = [];

    // 1. Draw a card
    const topDiscard = game.deck.getTopDiscard();
    const drawSource = this.selectCardToDraw(topDiscard);
    actions.push({ type: 'draw', source: drawSource });

    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, delay));

    // 2. Try to lay down phase if not already done
    if (!this.completedPhaseThisRound) {
      const phaseGroups = this.attemptPhase();
      if (phaseGroups) {
        actions.push({ type: 'layPhase', groups: phaseGroups });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // 3. Try to hit on other players' phases
    if (this.completedPhaseThisRound) {
      const hits = this.selectCardToHit(game.players);
      for (const hit of hits) {
        if (this.hasCard(hit.card.id)) {
          actions.push({
            type: 'hit',
            card: hit.card,
            targetPlayerId: hit.targetPlayerId,
            groupIndex: hit.groupIndex
          });
          await new Promise(resolve => setTimeout(resolve, delay / 2));
        }
      }
    }

    // 4. Discard a card
    const discardCard = this.selectCardToDiscard();
    if (discardCard) {
      actions.push({ type: 'discard', card: discardCard });
    }

    return actions;
  }

  // Choose a phase (for Choice mode)
  selectPhase(availablePhases) {
    // Analyze which phase we're closest to completing
    const phaseScores = availablePhases.map(phaseNum => {
      const phaseInfo = getPhaseInfo(phaseNum);
      if (!phaseInfo) return { phase: phaseNum, score: 0 };

      let score = 0;
      for (const req of phaseInfo.requirements) {
        score += this.calculateRequirementProgress(req);
      }

      return {
        phase: phaseNum,
        score: score / phaseInfo.requirements.length
      };
    });

    // Sort by score (highest first)
    phaseScores.sort((a, b) => b.score - a.score);

    // Return the phase we're closest to completing
    return phaseScores[0].phase;
  }

  // Calculate how close we are to completing a requirement
  calculateRequirementProgress(req) {
    const wilds = this.hand.filter(c => c.type === 'wild').length;

    switch (req.type) {
      case 'set':
      case 'colorSet': {
        let bestProgress = 0;
        const byValue = {};
        for (const card of this.hand.filter(c => c.type === 'number')) {
          if (!byValue[card.value]) byValue[card.value] = 0;
          byValue[card.value]++;
        }
        for (const count of Object.values(byValue)) {
          bestProgress = Math.max(bestProgress, (count + wilds) / req.count);
        }
        return Math.min(bestProgress, 1);
      }

      case 'run':
      case 'colorRun': {
        const values = this.hand
          .filter(c => c.type === 'number')
          .map(c => c.value)
          .sort((a, b) => a - b);

        let maxRun = 0;
        for (let i = 0; i < values.length; i++) {
          let runLength = 1;
          for (let j = i + 1; j < values.length; j++) {
            if (values[j] <= values[j - 1] + 1 + wilds) {
              runLength++;
            } else {
              break;
            }
          }
          maxRun = Math.max(maxRun, runLength);
        }
        return Math.min((maxRun + wilds) / req.count, 1);
      }

      case 'color': {
        const colors = ['red', 'blue', 'green', 'yellow'];
        let bestCount = 0;
        for (const color of colors) {
          const count = this.hand.filter(c => c.color === color).length;
          bestCount = Math.max(bestCount, count);
        }
        return Math.min((bestCount + wilds) / req.count, 1);
      }

      default:
        return 0;
    }
  }
}

module.exports = CPUPlayer;
