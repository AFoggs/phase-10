// Card color mappings
export const CARD_COLORS = {
  red: '#e74c3c',
  blue: '#3498db',
  green: '#2ecc71',
  yellow: '#f1c40f'
};

// Sort hand by color then value
export function sortByColor(cards) {
  const sorted = [...cards].sort((a, b) => {
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

  return sorted;
}

// Sort hand by number then color
export function sortByNumber(cards) {
  const sorted = [...cards].sort((a, b) => {
    // Wilds and skips at the end
    if (a.type !== 'number' && b.type === 'number') return 1;
    if (a.type === 'number' && b.type !== 'number') return -1;
    if (a.type !== 'number' && b.type !== 'number') {
      return a.type === 'wild' ? -1 : 1;
    }

    // Sort by value first
    if (a.value !== b.value) return a.value - b.value;

    // Then by color for same values
    const colorOrder = ['red', 'blue', 'green', 'yellow'];
    return colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color);
  });

  return sorted;
}

// Legacy function for compatibility
export function sortHand(cards, sortMode = 'color') {
  return sortMode === 'number' ? sortByNumber(cards) : sortByColor(cards);
}

// Get card display color
export function getCardColor(card) {
  if (card.type === 'wild') {
    return 'linear-gradient(135deg, #e74c3c, #f39c12, #2ecc71, #3498db)';
  }
  if (card.type === 'skip') {
    return '#c0392b';
  }
  return CARD_COLORS[card.color] || '#ffffff';
}

// Get card background class
export function getCardBgClass(card) {
  if (card.type === 'wild') {
    return 'bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500';
  }
  if (card.type === 'skip') {
    return 'bg-red-700';
  }

  const colorClasses = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-400'
  };

  return colorClasses[card.color] || 'bg-gray-500';
}

// Get card text color (for contrast)
export function getCardTextColor(card) {
  if (card.type === 'wild' || card.type === 'skip') {
    return 'text-white';
  }
  if (card.color === 'yellow') {
    return 'text-gray-900';
  }
  return 'text-white';
}

// Format card for display
export function formatCard(card) {
  if (card.type === 'wild') {
    return 'WILD';
  }
  if (card.type === 'skip') {
    return 'SKIP';
  }
  return card.value.toString();
}

// Get card point value
export function getCardPoints(card) {
  if (card.type === 'wild' || card.type === 'skip') {
    return 25;
  }
  if (card.value >= 10) {
    return 10;
  }
  return 5;
}

// Calculate total points for a hand
export function calculateHandPoints(cards) {
  return cards.reduce((sum, card) => sum + getCardPoints(card), 0);
}

// Format score with comma separators
export function formatScore(score) {
  return score.toLocaleString();
}

// Group cards by value (for set detection)
export function groupByValue(cards) {
  const groups = {};
  for (const card of cards) {
    if (card.type === 'number') {
      if (!groups[card.value]) {
        groups[card.value] = [];
      }
      groups[card.value].push(card);
    }
  }
  return groups;
}

// Group cards by color
export function groupByColor(cards) {
  const groups = {};
  for (const card of cards) {
    if (card.color) {
      if (!groups[card.color]) {
        groups[card.color] = [];
      }
      groups[card.color].push(card);
    }
  }
  return groups;
}

// Find potential runs in cards
export function findPotentialRuns(cards) {
  const numberCards = cards.filter(c => c.type === 'number');
  const values = numberCards.map(c => c.value).sort((a, b) => a - b);
  const uniqueValues = [...new Set(values)];

  const runs = [];
  let currentRun = [uniqueValues[0]];

  for (let i = 1; i < uniqueValues.length; i++) {
    if (uniqueValues[i] === uniqueValues[i - 1] + 1) {
      currentRun.push(uniqueValues[i]);
    } else {
      if (currentRun.length >= 3) {
        runs.push([...currentRun]);
      }
      currentRun = [uniqueValues[i]];
    }
  }

  if (currentRun.length >= 3) {
    runs.push(currentRun);
  }

  return runs;
}

// Check if a card can be added to a run
export function canExtendRun(card, runCards) {
  if (card.type === 'wild') return true;
  if (card.type !== 'number') return false;

  const values = runCards
    .filter(c => c.type === 'number')
    .map(c => c.value)
    .sort((a, b) => a - b);

  if (values.length === 0) return true;

  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);

  return card.value === minVal - 1 || card.value === maxVal + 1;
}

// Check if a card can be added to a set
export function canExtendSet(card, setCards) {
  if (card.type === 'wild') return true;
  if (card.type !== 'number') return false;

  const numberCards = setCards.filter(c => c.type === 'number');
  if (numberCards.length === 0) return true;

  return card.value === numberCards[0].value;
}

// Get color name for display
export function getColorName(color) {
  const names = {
    red: 'Red',
    blue: 'Blue',
    green: 'Green',
    yellow: 'Yellow'
  };
  return names[color] || color;
}

// Check if cards form a valid color group
export function isValidColorGroup(cards) {
  const numberCards = cards.filter(c => c.type === 'number');
  if (numberCards.length === 0) return true; // All wilds

  const colors = numberCards.map(c => c.color);
  const uniqueColors = [...new Set(colors)];

  return uniqueColors.length === 1;
}

export default {
  CARD_COLORS,
  sortHand,
  sortByColor,
  sortByNumber,
  getCardColor,
  getCardBgClass,
  getCardTextColor,
  formatCard,
  getCardPoints,
  calculateHandPoints,
  formatScore,
  groupByValue,
  groupByColor,
  findPotentialRuns,
  canExtendRun,
  canExtendSet,
  getColorName,
  isValidColorGroup
};
