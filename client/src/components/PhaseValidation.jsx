import React, { useState, useCallback, useMemo } from 'react';
import { useDrop } from 'react-dnd';
import Card, { ItemTypes, CardPlaceholder } from './Card';
import { validateRequirement, validatePhase } from '../utils/phaseValidator';
import { sortHand } from '../utils/cardHelpers';

function PhaseValidation({
  phaseNumber,
  phaseInfo,
  hand,
  sortMode = 'color',
  onSubmit,
  onCancel
}) {
  // State for each group's cards
  const [groups, setGroups] = useState(() =>
    phaseInfo.requirements.map(() => [])
  );

  // Cards remaining in hand (not placed in groups)
  const usedCardIds = useMemo(() =>
    new Set(groups.flat().map(c => c.id)),
    [groups]
  );

  // Use the same sort mode as player's hand
  const remainingHand = useMemo(() =>
    sortHand(hand.filter(c => !usedCardIds.has(c.id)), sortMode),
    [hand, usedCardIds, sortMode]
  );

  // Validate each group
  const groupValidations = useMemo(() =>
    groups.map((group, idx) => {
      if (group.length === 0) return { valid: false, reason: 'Empty group' };
      return validateRequirement(group, phaseInfo.requirements[idx]);
    }),
    [groups, phaseInfo.requirements]
  );

  // Overall phase validation
  const phaseValidation = useMemo(() => {
    if (groups.some(g => g.length === 0)) {
      return { valid: false, reason: 'All groups must have cards' };
    }
    return validatePhase(groups, phaseNumber);
  }, [groups, phaseNumber]);

  // Add card to group
  const addCardToGroup = useCallback((card, groupIndex) => {
    // Remove from other groups first
    setGroups(prev => prev.map((group, idx) => {
      if (idx === groupIndex) {
        // Add to this group if not already there
        if (!group.find(c => c.id === card.id)) {
          return [...group, card];
        }
        return group;
      }
      // Remove from other groups
      return group.filter(c => c.id !== card.id);
    }));
  }, []);

  // Remove card from group
  const removeCardFromGroup = useCallback((cardId, groupIndex) => {
    setGroups(prev => prev.map((group, idx) => {
      if (idx === groupIndex) {
        return group.filter(c => c.id !== cardId);
      }
      return group;
    }));
  }, []);

  // Clear all groups
  const clearAll = useCallback(() => {
    setGroups(phaseInfo.requirements.map(() => []));
  }, [phaseInfo.requirements]);

  // Auto-fill (attempt to automatically place cards)
  const autoFill = useCallback(() => {
    // This is a simplified auto-fill - a more sophisticated version
    // would try to find valid combinations
    clearAll();
  }, [clearAll]);

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (phaseValidation.valid) {
      onSubmit(groups);
    }
  }, [phaseValidation.valid, groups, onSubmit]);

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold">Build Phase {phaseNumber}</h2>
            <p className="text-gray-400">{phaseInfo.name}</p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Drop zones for each requirement */}
        <div className="space-y-6 mb-6">
          {phaseInfo.requirements.map((req, groupIdx) => (
            <GroupDropZone
              key={groupIdx}
              groupIndex={groupIdx}
              requirement={req}
              cards={groups[groupIdx]}
              validation={groupValidations[groupIdx]}
              onDropCard={(card) => addCardToGroup(card, groupIdx)}
              onRemoveCard={(cardId) => removeCardFromGroup(cardId, groupIdx)}
            />
          ))}
        </div>

        {/* Validation message */}
        {!phaseValidation.valid && groups.some(g => g.length > 0) && (
          <div className="bg-red-600/20 border border-red-600 rounded-lg p-4 mb-6">
            <p className="text-red-400">{phaseValidation.reason}</p>
          </div>
        )}

        {/* Remaining cards in hand */}
        <div className="border-t border-white/10 pt-6 mb-6">
          <h3 className="text-sm text-gray-400 mb-3">
            Your cards (drag to place, or click to select):
          </h3>
          <div className="flex flex-wrap gap-2">
            {remainingHand.map(card => (
              <Card
                key={card.id}
                card={card}
                small
                draggable
              />
            ))}
            {remainingHand.length === 0 && (
              <p className="text-gray-500 text-sm">All cards placed</p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between">
          <div className="flex gap-2">
            <button
              onClick={clearAll}
              className="btn-secondary"
            >
              Clear All
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!phaseValidation.valid}
              className="btn-primary"
            >
              Lay Down Phase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Drop zone for a single group
function GroupDropZone({
  groupIndex,
  requirement,
  cards,
  validation,
  onDropCard,
  onRemoveCard
}) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: (item) => {
      onDropCard(item.card);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  }), [onDropCard]);

  const isEmpty = cards.length === 0;
  const isValid = validation?.valid;

  return (
    <div
      ref={drop}
      className={`
        p-4 rounded-lg border-2 transition-all
        ${isOver ? 'border-accent-gold bg-accent-gold/10' :
          canDrop ? 'border-white/30' :
            isEmpty ? 'border-dashed border-white/20' :
              isValid ? 'border-green-500 bg-green-500/10' :
                'border-red-500/50 bg-red-500/5'}
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="font-medium">{requirement.label}</span>
          <span className="text-xs text-gray-400">
            ({cards.length}/{requirement.count} cards)
          </span>
        </div>
        {!isEmpty && (
          <span className={`text-xs ${isValid ? 'text-green-500' : 'text-red-400'}`}>
            {isValid ? '✓ Valid' : validation?.reason || 'Invalid'}
          </span>
        )}
      </div>

      {/* Cards */}
      <div className="flex flex-wrap gap-2 min-h-[80px]">
        {cards.map(card => (
          <div key={card.id} className="relative group">
            <Card card={card} small draggable />
            <button
              onClick={() => onRemoveCard(card.id)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        ))}

        {/* Placeholder slots */}
        {Array.from({ length: Math.max(0, requirement.count - cards.length) }).map((_, i) => (
          <CardPlaceholder key={`placeholder-${i}`} small label="Drop card" />
        ))}
      </div>
    </div>
  );
}

export default PhaseValidation;
