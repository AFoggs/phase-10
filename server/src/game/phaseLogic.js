// All 30 Phase definitions
const PHASES = {
  // Phase 10 (1-10)
  1: {
    name: "2 sets of 3",
    requirements: [
      { type: 'set', count: 3 },
      { type: 'set', count: 3 }
    ],
    totalCards: 6
  },
  2: {
    name: "1 set of 3 + 1 run of 4",
    requirements: [
      { type: 'set', count: 3 },
      { type: 'run', count: 4 }
    ],
    totalCards: 7
  },
  3: {
    name: "1 set of 4 + 1 run of 4",
    requirements: [
      { type: 'set', count: 4 },
      { type: 'run', count: 4 }
    ],
    totalCards: 8
  },
  4: {
    name: "1 run of 7",
    requirements: [
      { type: 'run', count: 7 }
    ],
    totalCards: 7
  },
  5: {
    name: "1 run of 8",
    requirements: [
      { type: 'run', count: 8 }
    ],
    totalCards: 8
  },
  6: {
    name: "1 run of 9",
    requirements: [
      { type: 'run', count: 9 }
    ],
    totalCards: 9
  },
  7: {
    name: "2 sets of 4",
    requirements: [
      { type: 'set', count: 4 },
      { type: 'set', count: 4 }
    ],
    totalCards: 8
  },
  8: {
    name: "7 cards of one color",
    requirements: [
      { type: 'color', count: 7 }
    ],
    totalCards: 7
  },
  9: {
    name: "1 set of 5 + 1 set of 2",
    requirements: [
      { type: 'set', count: 5 },
      { type: 'set', count: 2 }
    ],
    totalCards: 7
  },
  10: {
    name: "1 set of 5 + 1 set of 3",
    requirements: [
      { type: 'set', count: 5 },
      { type: 'set', count: 3 }
    ],
    totalCards: 8
  },

  // Phase 20 (11-20)
  11: {
    name: "1 run of 4 of one color",
    requirements: [
      { type: 'colorRun', count: 4 }
    ],
    totalCards: 4
  },
  12: {
    name: "1 run of 6 of one color",
    requirements: [
      { type: 'colorRun', count: 6 }
    ],
    totalCards: 6
  },
  13: {
    name: "1 run of 4 + 6 cards of one color",
    requirements: [
      { type: 'run', count: 4 },
      { type: 'color', count: 6 }
    ],
    totalCards: 10
  },
  14: {
    name: "1 run of 6 + 4 cards of one color",
    requirements: [
      { type: 'run', count: 6 },
      { type: 'color', count: 4 }
    ],
    totalCards: 10
  },
  15: {
    name: "8 cards of one color",
    requirements: [
      { type: 'color', count: 8 }
    ],
    totalCards: 8
  },
  16: {
    name: "9 cards of one color",
    requirements: [
      { type: 'color', count: 9 }
    ],
    totalCards: 9
  },
  17: {
    name: "3 sets of 3",
    requirements: [
      { type: 'set', count: 3 },
      { type: 'set', count: 3 },
      { type: 'set', count: 3 }
    ],
    totalCards: 9
  },
  18: {
    name: "1 set of 4 + 1 run of 6",
    requirements: [
      { type: 'set', count: 4 },
      { type: 'run', count: 6 }
    ],
    totalCards: 10
  },
  19: {
    name: "1 set of 5 + 1 run of 5",
    requirements: [
      { type: 'set', count: 5 },
      { type: 'run', count: 5 }
    ],
    totalCards: 10
  },
  20: {
    name: "1 set of 5 + 5 cards of one color",
    requirements: [
      { type: 'set', count: 5 },
      { type: 'color', count: 5 }
    ],
    totalCards: 10
  },

  // Phase 30 (21-30)
  21: {
    name: "5 sets of 2",
    requirements: [
      { type: 'set', count: 2 },
      { type: 'set', count: 2 },
      { type: 'set', count: 2 },
      { type: 'set', count: 2 },
      { type: 'set', count: 2 }
    ],
    totalCards: 10
  },
  22: {
    name: "1 run of 10",
    requirements: [
      { type: 'run', count: 10 }
    ],
    totalCards: 10
  },
  23: {
    name: "10 cards of one color",
    requirements: [
      { type: 'color', count: 10 }
    ],
    totalCards: 10
  },
  24: {
    name: "1 run of 5 odd numbers of one color + 1 run of 5 even numbers of one color",
    requirements: [
      { type: 'oddColorRun', count: 5 },
      { type: 'evenColorRun', count: 5 }
    ],
    totalCards: 10
  },
  25: {
    name: "1 set of 5 + 1 run of 5 odd numbers",
    requirements: [
      { type: 'set', count: 5 },
      { type: 'oddRun', count: 5 }
    ],
    totalCards: 10
  },
  26: {
    name: "1 set of 5 + 1 run of 5 even numbers",
    requirements: [
      { type: 'set', count: 5 },
      { type: 'evenRun', count: 5 }
    ],
    totalCards: 10
  },
  27: {
    name: "1 set of 4 + 1 run of 3 + 1 set of 3 of one color",
    requirements: [
      { type: 'set', count: 4 },
      { type: 'run', count: 3 },
      { type: 'colorSet', count: 3 }
    ],
    totalCards: 10
  },
  28: {
    name: "1 run of 5 + 1 run of 5 odd numbers of one color",
    requirements: [
      { type: 'run', count: 5 },
      { type: 'oddColorRun', count: 5 }
    ],
    totalCards: 10
  },
  29: {
    name: "1 run of 5 + 1 run of 5 even numbers of one color",
    requirements: [
      { type: 'run', count: 5 },
      { type: 'evenColorRun', count: 5 }
    ],
    totalCards: 10
  },
  30: {
    name: "2 sets of 5",
    requirements: [
      { type: 'set', count: 5 },
      { type: 'set', count: 5 }
    ],
    totalCards: 10
  }
};

// Helper function to get effective value of a card (wilds can be any value)
function getEffectiveValues(cards) {
  const numberCards = cards.filter(c => c.type === 'number');
  const wildCount = cards.filter(c => c.type === 'wild').length;

  return {
    numberCards,
    wildCount,
    values: numberCards.map(c => c.value),
    colors: numberCards.map(c => c.color)
  };
}

// Validate a set (cards of the same number)
function validateSet(cards, requiredCount) {
  if (cards.length !== requiredCount) {
    return { valid: false, reason: `Need exactly ${requiredCount} cards` };
  }

  const { numberCards, wildCount } = getEffectiveValues(cards);

  if (numberCards.length === 0 && wildCount > 0) {
    // All wilds - valid as they can represent any set
    return { valid: true };
  }

  // Check if all number cards have the same value
  const values = numberCards.map(c => c.value);
  const uniqueValues = [...new Set(values)];

  if (uniqueValues.length > 1) {
    return { valid: false, reason: 'All cards in a set must have the same number' };
  }

  // Skip cards cannot be in sets
  if (cards.some(c => c.type === 'skip')) {
    return { valid: false, reason: 'Skip cards cannot be used in sets' };
  }

  return { valid: true, setValue: uniqueValues[0] };
}

// Validate a run (consecutive numbers)
function validateRun(cards, requiredCount) {
  if (cards.length !== requiredCount) {
    return { valid: false, reason: `Need exactly ${requiredCount} cards` };
  }

  // Skip cards cannot be in runs
  if (cards.some(c => c.type === 'skip')) {
    return { valid: false, reason: 'Skip cards cannot be used in runs' };
  }

  const { numberCards, wildCount } = getEffectiveValues(cards);

  if (numberCards.length === 0 && wildCount > 0) {
    // All wilds - valid as they can represent any run
    return { valid: true };
  }

  const values = numberCards.map(c => c.value).sort((a, b) => a - b);

  // Find the range needed
  const minVal = values[0];
  const maxVal = values[values.length - 1];

  // Check if we can form a valid run with the wilds
  const neededLength = requiredCount;
  const range = maxVal - minVal + 1;

  // The range shouldn't exceed the required count
  if (range > neededLength) {
    return { valid: false, reason: 'Cards are too spread out to form a run' };
  }

  // Check for duplicates in number cards
  const valueSet = new Set(values);
  if (valueSet.size !== values.length) {
    return { valid: false, reason: 'Runs cannot have duplicate numbers' };
  }

  // Verify the run is possible (values 1-12)
  // Find a valid starting point
  for (let start = Math.max(1, minVal - wildCount); start <= Math.min(12 - neededLength + 1, minVal); start++) {
    const end = start + neededLength - 1;
    if (end > 12) continue;

    let wildsNeeded = 0;
    let valid = true;

    for (let v = start; v <= end; v++) {
      if (!values.includes(v)) {
        wildsNeeded++;
      }
    }

    if (wildsNeeded <= wildCount) {
      return { valid: true, runStart: start, runEnd: end };
    }
  }

  return { valid: false, reason: 'Cannot form a valid consecutive run' };
}

// Validate color group (all same color)
function validateColor(cards, requiredCount) {
  if (cards.length !== requiredCount) {
    return { valid: false, reason: `Need exactly ${requiredCount} cards` };
  }

  // Skip cards cannot be in color groups
  if (cards.some(c => c.type === 'skip')) {
    return { valid: false, reason: 'Skip cards cannot be used in color groups' };
  }

  const { numberCards, wildCount } = getEffectiveValues(cards);

  if (numberCards.length === 0 && wildCount > 0) {
    // All wilds - valid
    return { valid: true };
  }

  const colors = numberCards.map(c => c.color);
  const uniqueColors = [...new Set(colors)];

  if (uniqueColors.length > 1) {
    return { valid: false, reason: 'All cards must be the same color' };
  }

  return { valid: true, color: uniqueColors[0] };
}

// Validate color run (consecutive numbers of same color)
function validateColorRun(cards, requiredCount) {
  if (cards.length !== requiredCount) {
    return { valid: false, reason: `Need exactly ${requiredCount} cards` };
  }

  // First validate it's a valid run
  const runResult = validateRun(cards, requiredCount);
  if (!runResult.valid) {
    return runResult;
  }

  // Then validate all same color
  const colorResult = validateColor(cards, requiredCount);
  if (!colorResult.valid) {
    return { valid: false, reason: 'Color run must be all the same color' };
  }

  return { valid: true, ...runResult, ...colorResult };
}

// Validate odd number run (1, 3, 5, 7, 9, 11)
function validateOddRun(cards, requiredCount) {
  if (cards.length !== requiredCount) {
    return { valid: false, reason: `Need exactly ${requiredCount} cards` };
  }

  if (cards.some(c => c.type === 'skip')) {
    return { valid: false, reason: 'Skip cards cannot be used' };
  }

  const { numberCards, wildCount } = getEffectiveValues(cards);

  // Check all number cards are odd
  for (const card of numberCards) {
    if (card.value % 2 === 0) {
      return { valid: false, reason: 'All cards must be odd numbers' };
    }
  }

  const oddSequence = [1, 3, 5, 7, 9, 11];
  const values = numberCards.map(c => c.value).sort((a, b) => a - b);

  // Check for duplicates
  if (new Set(values).size !== values.length) {
    return { valid: false, reason: 'Cannot have duplicate numbers' };
  }

  // Verify consecutive odd numbers
  const indices = values.map(v => oddSequence.indexOf(v));
  if (indices.length > 0) {
    const minIdx = Math.min(...indices);
    const maxIdx = Math.max(...indices);

    if (maxIdx - minIdx + 1 > requiredCount) {
      return { valid: false, reason: 'Odd numbers are not consecutive' };
    }

    // Check if we have enough wilds to fill gaps
    let wildsNeeded = 0;
    for (let i = minIdx; i <= Math.min(minIdx + requiredCount - 1, 5); i++) {
      if (!values.includes(oddSequence[i])) {
        wildsNeeded++;
      }
    }

    if (wildsNeeded > wildCount) {
      return { valid: false, reason: 'Not enough wilds to complete the odd run' };
    }
  }

  return { valid: true };
}

// Validate even number run (2, 4, 6, 8, 10, 12)
function validateEvenRun(cards, requiredCount) {
  if (cards.length !== requiredCount) {
    return { valid: false, reason: `Need exactly ${requiredCount} cards` };
  }

  if (cards.some(c => c.type === 'skip')) {
    return { valid: false, reason: 'Skip cards cannot be used' };
  }

  const { numberCards, wildCount } = getEffectiveValues(cards);

  // Check all number cards are even
  for (const card of numberCards) {
    if (card.value % 2 !== 0) {
      return { valid: false, reason: 'All cards must be even numbers' };
    }
  }

  const evenSequence = [2, 4, 6, 8, 10, 12];
  const values = numberCards.map(c => c.value).sort((a, b) => a - b);

  // Check for duplicates
  if (new Set(values).size !== values.length) {
    return { valid: false, reason: 'Cannot have duplicate numbers' };
  }

  // Verify consecutive even numbers
  const indices = values.map(v => evenSequence.indexOf(v));
  if (indices.length > 0) {
    const minIdx = Math.min(...indices);
    const maxIdx = Math.max(...indices);

    if (maxIdx - minIdx + 1 > requiredCount) {
      return { valid: false, reason: 'Even numbers are not consecutive' };
    }

    // Check if we have enough wilds to fill gaps
    let wildsNeeded = 0;
    for (let i = minIdx; i <= Math.min(minIdx + requiredCount - 1, 5); i++) {
      if (!values.includes(evenSequence[i])) {
        wildsNeeded++;
      }
    }

    if (wildsNeeded > wildCount) {
      return { valid: false, reason: 'Not enough wilds to complete the even run' };
    }
  }

  return { valid: true };
}

// Validate odd color run
function validateOddColorRun(cards, requiredCount) {
  const oddResult = validateOddRun(cards, requiredCount);
  if (!oddResult.valid) return oddResult;

  const colorResult = validateColor(cards, requiredCount);
  if (!colorResult.valid) {
    return { valid: false, reason: 'Odd run must be all the same color' };
  }

  return { valid: true };
}

// Validate even color run
function validateEvenColorRun(cards, requiredCount) {
  const evenResult = validateEvenRun(cards, requiredCount);
  if (!evenResult.valid) return evenResult;

  const colorResult = validateColor(cards, requiredCount);
  if (!colorResult.valid) {
    return { valid: false, reason: 'Even run must be all the same color' };
  }

  return { valid: true };
}

// Validate color set (set of same color)
function validateColorSet(cards, requiredCount) {
  const setResult = validateSet(cards, requiredCount);
  if (!setResult.valid) return setResult;

  const colorResult = validateColor(cards, requiredCount);
  if (!colorResult.valid) {
    return { valid: false, reason: 'Set must be all the same color' };
  }

  return { valid: true };
}

// Validate a single requirement
function validateRequirement(cards, requirement) {
  switch (requirement.type) {
    case 'set':
      return validateSet(cards, requirement.count);
    case 'run':
      return validateRun(cards, requirement.count);
    case 'color':
      return validateColor(cards, requirement.count);
    case 'colorRun':
      return validateColorRun(cards, requirement.count);
    case 'oddRun':
      return validateOddRun(cards, requirement.count);
    case 'evenRun':
      return validateEvenRun(cards, requirement.count);
    case 'oddColorRun':
      return validateOddColorRun(cards, requirement.count);
    case 'evenColorRun':
      return validateEvenColorRun(cards, requirement.count);
    case 'colorSet':
      return validateColorSet(cards, requirement.count);
    default:
      return { valid: false, reason: `Unknown requirement type: ${requirement.type}` };
  }
}

// Validate complete phase submission
// cardGroups is an array of arrays, each inner array is a group of cards for one requirement
function validatePhase(cardGroups, phaseNumber) {
  const phase = PHASES[phaseNumber];
  if (!phase) {
    return { valid: false, reason: `Invalid phase number: ${phaseNumber}` };
  }

  if (cardGroups.length !== phase.requirements.length) {
    return {
      valid: false,
      reason: `Phase ${phaseNumber} requires ${phase.requirements.length} groups, got ${cardGroups.length}`
    };
  }

  // Validate each group against its requirement
  const results = [];
  for (let i = 0; i < cardGroups.length; i++) {
    const result = validateRequirement(cardGroups[i], phase.requirements[i]);
    results.push(result);
    if (!result.valid) {
      return {
        valid: false,
        reason: `Group ${i + 1}: ${result.reason}`,
        groupIndex: i
      };
    }
  }

  // Check total card count
  const totalCards = cardGroups.reduce((sum, group) => sum + group.length, 0);
  if (totalCards !== phase.totalCards) {
    return {
      valid: false,
      reason: `Phase requires ${phase.totalCards} cards total, got ${totalCards}`
    };
  }

  // Check no card is used twice
  const allCardIds = cardGroups.flat().map(c => c.id);
  if (new Set(allCardIds).size !== allCardIds.length) {
    return { valid: false, reason: 'Same card cannot be used in multiple groups' };
  }

  return { valid: true, phase: phaseNumber, phaseName: phase.name };
}

// Check if a card can be added to an existing completed phase group (hitting)
function canHitOnPhase(card, existingGroup, groupType) {
  if (card.type === 'skip') {
    return { canHit: false, reason: 'Skip cards cannot be used to hit' };
  }

  if (card.type === 'wild') {
    return { canHit: true }; // Wilds can always hit on any group
  }

  switch (groupType.type) {
    case 'set':
    case 'colorSet': {
      // Can add to set if same number
      const numberCards = existingGroup.filter(c => c.type === 'number');
      if (numberCards.length === 0) {
        return { canHit: true }; // All wilds, any number works
      }
      const setValue = numberCards[0].value;
      if (card.value !== setValue) {
        return { canHit: false, reason: 'Card must match the set number' };
      }
      if (groupType.type === 'colorSet') {
        const color = numberCards[0].color;
        if (card.color !== color) {
          return { canHit: false, reason: 'Card must match the set color' };
        }
      }
      return { canHit: true };
    }

    case 'run':
    case 'colorRun':
    case 'oddRun':
    case 'evenRun':
    case 'oddColorRun':
    case 'evenColorRun': {
      // Can extend run at either end
      const numberCards = existingGroup.filter(c => c.type === 'number');
      const values = numberCards.map(c => c.value).sort((a, b) => a - b);
      const minVal = Math.min(...values);
      const maxVal = Math.max(...values);

      // Check if card extends the run
      if (card.value !== minVal - 1 && card.value !== maxVal + 1) {
        // Also check for filling in gaps if wilds were used
        if (values.includes(card.value)) {
          return { canHit: false, reason: 'Card already in run' };
        }
        if (card.value < minVal - 1 || card.value > maxVal + 1) {
          return { canHit: false, reason: 'Card must extend the run' };
        }
      }

      // Check bounds
      if (card.value < 1 || card.value > 12) {
        return { canHit: false, reason: 'Card value out of range' };
      }

      // Check odd/even constraints
      if (groupType.type.includes('odd') && card.value % 2 === 0) {
        return { canHit: false, reason: 'Must be an odd number' };
      }
      if (groupType.type.includes('even') && card.value % 2 !== 0) {
        return { canHit: false, reason: 'Must be an even number' };
      }

      // Check color constraints
      if (groupType.type.includes('Color') || groupType.type.includes('color')) {
        const colors = numberCards.map(c => c.color);
        const groupColor = [...new Set(colors)][0];
        if (groupColor && card.color !== groupColor) {
          return { canHit: false, reason: 'Card must match the run color' };
        }
      }

      return { canHit: true };
    }

    case 'color': {
      // Can add if same color
      const numberCards = existingGroup.filter(c => c.type === 'number');
      if (numberCards.length === 0) {
        return { canHit: true };
      }
      const groupColor = numberCards[0].color;
      if (card.color !== groupColor) {
        return { canHit: false, reason: 'Card must match the color group' };
      }
      return { canHit: true };
    }

    default:
      return { canHit: false, reason: 'Unknown group type' };
  }
}

// Get phase info
function getPhaseInfo(phaseNumber) {
  return PHASES[phaseNumber] || null;
}

// Get all phases for a game mode
function getPhasesForMode(mode) {
  switch (mode) {
    case 'normal10':
    case 'choice10':
    case 'chaos10':
      return Object.keys(PHASES).filter(p => p >= 1 && p <= 10).map(Number);
    case 'normal20':
    case 'choice20':
    case 'chaos20':
      return Object.keys(PHASES).filter(p => p >= 1 && p <= 20).map(Number);
    case 'normal30':
    case 'choice30':
    case 'chaos30':
      return Object.keys(PHASES).filter(p => p >= 1 && p <= 30).map(Number);
    default:
      return Object.keys(PHASES).filter(p => p >= 1 && p <= 10).map(Number);
  }
}

// Calculate card points (for scoring at end of round)
function calculateCardPoints(card) {
  if (card.type === 'wild' || card.type === 'skip') {
    return 25;
  }
  if (card.value >= 10) {
    return 10;
  }
  return 5;
}

// Calculate total hand points
function calculateHandPoints(cards) {
  return cards.reduce((sum, card) => sum + calculateCardPoints(card), 0);
}

module.exports = {
  PHASES,
  validateSet,
  validateRun,
  validateColor,
  validateColorRun,
  validateOddRun,
  validateEvenRun,
  validateOddColorRun,
  validateEvenColorRun,
  validateColorSet,
  validateRequirement,
  validatePhase,
  canHitOnPhase,
  getPhaseInfo,
  getPhasesForMode,
  calculateCardPoints,
  calculateHandPoints
};
