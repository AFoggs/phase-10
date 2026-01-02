import React, { useMemo, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import Card, { ItemTypes } from './Card';
import { validateRequirement, validatePhase } from '../utils/phaseValidator';

function PhaseBuilder({
  phaseNumber,
  phaseInfo,
  groups,
  onAddCard,
  onAddCardAtPosition, // New: for inserting at specific position in runs
  onRemoveCard,
  onClearAll,
  onPhaseOut,
  canPhaseOut = true, // Whether phase out button should be enabled (your turn + play phase)
  disabled = false // Whether all interaction is disabled
}) {
  // Validate each group (allowing extra cards that would be valid hits)
  const groupValidations = useMemo(() =>
    groups.map((group, idx) => {
      if (group.length === 0) return { valid: false, reason: 'Empty group' };
      return validateRequirement(group, phaseInfo.requirements[idx], true);
    }),
    [groups, phaseInfo.requirements]
  );

  // Overall phase validation (allowing extra cards)
  const phaseValidation = useMemo(() => {
    if (groups.some(g => g.length === 0)) {
      return { valid: false, reason: 'All groups must have cards' };
    }
    return validatePhase(groups, phaseNumber, true);
  }, [groups, phaseNumber]);

  const hasAnyCards = groups.some(g => g.length > 0);

  // Check if a requirement is a run type
  const isRunType = (req) => {
    return req.type === 'run' ||
      req.type === 'colorRun' ||
      req.type === 'oddRun' ||
      req.type === 'evenRun' ||
      req.type === 'oddColorRun' ||
      req.type === 'evenColorRun';
  };

  return (
    <div className={`
      bg-gradient-to-b from-white/10 to-white/5
      rounded-lg sm:rounded-xl p-2 sm:p-4 border border-white/20
      transition-all duration-300
      ${phaseValidation.valid ? 'ring-2 ring-green-500 shadow-lg shadow-green-500/20' : ''}
    `}>
      {/* Header - responsive layout */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3 sm:mb-4">
        <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3">
          <h3 className="text-base sm:text-lg font-bold text-accent-gold">
            Phase {phaseNumber}
          </h3>
          <span className="text-xs sm:text-sm text-gray-400 truncate max-w-[150px] sm:max-w-none">
            {phaseInfo.name}
          </span>
        </div>

        <div className="flex items-center justify-center gap-2">
          {hasAnyCards && (
            <button
              onClick={onClearAll}
              disabled={disabled}
              className="text-xs sm:text-sm px-2 sm:px-3 py-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
            >
              Clear
            </button>
          )}

          {/* Phase Out button - prominent when valid */}
          <button
            onClick={onPhaseOut}
            disabled={!phaseValidation.valid || !canPhaseOut || disabled}
            className={`
              px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-bold transition-all duration-300
              ${phaseValidation.valid && canPhaseOut
                ? 'bg-green-500 hover:bg-green-400 text-white animate-pulse shadow-lg shadow-green-500/50'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'}
            `}
          >
            Phase Out!
          </button>
        </div>
      </div>

      {/* Drop zones for each requirement - responsive gap */}
      <div className="flex flex-wrap gap-2 sm:gap-4 justify-center">
        {phaseInfo.requirements.map((req, groupIdx) => (
          <BuilderDropZone
            key={groupIdx}
            groupIndex={groupIdx}
            requirement={req}
            cards={groups[groupIdx]}
            validation={groupValidations[groupIdx]}
            onDropCard={(card) => onAddCard(card, groupIdx)}
            onDropCardAtPosition={onAddCardAtPosition ? (card, pos) => onAddCardAtPosition(card, groupIdx, pos) : null}
            onRemoveCard={(cardId) => onRemoveCard(cardId, groupIdx)}
            isRunType={isRunType(req)}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Hint text */}
      {!hasAnyCards && !disabled && (
        <p className="text-center text-gray-500 text-xs sm:text-sm mt-2 sm:mt-3">
          Drag cards here to build your phase
        </p>
      )}

      {/* Not your turn indicator */}
      {!canPhaseOut && !disabled && hasAnyCards && phaseValidation.valid && (
        <p className="text-center text-amber-400 text-xs sm:text-sm mt-2 sm:mt-3">
          Wait for your turn to phase out
        </p>
      )}

      {/* Validation message */}
      {hasAnyCards && !phaseValidation.valid && (
        <p className="text-center text-amber-400 text-xs sm:text-sm mt-2 sm:mt-3">
          {phaseValidation.reason}
        </p>
      )}
    </div>
  );
}

// Drop zone for a single group in the builder - mobile-optimized
function BuilderDropZone({
  groupIndex,
  requirement,
  cards,
  validation,
  onDropCard,
  onDropCardAtPosition,
  onRemoveCard,
  isRunType,
  disabled
}) {
  // Main drop zone (for general drops, adds to end)
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    canDrop: () => !disabled,
    drop: (item, monitor) => {
      // Only handle drop if not dropped on a specific position zone
      if (!monitor.didDrop()) {
        onDropCard(item.card);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
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
        p-2 sm:p-3 rounded-lg border-2 transition-all min-w-[100px] sm:min-w-[120px]
        ${isOver && canDrop ? 'border-accent-gold bg-accent-gold/20 scale-105' :
          isEmpty ? 'border-dashed border-white/30 bg-white/5' :
            isValid ? 'border-green-500 bg-green-500/10' :
              'border-amber-500/50 bg-amber-500/5'}
      `}
    >
      {/* Header */}
      <div className="text-center mb-1 sm:mb-2">
        <span className={`text-[10px] sm:text-xs font-medium ${isValid ? 'text-green-400' : 'text-gray-400'}`}>
          {requirement.label}
        </span>
        <span className="text-[10px] sm:text-xs text-gray-500 ml-1">
          ({cards.length}/{requirement.count})
        </span>
      </div>

      {/* Cards with insertion points for runs */}
      <div className="flex flex-wrap gap-0.5 sm:gap-1 justify-center min-h-[50px] sm:min-h-[60px] items-center">
        {isRunType && cards.length > 0 && onDropCardAtPosition && (
          <InsertionDropZone
            position={0}
            groupIndex={groupIndex}
            onDrop={(card) => onDropCardAtPosition(card, 0)}
            disabled={disabled}
          />
        )}

        {cards.map((card, cardIdx) => (
          <React.Fragment key={card.id}>
            <div className="relative group">
              <Card card={card} small draggable={!disabled} fromBuilder={true} builderGroupIndex={groupIndex} />
              <button
                onClick={() => onRemoveCard(card.id)}
                disabled={disabled}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full text-white text-[10px]
                           opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center
                           hover:bg-red-500 touch-manipulation"
                style={{ opacity: cards.length > 0 ? undefined : 0 }}
              >
                ×
              </button>
            </div>

            {/* Insertion point after each card for runs */}
            {isRunType && onDropCardAtPosition && (
              <InsertionDropZone
                position={cardIdx + 1}
                groupIndex={groupIndex}
                onDrop={(card) => onDropCardAtPosition(card, cardIdx + 1)}
                disabled={disabled}
              />
            )}
          </React.Fragment>
        ))}

        {/* Placeholder slots for remaining cards needed - compact on mobile */}
        {neededCards > 0 && (
          <div className="flex gap-0.5 sm:gap-1">
            {Array.from({ length: Math.min(neededCards, 2) }).map((_, i) => (
              <div
                key={`placeholder-${i}`}
                className={`
                  w-8 h-11 sm:w-10 sm:h-14 border border-dashed rounded flex items-center justify-center text-[10px] sm:text-xs
                  ${isOver && canDrop ? 'border-accent-gold text-accent-gold' : 'border-white/20 text-white/20'}
                `}
              >
                +
              </div>
            ))}
            {neededCards > 2 && (
              <span className="text-[10px] sm:text-xs text-gray-500 self-center">+{neededCards - 2}</span>
            )}
          </div>
        )}
      </div>

      {/* Status indicator - hidden on mobile unless valid */}
      {!isEmpty && (
        <div className="text-center mt-1 hidden sm:block">
          <span className={`text-[10px] sm:text-xs ${isValid ? 'text-green-400' : 'text-amber-400'}`}>
            {isValid ? '✓' : validation?.reason || '...'}
          </span>
        </div>
      )}
      {/* Compact valid indicator on mobile */}
      {!isEmpty && isValid && (
        <div className="text-center mt-1 sm:hidden">
          <span className="text-green-400 text-[10px]">✓</span>
        </div>
      )}
    </div>
  );
}

// Small drop zone for inserting cards at specific positions in runs
function InsertionDropZone({ position, groupIndex, onDrop, disabled }) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    canDrop: () => !disabled,
    drop: (item) => {
      onDrop(item.card);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  }), [onDrop, disabled, position, groupIndex]);

  return (
    <div
      ref={drop}
      className={`
        w-2 sm:w-3 h-10 sm:h-12 flex items-center justify-center transition-all
        ${isOver && canDrop
          ? 'bg-accent-gold/50 w-6 sm:w-8 rounded'
          : 'hover:bg-white/10'}
      `}
      title={`Insert at position ${position + 1}`}
    >
      {isOver && canDrop && (
        <span className="text-accent-gold text-xs font-bold">+</span>
      )}
    </div>
  );
}

export default PhaseBuilder;
