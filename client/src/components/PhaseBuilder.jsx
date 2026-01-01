import React, { useMemo, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import Card, { ItemTypes, CardPlaceholder } from './Card';
import { validateRequirement, validatePhase } from '../utils/phaseValidator';

function PhaseBuilder({
  phaseNumber,
  phaseInfo,
  groups,
  onAddCard,
  onRemoveCard,
  onClearAll,
  onPhaseOut,
  disabled = false
}) {
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

  const hasAnyCards = groups.some(g => g.length > 0);

  return (
    <div className={`
      bg-gradient-to-b from-white/10 to-white/5
      rounded-xl p-4 border border-white/20
      transition-all duration-300
      ${phaseValidation.valid ? 'ring-2 ring-green-500 shadow-lg shadow-green-500/20' : ''}
    `}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-accent-gold">
            Phase {phaseNumber}
          </h3>
          <span className="text-sm text-gray-400">{phaseInfo.name}</span>
        </div>

        <div className="flex items-center gap-2">
          {hasAnyCards && (
            <button
              onClick={onClearAll}
              disabled={disabled}
              className="text-sm px-3 py-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
            >
              Clear
            </button>
          )}

          {/* Phase Out button - prominent when valid */}
          <button
            onClick={onPhaseOut}
            disabled={!phaseValidation.valid || disabled}
            className={`
              px-6 py-2 rounded-lg font-bold transition-all duration-300
              ${phaseValidation.valid
                ? 'bg-green-500 hover:bg-green-400 text-white animate-pulse shadow-lg shadow-green-500/50'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'}
            `}
          >
            Phase Out!
          </button>
        </div>
      </div>

      {/* Drop zones for each requirement */}
      <div className="flex flex-wrap gap-4 justify-center">
        {phaseInfo.requirements.map((req, groupIdx) => (
          <BuilderDropZone
            key={groupIdx}
            groupIndex={groupIdx}
            requirement={req}
            cards={groups[groupIdx]}
            validation={groupValidations[groupIdx]}
            onDropCard={(card) => onAddCard(card, groupIdx)}
            onRemoveCard={(cardId) => onRemoveCard(cardId, groupIdx)}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Hint text */}
      {!hasAnyCards && !disabled && (
        <p className="text-center text-gray-500 text-sm mt-3">
          Drag cards here to build your phase
        </p>
      )}

      {/* Validation message */}
      {hasAnyCards && !phaseValidation.valid && (
        <p className="text-center text-amber-400 text-sm mt-3">
          {phaseValidation.reason}
        </p>
      )}
    </div>
  );
}

// Drop zone for a single group in the builder
function BuilderDropZone({
  groupIndex,
  requirement,
  cards,
  validation,
  onDropCard,
  onRemoveCard,
  disabled
}) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    canDrop: () => !disabled,
    drop: (item) => {
      onDropCard(item.card);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  }), [onDropCard, disabled]);

  const isEmpty = cards.length === 0;
  const isValid = validation?.valid;
  const neededCards = Math.max(0, requirement.count - cards.length);

  return (
    <div
      ref={drop}
      className={`
        p-3 rounded-lg border-2 transition-all min-w-[120px]
        ${isOver && canDrop ? 'border-accent-gold bg-accent-gold/20 scale-105' :
          isEmpty ? 'border-dashed border-white/30 bg-white/5' :
            isValid ? 'border-green-500 bg-green-500/10' :
              'border-amber-500/50 bg-amber-500/5'}
      `}
    >
      {/* Header */}
      <div className="text-center mb-2">
        <span className={`text-xs font-medium ${isValid ? 'text-green-400' : 'text-gray-400'}`}>
          {requirement.label}
        </span>
        <span className="text-xs text-gray-500 ml-1">
          ({cards.length}/{requirement.count})
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-wrap gap-1 justify-center min-h-[60px] items-center">
        {cards.map(card => (
          <div key={card.id} className="relative group">
            <Card card={card} small draggable={!disabled} />
            <button
              onClick={() => onRemoveCard(card.id)}
              disabled={disabled}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full text-white text-xs
                         opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center
                         hover:bg-red-500"
            >
              x
            </button>
          </div>
        ))}

        {/* Placeholder slots for remaining cards needed */}
        {neededCards > 0 && (
          <div className="flex gap-1">
            {Array.from({ length: Math.min(neededCards, 3) }).map((_, i) => (
              <div
                key={`placeholder-${i}`}
                className={`
                  w-10 h-14 border border-dashed rounded flex items-center justify-center text-xs
                  ${isOver && canDrop ? 'border-accent-gold text-accent-gold' : 'border-white/20 text-white/20'}
                `}
              >
                +
              </div>
            ))}
            {neededCards > 3 && (
              <span className="text-xs text-gray-500 self-center">+{neededCards - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Status indicator */}
      {!isEmpty && (
        <div className="text-center mt-1">
          <span className={`text-xs ${isValid ? 'text-green-400' : 'text-amber-400'}`}>
            {isValid ? 'Valid!' : validation?.reason || 'Keep going...'}
          </span>
        </div>
      )}
    </div>
  );
}

export default PhaseBuilder;
