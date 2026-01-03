import React, { useState, useCallback } from 'react';
import Card from './Card';
import { sortByColor, sortByNumber } from '../utils/cardHelpers';

function PlayerHand({
  cards,
  selectedCards = [],
  onCardSelect,
  onCardClick,
  disabled = false,
  canSelect = true,
  maxSelect = Infinity,
  showSort = true,
  highlightCardId = null,
  hittableCardIds = new Set(),
  onSortModeChange = null
}) {
  // 'color' = by color then number, 'number' = by number then color
  const [sortMode, setSortMode] = useState('color');

  const getDisplayCards = () => {
    switch (sortMode) {
      case 'color':
        return sortByColor(cards);
      case 'number':
        return sortByNumber(cards);
      default:
        return sortByColor(cards);
    }
  };

  const displayCards = getDisplayCards();

  const cycleSortMode = () => {
    // Toggle between color and number only
    const newMode = sortMode === 'color' ? 'number' : 'color';
    setSortMode(newMode);
    if (onSortModeChange) {
      onSortModeChange(newMode);
    }
  };

  const getSortLabel = () => {
    return sortMode === 'color' ? 'Sorted by Color' : 'Sorted by Number';
  };

  const handleCardClick = useCallback((card) => {
    if (disabled) return;

    if (onCardClick) {
      onCardClick(card);
      return;
    }

    if (canSelect && onCardSelect) {
      const isSelected = selectedCards.some(c => c.id === card.id);

      if (isSelected) {
        // Deselect
        onCardSelect(selectedCards.filter(c => c.id !== card.id));
      } else if (maxSelect === 1) {
        // When max is 1, replace the selection (no need to deselect first)
        onCardSelect([card]);
      } else if (selectedCards.length < maxSelect) {
        // Add to selection
        onCardSelect([...selectedCards, card]);
      }
    }
  }, [disabled, onCardClick, canSelect, onCardSelect, selectedCards, maxSelect]);

  const isSelected = (card) => selectedCards.some(c => c.id === card.id);

  return (
    <div className="flex flex-col items-center gap-1 sm:gap-2">
      {/* Sort toggle - compact on mobile */}
      {showSort && cards.length > 0 && (
        <button
          onClick={cycleSortMode}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 bg-white/10 rounded-full text-xs sm:text-sm text-gray-300 hover:text-white hover:bg-white/20 transition-colors active:scale-95"
        >
          <span className="text-accent-gold">{getSortLabel()}</span>
          <span className="text-[10px] sm:text-xs text-gray-500 hidden sm:inline">Click to change</span>
          <span className="text-gray-500 sm:hidden">↻</span>
        </button>
      )}

      {/* Cards - more compact on mobile */}
      <div
        className="flex flex-wrap justify-center gap-0.5 sm:gap-2 p-1 sm:p-2"
        style={{ maxWidth: '100%' }}
      >
        {displayCards.map((card, index) => {
          const isHighlighted = card.id === highlightCardId;
          const isHittable = hittableCardIds.has(card.id);
          return (
            <div
              key={card.id}
              className={`
                relative transform transition-transform duration-200
                ${isHighlighted ? 'animate-pulse-glow' : ''}
                ${isHittable ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-transparent rounded-lg shadow-[0_0_10px_rgba(34,211,238,0.5)]' : ''}
              `}
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              {isHighlighted && (
                <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs bg-green-500 text-white px-1.5 sm:px-2 py-0.5 rounded font-bold whitespace-nowrap z-20 shadow-lg">
                  NEW
                </div>
              )}
              {isHittable && !isHighlighted && (
                <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs bg-cyan-500 text-white px-1.5 sm:px-2 py-0.5 rounded font-bold whitespace-nowrap z-20 shadow-lg">
                  HIT
                </div>
              )}
              <Card
                card={card}
                index={index}
                selected={isSelected(card)}
                highlighted={isHighlighted}
                onClick={() => handleCardClick(card)}
                disabled={disabled}
                draggable={!disabled && canSelect}
              />
            </div>
          );
        })}
      </div>

      {/* Selection info - compact on mobile */}
      {canSelect && selectedCards.length > 0 && (
        <div className="text-xs sm:text-sm text-accent-gold">
          {selectedCards.length} selected
        </div>
      )}

      {/* Empty hand message */}
      {cards.length === 0 && (
        <div className="text-gray-400 text-center py-4 sm:py-8 text-sm">
          No cards in hand
        </div>
      )}
    </div>
  );
}

// Compact hand display for other players
export function CompactHand({ cardCount, isCurrentTurn = false }) {
  return (
    <div className={`flex items-center gap-1 ${isCurrentTurn ? 'current-turn rounded-lg p-2' : ''}`}>
      {Array.from({ length: Math.min(cardCount, 10) }).map((_, i) => (
        <div
          key={i}
          className="w-4 h-6 bg-gradient-to-br from-indigo-800 to-purple-900 rounded border border-indigo-400"
          style={{
            marginLeft: i > 0 ? '-8px' : '0',
            zIndex: i
          }}
        />
      ))}
      {cardCount > 10 && (
        <span className="text-xs text-gray-400 ml-1">+{cardCount - 10}</span>
      )}
      <span className="ml-2 text-sm text-gray-300">{cardCount} cards</span>
    </div>
  );
}

// Fan-style hand for more visual appeal
export function FanHand({
  cards,
  selectedCards = [],
  onCardSelect,
  disabled = false,
  maxWidth = 600
}) {
  const cardCount = cards.length;
  const maxSpread = 15; // Max degrees between cards
  const totalSpread = Math.min(cardCount * 8, 120);

  return (
    <div
      className="relative flex justify-center items-end"
      style={{ height: '150px', width: maxWidth }}
    >
      {cards.map((card, index) => {
        const centerOffset = index - (cardCount - 1) / 2;
        const rotation = centerOffset * (totalSpread / cardCount);
        const translateY = Math.abs(centerOffset) * 2;
        const isSelected = selectedCards.some(c => c.id === card.id);

        return (
          <div
            key={card.id}
            className="absolute transition-all duration-200 hover:z-50"
            style={{
              transform: `
                rotate(${rotation}deg)
                translateY(${isSelected ? translateY - 20 : translateY}px)
              `,
              zIndex: isSelected ? 100 : index,
              left: `${50 + centerOffset * 25}%`,
              transformOrigin: 'bottom center'
            }}
          >
            <Card
              card={card}
              index={index}
              selected={isSelected}
              onClick={() => {
                if (!disabled && onCardSelect) {
                  const newSelected = isSelected
                    ? selectedCards.filter(c => c.id !== card.id)
                    : [...selectedCards, card];
                  onCardSelect(newSelected);
                }
              }}
              disabled={disabled}
              draggable={!disabled}
            />
          </div>
        );
      })}
    </div>
  );
}

export default PlayerHand;
