import React from 'react';
import Card from './Card';

function DrawDiscardPiles({
  deck,
  canDraw = false,
  onDrawFromDeck,
  onDrawFromDiscard
}) {
  const drawPileCount = deck?.drawPileCount || 0;
  const topDiscard = deck?.topDiscard;

  return (
    <div className="flex items-center gap-8">
      {/* Draw pile */}
      <div className="relative">
        <button
          onClick={onDrawFromDeck}
          disabled={!canDraw}
          className={`
            relative
            transition-transform duration-200
            ${canDraw ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed opacity-75'}
          `}
        >
          {/* Stack effect */}
          <div className="absolute top-1 left-1 w-20 h-28 bg-indigo-900 rounded-lg" />
          <div className="absolute top-0.5 left-0.5 w-20 h-28 bg-indigo-800 rounded-lg" />

          {/* Top card (face down) */}
          <Card
            card={{ type: 'number', value: 1, color: 'blue' }}
            faceDown
          />

          {/* Card count badge */}
          <div className="absolute -bottom-2 -right-2 bg-gray-700 text-white text-xs px-2 py-1 rounded-full">
            {drawPileCount}
          </div>
        </button>

        <div className="text-center mt-2 text-sm text-gray-400">
          Draw Pile
          {canDraw && <span className="block text-accent-gold text-xs">Click to draw</span>}
        </div>
      </div>

      {/* Discard pile */}
      <div className="relative">
        {topDiscard ? (
          <button
            onClick={onDrawFromDiscard}
            disabled={!canDraw}
            className={`
              transition-transform duration-200
              ${canDraw ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed opacity-75'}
            `}
          >
            <Card
              card={topDiscard}
              draggable={false}
            />
          </button>
        ) : (
          <div className="w-20 h-28 border-2 border-dashed border-white/30 rounded-lg flex items-center justify-center text-gray-500 text-sm">
            Empty
          </div>
        )}

        <div className="text-center mt-2 text-sm text-gray-400">
          Discard Pile
          {canDraw && topDiscard && (
            <span className="block text-accent-gold text-xs">Click to take</span>
          )}
        </div>
      </div>
    </div>
  );
}

// Compact version for smaller displays
export function CompactPiles({ deck, canDraw, onDrawFromDeck, onDrawFromDiscard }) {
  const drawPileCount = deck?.drawPileCount || 0;
  const topDiscard = deck?.topDiscard;

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onDrawFromDeck}
        disabled={!canDraw}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg
          ${canDraw ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-gray-600 opacity-50'}
          transition-colors
        `}
      >
        <span className="text-2xl">🃏</span>
        <span>Draw ({drawPileCount})</span>
      </button>

      <button
        onClick={onDrawFromDiscard}
        disabled={!canDraw || !topDiscard}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg
          ${canDraw && topDiscard ? 'bg-accent-gold/20 hover:bg-accent-gold/30 border border-accent-gold' : 'bg-gray-600 opacity-50'}
          transition-colors
        `}
      >
        {topDiscard ? (
          <>
            <Card card={topDiscard} small />
            <span>Take</span>
          </>
        ) : (
          <span className="text-gray-400">Discard Empty</span>
        )}
      </button>
    </div>
  );
}

export default DrawDiscardPiles;
