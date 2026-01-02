import { PHASES } from './phaseDefinitions';

// Validate a set (cards of the same number)
// allowExtras: if true, allows more cards than requiredCount as long as they match
export function validateSet(cards, requiredCount, allowExtras = false) {
  if (allowExtras) {
    if (cards.length < requiredCount) {
      return { valid: false, reason: `Need at least ${requiredCount} cards` };
    }
  } else {
    if (cards.length !== requiredCount) {
      return { valid: false, reason: `Need exactly ${requiredCount} cards` };
    }
  }

  const numberCards = cards.filter(c => c.type === 'number');
  const wildCount = cards.filter(c => c.type === 'wild').length;

  if (numberCards.length === 0 && wildCount > 0) {
    return { valid: true };
  }

  const values = numberCards.map(c => c.value);
  const uniqueValues = [...new Set(values)];

  if (uniqueValues.length > 1) {
    return { valid: false, reason: 'All cards must have the same number' };
  }

  if (cards.some(c => c.type === 'skip')) {
    return { valid: false, reason: 'Skip cards cannot be used in sets' };
  }

  return { valid: true, setValue: uniqueValues[0] };
}

// Validate a run (consecutive numbers)
// allowExtras: if true, allows more cards than requiredCount if they extend the run
export function validateRun(cards, requiredCount, allowExtras = false) {
  if (allowExtras) {
    if (cards.length < requiredCount) {
      return { valid: false, reason: `Need at least ${requiredCount} cards` };
    }
  } else {
    if (cards.length !== requiredCount) {
      return { valid: false, reason: `Need exactly ${requiredCount} cards` };
    }
  }

  if (cards.some(c => c.type === 'skip')) {
    return { valid: false, reason: 'Skip cards cannot be used in runs' };
  }

  const numberCards = cards.filter(c => c.type === 'number');
  const wildCount = cards.filter(c => c.type === 'wild').length;

  if (numberCards.length === 0 && wildCount > 0) {
    return { valid: true };
  }

  const values = numberCards.map(c => c.value).sort((a, b) => a - b);

  // Check for duplicates
  const valueSet = new Set(values);
  if (valueSet.size !== values.length) {
    return { valid: false, reason: 'Runs cannot have duplicate numbers' };
  }

  const minVal = values[0];
  const maxVal = values[values.length - 1];
  const actualLength = cards.length;

  // The range shouldn't exceed the actual card count
  if (maxVal - minVal + 1 > actualLength) {
    return { valid: false, reason: 'Cards are too spread out to form a run' };
  }

  // Check if we can form a valid run with the wilds filling gaps
  // For extra cards, the run just needs to be longer
  for (let start = Math.max(1, minVal - wildCount); start <= Math.min(12 - actualLength + 1, minVal); start++) {
    const end = start + actualLength - 1;
    if (end > 12) continue;

    let wildsNeeded = 0;
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

// Validate color group
export function validateColor(cards, requiredCount, allowExtras = false) {
  if (allowExtras) {
    if (cards.length < requiredCount) {
      return { valid: false, reason: `Need at least ${requiredCount} cards` };
    }
  } else {
    if (cards.length !== requiredCount) {
      return { valid: false, reason: `Need exactly ${requiredCount} cards` };
    }
  }

  if (cards.some(c => c.type === 'skip')) {
    return { valid: false, reason: 'Skip cards cannot be used in color groups' };
  }

  const numberCards = cards.filter(c => c.type === 'number');
  const wildCount = cards.filter(c => c.type === 'wild').length;

  if (numberCards.length === 0 && wildCount > 0) {
    return { valid: true };
  }

  const colors = numberCards.map(c => c.color);
  const uniqueColors = [...new Set(colors)];

  if (uniqueColors.length > 1) {
    return { valid: false, reason: 'All cards must be the same color' };
  }

  return { valid: true, color: uniqueColors[0] };
}

// Validate color run
export function validateColorRun(cards, requiredCount, allowExtras = false) {
  const runResult = validateRun(cards, requiredCount, allowExtras);
  if (!runResult.valid) return runResult;

  // For color validation, use the actual card count
  const colorResult = validateColor(cards, cards.length, true);
  if (!colorResult.valid) {
    return { valid: false, reason: 'Color run must be all the same color' };
  }

  return { valid: true, ...runResult, ...colorResult };
}

// Validate odd run
export function validateOddRun(cards, requiredCount, allowExtras = false) {
  if (allowExtras) {
    if (cards.length < requiredCount) {
      return { valid: false, reason: `Need at least ${requiredCount} cards` };
    }
  } else {
    if (cards.length !== requiredCount) {
      return { valid: false, reason: `Need exactly ${requiredCount} cards` };
    }
  }

  if (cards.some(c => c.type === 'skip')) {
    return { valid: false, reason: 'Skip cards cannot be used' };
  }

  const numberCards = cards.filter(c => c.type === 'number');
  const wildCount = cards.filter(c => c.type === 'wild').length;

  for (const card of numberCards) {
    if (card.value % 2 === 0) {
      return { valid: false, reason: 'All cards must be odd numbers' };
    }
  }

  const oddSequence = [1, 3, 5, 7, 9, 11];
  const values = numberCards.map(c => c.value).sort((a, b) => a - b);

  if (new Set(values).size !== values.length) {
    return { valid: false, reason: 'Cannot have duplicate numbers' };
  }

  if (values.length === 0) return { valid: true };

  const indices = values.map(v => oddSequence.indexOf(v));
  const minIdx = Math.min(...indices);
  const maxIdx = Math.max(...indices);
  const actualLength = cards.length;

  if (maxIdx - minIdx + 1 > actualLength) {
    return { valid: false, reason: 'Odd numbers are not consecutive' };
  }

  let wildsNeeded = 0;
  for (let i = minIdx; i <= Math.min(minIdx + actualLength - 1, 5); i++) {
    if (!values.includes(oddSequence[i])) {
      wildsNeeded++;
    }
  }

  if (wildsNeeded > wildCount) {
    return { valid: false, reason: 'Not enough wilds to complete the odd run' };
  }

  return { valid: true };
}

// Validate even run
export function validateEvenRun(cards, requiredCount, allowExtras = false) {
  if (allowExtras) {
    if (cards.length < requiredCount) {
      return { valid: false, reason: `Need at least ${requiredCount} cards` };
    }
  } else {
    if (cards.length !== requiredCount) {
      return { valid: false, reason: `Need exactly ${requiredCount} cards` };
    }
  }

  if (cards.some(c => c.type === 'skip')) {
    return { valid: false, reason: 'Skip cards cannot be used' };
  }

  const numberCards = cards.filter(c => c.type === 'number');
  const wildCount = cards.filter(c => c.type === 'wild').length;

  for (const card of numberCards) {
    if (card.value % 2 !== 0) {
      return { valid: false, reason: 'All cards must be even numbers' };
    }
  }

  const evenSequence = [2, 4, 6, 8, 10, 12];
  const values = numberCards.map(c => c.value).sort((a, b) => a - b);

  if (new Set(values).size !== values.length) {
    return { valid: false, reason: 'Cannot have duplicate numbers' };
  }

  if (values.length === 0) return { valid: true };

  const indices = values.map(v => evenSequence.indexOf(v));
  const minIdx = Math.min(...indices);
  const maxIdx = Math.max(...indices);
  const actualLength = cards.length;

  if (maxIdx - minIdx + 1 > actualLength) {
    return { valid: false, reason: 'Even numbers are not consecutive' };
  }

  let wildsNeeded = 0;
  for (let i = minIdx; i <= Math.min(minIdx + actualLength - 1, 5); i++) {
    if (!values.includes(evenSequence[i])) {
      wildsNeeded++;
    }
  }

  if (wildsNeeded > wildCount) {
    return { valid: false, reason: 'Not enough wilds to complete the even run' };
  }

  return { valid: true };
}

// Validate odd color run
export function validateOddColorRun(cards, requiredCount, allowExtras = false) {
  const oddResult = validateOddRun(cards, requiredCount, allowExtras);
  if (!oddResult.valid) return oddResult;

  const colorResult = validateColor(cards, cards.length, true);
  if (!colorResult.valid) {
    return { valid: false, reason: 'Odd run must be all the same color' };
  }

  return { valid: true };
}

// Validate even color run
export function validateEvenColorRun(cards, requiredCount, allowExtras = false) {
  const evenResult = validateEvenRun(cards, requiredCount, allowExtras);
  if (!evenResult.valid) return evenResult;

  const colorResult = validateColor(cards, cards.length, true);
  if (!colorResult.valid) {
    return { valid: false, reason: 'Even run must be all the same color' };
  }

  return { valid: true };
}

// Validate color set
export function validateColorSet(cards, requiredCount, allowExtras = false) {
  const setResult = validateSet(cards, requiredCount, allowExtras);
  if (!setResult.valid) return setResult;

  const colorResult = validateColor(cards, cards.length, true);
  if (!colorResult.valid) {
    return { valid: false, reason: 'Set must be all the same color' };
  }

  return { valid: true };
}

// Validate a single requirement
// allowExtras: if true, allows more cards than minimum if they're valid extensions
export function validateRequirement(cards, requirement, allowExtras = false) {
  switch (requirement.type) {
    case 'set':
      return validateSet(cards, requirement.count, allowExtras);
    case 'run':
      return validateRun(cards, requirement.count, allowExtras);
    case 'color':
      return validateColor(cards, requirement.count, allowExtras);
    case 'colorRun':
      return validateColorRun(cards, requirement.count, allowExtras);
    case 'oddRun':
      return validateOddRun(cards, requirement.count, allowExtras);
    case 'evenRun':
      return validateEvenRun(cards, requirement.count, allowExtras);
    case 'oddColorRun':
      return validateOddColorRun(cards, requirement.count, allowExtras);
    case 'evenColorRun':
      return validateEvenColorRun(cards, requirement.count, allowExtras);
    case 'colorSet':
      return validateColorSet(cards, requirement.count, allowExtras);
    default:
      return { valid: false, reason: `Unknown requirement type: ${requirement.type}` };
  }
}

// Validate complete phase
// allowExtras: if true, allows extra cards in groups that are valid extensions
export function validatePhase(cardGroups, phaseNumber, allowExtras = false) {
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

  for (let i = 0; i < cardGroups.length; i++) {
    const result = validateRequirement(cardGroups[i], phase.requirements[i], allowExtras);
    if (!result.valid) {
      return {
        valid: false,
        reason: `Group ${i + 1}: ${result.reason}`,
        groupIndex: i
      };
    }
  }

  // When allowing extras, check total is at least the minimum required
  const totalCards = cardGroups.reduce((sum, group) => sum + group.length, 0);
  if (allowExtras) {
    if (totalCards < phase.totalCards) {
      return {
        valid: false,
        reason: `Phase requires at least ${phase.totalCards} cards total, got ${totalCards}`
      };
    }
  } else {
    if (totalCards !== phase.totalCards) {
      return {
        valid: false,
        reason: `Phase requires ${phase.totalCards} cards total, got ${totalCards}`
      };
    }
  }

  const allCardIds = cardGroups.flat().map(c => c.id);
  if (new Set(allCardIds).size !== allCardIds.length) {
    return { valid: false, reason: 'Same card cannot be used in multiple groups' };
  }

  return { valid: true, phase: phaseNumber, phaseName: phase.name };
}

export default {
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
  validatePhase
};
