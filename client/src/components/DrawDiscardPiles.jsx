import React, { useState, useEffect, useRef } from 'react';
import { useDrop } from 'react-dnd';
import Card, { ItemTypes } from './Card';

function DrawDiscardPiles({
  deck,
  canDraw = false,
  canDiscard = false,
  onDrawFromDeck,
  onDrawFromDiscard,
  onDiscard
}) {
  const drawPileCount = deck?.drawPileCount || 0;
  const topDiscard = deck?.topDiscard;

  // Track deck count changes for animation
  const [deckAnimation, setDeckAnimation] = useState(null);
  const prevCountRef = useRef(drawPileCount);

  useEffect(() => {
    if (prevCountRef.current !== drawPileCount && prevCountRef.current !== 0) {
      const diff = drawPileCount - prevCountRef.current;
      if (diff !== 0) {
        setDeckAnimation(diff < 0 ? 'draw' : 'add');
        const timer = setTimeout(() => setDeckAnimation(null), 500);
        return () => clearTimeout(timer);
      }
    }
    prevCountRef.current = drawPileCount;
  }, [drawPileCount]);

  // Drop zone for discarding cards
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    canDrop: () => canDiscard,
    drop: (item) => {
      if (onDiscard) {
        onDiscard(item.card);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  }), [canDiscard, onDiscard]);

  return (
    <div className="flex items-center gap-4 sm:gap-8">
      {/* Draw pile */}
      <div className="relative">
        <button
          onClick={onDrawFromDeck}
          disabled={!canDraw}
          className={`
            relative
            transition-transform duration-200
            ${canDraw ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'cursor-not-allowed opacity-75'}
          `}
        >
          {/* Stack effect - smaller on mobile */}
          <div className="absolute top-1 left-1 w-16 h-22 sm:w-20 sm:h-28 bg-indigo-900 rounded-lg" />
          <div className="absolute top-0.5 left-0.5 w-16 h-22 sm:w-20 sm:h-28 bg-indigo-800 rounded-lg" />

          {/* Top card (face down) */}
          <Card
            card={{ type: 'number', value: 1, color: 'blue' }}
            faceDown
          />

          {/* Card count badge - animated on change */}
          <div className={`
            absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2
            text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full
            font-bold transition-all duration-300
            ${deckAnimation === 'draw'
              ? 'bg-amber-500 scale-125 animate-pulse'
              : deckAnimation === 'add'
                ? 'bg-green-500 scale-125'
                : 'bg-gray-700'}
          `}>
            {drawPileCount}
          </div>
        </button>

        <div className="text-center mt-1 sm:mt-2 text-xs sm:text-sm text-gray-400">
          Draw
          {canDraw && <span className="block text-accent-gold text-[10px] sm:text-xs">Tap to draw</span>}
        </div>
      </div>

      {/* Discard pile - now a drop target */}
      <div className="relative">
        <div
          ref={drop}
          className={`
            relative transition-all duration-200
            ${isOver && canDrop ? 'scale-110 ring-4 ring-accent-gold rounded-lg' : ''}
            ${canDrop && !isOver ? 'ring-2 ring-dashed ring-accent-gold/50 rounded-lg' : ''}
          `}
        >
          {topDiscard ? (
            <button
              onClick={onDrawFromDiscard}
              disabled={!canDraw || topDiscard.type === 'skip'}
              className={`
                transition-transform duration-200
                ${canDraw && topDiscard.type !== 'skip' ? 'hover:scale-105 active:scale-95 cursor-pointer' : ''}
                ${!canDraw && !canDiscard ? 'cursor-not-allowed opacity-75' : ''}
              `}
            >
              <Card
                card={topDiscard}
                draggable={false}
              />
              {/* Skip card indicator */}
              {topDiscard.type === 'skip' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                  <div className="text-[10px] sm:text-xs text-white bg-red-600/80 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-bold">
                    Can't Take
                  </div>
                </div>
              )}
            </button>
          ) : (
            <div className={`
              w-16 h-22 sm:w-20 sm:h-28 border-2 border-dashed rounded-lg flex items-center justify-center text-xs sm:text-sm
              ${isOver && canDrop ? 'border-accent-gold text-accent-gold bg-accent-gold/10' : 'border-white/30 text-gray-500'}
            `}>
              {isOver && canDrop ? 'Drop!' : 'Empty'}
            </div>
          )}

          {/* Drop indicator overlay */}
          {isOver && canDrop && topDiscard && (
            <div className="absolute inset-0 flex items-center justify-center bg-accent-gold/30 rounded-lg pointer-events-none">
              <span className="text-white font-bold text-xs sm:text-sm bg-accent-gold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                Discard
              </span>
            </div>
          )}
        </div>

        <div className="text-center mt-1 sm:mt-2 text-xs sm:text-sm text-gray-400">
          Discard
          {canDraw && topDiscard && topDiscard.type !== 'skip' && (
            <span className="block text-accent-gold text-[10px] sm:text-xs">Tap to take</span>
          )}
          {canDiscard && (
            <span className="block text-green-400 text-[10px] sm:text-xs">Drop to discard</span>
          )}
          {topDiscard?.type === 'skip' && (
            <span className="block text-red-400 text-[10px] sm:text-xs">Can't take skip</span>
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
