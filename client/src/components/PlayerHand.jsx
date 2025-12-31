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
      } else if (selectedCards.length < maxSelect) {
        // Select
        onCardSelect([...selectedCards, card]);
      }
    }
  }, [disabled, onCardClick, canSelect, onCardSelect, selectedCards, maxSelect]);

  const isSelected = (card) => selectedCards.some(c => c.id === card.id);

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Sort toggle */}
      {showSort && cards.length > 0 && (
        <button
          onClick={cycleSortMode}
          className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300 hover:text-white hover:bg-white/20 transition-colors"
        >
          <span className="text-accent-gold">{getSortLabel()}</span>
          <span className="text-xs text-gray-500">Click to change</span>
        </button>
      )}

      {/* Cards */}
      <div
        className="flex flex-wrap justify-center gap-1 sm:gap-2 p-2"
        style={{ maxWidth: '100%' }}
      >
        {displayCards.map((card, index) => {
          const isHighlighted = card.id === highlightCardId;
          return (
            <div
              key={card.id}
              className={`
                relative transform transition-transform duration-200
                ${isHighlighted ? 'animate-pulse-glow' : ''}
              `}
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              {isHighlighted && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs bg-green-500 text-white px-2 py-0.5 rounded font-bold whitespace-nowrap z-20 shadow-lg">
                  NEW
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

      {/* Selection info */}
      {canSelect && selectedCards.length > 0 && (
        <div className="text-sm text-accent-gold">
          {selectedCards.length} card{selectedCards.length !== 1 ? 's' : ''} selected
          {maxSelect !== Infinity && ` (max ${maxSelect})`}
        </div>
      )}

      {/* Empty hand message */}
      {cards.length === 0 && (
        <div className="text-gray-400 text-center py-8">
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
