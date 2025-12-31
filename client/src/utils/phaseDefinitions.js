// All 30 Phase definitions - mirrored from backend
export const PHASES = {
  // Phase 10 (1-10)
  1: {
    name: "2 sets of 3",
    requirements: [
      { type: 'set', count: 3, label: 'Set of 3' },
      { type: 'set', count: 3, label: 'Set of 3' }
    ],
    totalCards: 6,
    description: 'Two groups of 3 cards with matching numbers'
  },
  2: {
    name: "1 set of 3 + 1 run of 4",
    requirements: [
      { type: 'set', count: 3, label: 'Set of 3' },
      { type: 'run', count: 4, label: 'Run of 4' }
    ],
    totalCards: 7,
    description: '3 matching numbers + 4 consecutive numbers'
  },
  3: {
    name: "1 set of 4 + 1 run of 4",
    requirements: [
      { type: 'set', count: 4, label: 'Set of 4' },
      { type: 'run', count: 4, label: 'Run of 4' }
    ],
    totalCards: 8,
    description: '4 matching numbers + 4 consecutive numbers'
  },
  4: {
    name: "1 run of 7",
    requirements: [
      { type: 'run', count: 7, label: 'Run of 7' }
    ],
    totalCards: 7,
    description: '7 consecutive numbers'
  },
  5: {
    name: "1 run of 8",
    requirements: [
      { type: 'run', count: 8, label: 'Run of 8' }
    ],
    totalCards: 8,
    description: '8 consecutive numbers'
  },
  6: {
    name: "1 run of 9",
    requirements: [
      { type: 'run', count: 9, label: 'Run of 9' }
    ],
    totalCards: 9,
    description: '9 consecutive numbers'
  },
  7: {
    name: "2 sets of 4",
    requirements: [
      { type: 'set', count: 4, label: 'Set of 4' },
      { type: 'set', count: 4, label: 'Set of 4' }
    ],
    totalCards: 8,
    description: 'Two groups of 4 cards with matching numbers'
  },
  8: {
    name: "7 cards of one color",
    requirements: [
      { type: 'color', count: 7, label: '7 Same Color' }
    ],
    totalCards: 7,
    description: '7 cards all the same color'
  },
  9: {
    name: "1 set of 5 + 1 set of 2",
    requirements: [
      { type: 'set', count: 5, label: 'Set of 5' },
      { type: 'set', count: 2, label: 'Set of 2' }
    ],
    totalCards: 7,
    description: '5 matching numbers + 2 matching numbers'
  },
  10: {
    name: "1 set of 5 + 1 set of 3",
    requirements: [
      { type: 'set', count: 5, label: 'Set of 5' },
      { type: 'set', count: 3, label: 'Set of 3' }
    ],
    totalCards: 8,
    description: '5 matching numbers + 3 matching numbers'
  },

  // Phase 20 (11-20)
  11: {
    name: "1 run of 4 of one color",
    requirements: [
      { type: 'colorRun', count: 4, label: 'Color Run of 4' }
    ],
    totalCards: 4,
    description: '4 consecutive numbers of the same color'
  },
  12: {
    name: "1 run of 6 of one color",
    requirements: [
      { type: 'colorRun', count: 6, label: 'Color Run of 6' }
    ],
    totalCards: 6,
    description: '6 consecutive numbers of the same color'
  },
  13: {
    name: "1 run of 4 + 6 cards of one color",
    requirements: [
      { type: 'run', count: 4, label: 'Run of 4' },
      { type: 'color', count: 6, label: '6 Same Color' }
    ],
    totalCards: 10,
    description: '4 consecutive numbers + 6 cards of same color'
  },
  14: {
    name: "1 run of 6 + 4 cards of one color",
    requirements: [
      { type: 'run', count: 6, label: 'Run of 6' },
      { type: 'color', count: 4, label: '4 Same Color' }
    ],
    totalCards: 10,
    description: '6 consecutive numbers + 4 cards of same color'
  },
  15: {
    name: "8 cards of one color",
    requirements: [
      { type: 'color', count: 8, label: '8 Same Color' }
    ],
    totalCards: 8,
    description: '8 cards all the same color'
  },
  16: {
    name: "9 cards of one color",
    requirements: [
      { type: 'color', count: 9, label: '9 Same Color' }
    ],
    totalCards: 9,
    description: '9 cards all the same color'
  },
  17: {
    name: "3 sets of 3",
    requirements: [
      { type: 'set', count: 3, label: 'Set of 3' },
      { type: 'set', count: 3, label: 'Set of 3' },
      { type: 'set', count: 3, label: 'Set of 3' }
    ],
    totalCards: 9,
    description: 'Three groups of 3 matching numbers'
  },
  18: {
    name: "1 set of 4 + 1 run of 6",
    requirements: [
      { type: 'set', count: 4, label: 'Set of 4' },
      { type: 'run', count: 6, label: 'Run of 6' }
    ],
    totalCards: 10,
    description: '4 matching numbers + 6 consecutive numbers'
  },
  19: {
    name: "1 set of 5 + 1 run of 5",
    requirements: [
      { type: 'set', count: 5, label: 'Set of 5' },
      { type: 'run', count: 5, label: 'Run of 5' }
    ],
    totalCards: 10,
    description: '5 matching numbers + 5 consecutive numbers'
  },
  20: {
    name: "1 set of 5 + 5 cards of one color",
    requirements: [
      { type: 'set', count: 5, label: 'Set of 5' },
      { type: 'color', count: 5, label: '5 Same Color' }
    ],
    totalCards: 10,
    description: '5 matching numbers + 5 cards of same color'
  },

  // Phase 30 (21-30)
  21: {
    name: "5 sets of 2",
    requirements: [
      { type: 'set', count: 2, label: 'Set of 2' },
      { type: 'set', count: 2, label: 'Set of 2' },
      { type: 'set', count: 2, label: 'Set of 2' },
      { type: 'set', count: 2, label: 'Set of 2' },
      { type: 'set', count: 2, label: 'Set of 2' }
    ],
    totalCards: 10,
    description: 'Five pairs of matching numbers'
  },
  22: {
    name: "1 run of 10",
    requirements: [
      { type: 'run', count: 10, label: 'Run of 10' }
    ],
    totalCards: 10,
    description: '10 consecutive numbers'
  },
  23: {
    name: "10 cards of one color",
    requirements: [
      { type: 'color', count: 10, label: '10 Same Color' }
    ],
    totalCards: 10,
    description: '10 cards all the same color'
  },
  24: {
    name: "1 run of 5 odd numbers of one color + 1 run of 5 even numbers of one color",
    requirements: [
      { type: 'oddColorRun', count: 5, label: '5 Odd Color Run' },
      { type: 'evenColorRun', count: 5, label: '5 Even Color Run' }
    ],
    totalCards: 10,
    description: '5 consecutive odd numbers (same color) + 5 consecutive even numbers (same color)'
  },
  25: {
    name: "1 set of 5 + 1 run of 5 odd numbers",
    requirements: [
      { type: 'set', count: 5, label: 'Set of 5' },
      { type: 'oddRun', count: 5, label: '5 Odd Run' }
    ],
    totalCards: 10,
    description: '5 matching numbers + 5 consecutive odd numbers'
  },
  26: {
    name: "1 set of 5 + 1 run of 5 even numbers",
    requirements: [
      { type: 'set', count: 5, label: 'Set of 5' },
      { type: 'evenRun', count: 5, label: '5 Even Run' }
    ],
    totalCards: 10,
    description: '5 matching numbers + 5 consecutive even numbers'
  },
  27: {
    name: "1 set of 4 + 1 run of 3 + 1 set of 3 of one color",
    requirements: [
      { type: 'set', count: 4, label: 'Set of 4' },
      { type: 'run', count: 3, label: 'Run of 3' },
      { type: 'colorSet', count: 3, label: 'Color Set of 3' }
    ],
    totalCards: 10,
    description: '4 matching + 3 consecutive + 3 matching same color'
  },
  28: {
    name: "1 run of 5 + 1 run of 5 odd numbers of one color",
    requirements: [
      { type: 'run', count: 5, label: 'Run of 5' },
      { type: 'oddColorRun', count: 5, label: '5 Odd Color Run' }
    ],
    totalCards: 10,
    description: '5 consecutive + 5 consecutive odd of same color'
  },
  29: {
    name: "1 run of 5 + 1 run of 5 even numbers of one color",
    requirements: [
      { type: 'run', count: 5, label: 'Run of 5' },
      { type: 'evenColorRun', count: 5, label: '5 Even Color Run' }
    ],
    totalCards: 10,
    description: '5 consecutive + 5 consecutive even of same color'
  },
  30: {
    name: "2 sets of 5",
    requirements: [
      { type: 'set', count: 5, label: 'Set of 5' },
      { type: 'set', count: 5, label: 'Set of 5' }
    ],
    totalCards: 10,
    description: 'Two groups of 5 matching numbers'
  }
};

// Game mode descriptions
export const GAME_MODES = {
  normal10: {
    name: 'Normal Phase 10',
    description: 'Complete phases 1-10 in order',
    maxPhase: 10
  },
  choice10: {
    name: 'Choice Phase 10',
    description: 'Choose which phase to attempt each round (1-10)',
    maxPhase: 10
  },
  chaos10: {
    name: 'Chaos Phase 10',
    description: 'Random phase assigned each round (1-10)',
    maxPhase: 10
  },
  normal20: {
    name: 'Normal Phase 20',
    description: 'Complete phases 1-20 in order',
    maxPhase: 20
  },
  choice20: {
    name: 'Choice Phase 20',
    description: 'Choose which phase to attempt each round (1-20)',
    maxPhase: 20
  },
  chaos20: {
    name: 'Chaos Phase 20',
    description: 'Random phase assigned each round (1-20)',
    maxPhase: 20
  },
  normal30: {
    name: 'Normal Phase 30',
    description: 'Complete phases 1-30 in order',
    maxPhase: 30
  },
  choice30: {
    name: 'Choice Phase 30',
    description: 'Choose which phase to attempt each round (1-30)',
    maxPhase: 30
  },
  chaos30: {
    name: 'Chaos Phase 30',
    description: 'Random phase assigned each round (1-30)',
    maxPhase: 30
  }
};

// Get phase info
export function getPhaseInfo(phaseNumber) {
  return PHASES[phaseNumber] || null;
}

// Get available phases for a mode
export function getPhasesForMode(mode) {
  const modeInfo = GAME_MODES[mode];
  if (!modeInfo) return [];

  const phases = [];
  for (let i = 1; i <= modeInfo.maxPhase; i++) {
    phases.push(i);
  }
  return phases;
}

export default PHASES;
